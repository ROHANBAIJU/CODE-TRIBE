import torch
import torch.nn as nn
import numpy as np
import cv2
import os
import time
from collections import deque, defaultdict
from typing import List, Dict, Tuple
from torchvision.models import resnet50, ResNet50_Weights


class FeatureExtractor:
    """Extract features from image regions using ResNet50"""
    def __init__(self, device='cpu'):
        self.device = device
        weights = ResNet50_Weights.DEFAULT
        resnet = resnet50(weights=weights)
        # Remove final classification layer
        self.model = torch.nn.Sequential(*list(resnet.children())[:-1])
        self.model.eval()
        self.model.to(device)
        
        # Preprocessing
        self.preprocess = weights.transforms()
        
    def extract(self, frame: np.ndarray, bbox: List[float]) -> np.ndarray:
        """
        Extract 2048-dim features from bbox region
        Args:
            frame: (H, W, 3) BGR image
            bbox: [x1, y1, x2, y2] in pixel coordinates
        Returns:
            features: (2048,) numpy array
        """
        x1, y1, x2, y2 = map(int, bbox)
        h, w = frame.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        # Extract ROI
        roi = frame[y1:y2, x1:x2]
        if roi.size == 0:
            return np.zeros(2048)
        
        # Convert BGR to RGB
        roi_rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
        
        # Preprocess
        from PIL import Image
        roi_pil = Image.fromarray(roi_rgb)
        input_tensor = self.preprocess(roi_pil).unsqueeze(0).to(self.device)
        
        # Extract features
        with torch.no_grad():
            features = self.model(input_tensor).squeeze().cpu().numpy()
        
        return features


class MultiTaskTemporalRNN(nn.Module):
    """
    Multi-Task RNN for:
    1. Object Tracking (LSTM) - Generate embeddings for tracking
    2. Activity Recognition (GRU) - Classify object activities
    3. Anomaly Detection (LSTM) - Detect unusual patterns
    """
    def __init__(self, 
                 num_classes: int = 2,
                 sequence_length: int = 16,
                 feature_dim: int = 2048):
        super().__init__()
        
        self.sequence_length = sequence_length
        self.feature_dim = feature_dim
        
        # Shared feature compression
        self.feature_compressor = nn.Sequential(
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        
        # Task 1: Object Tracking LSTM
        self.tracker_lstm = nn.LSTM(
            input_size=512,
            hidden_size=256,
            num_layers=2,
            batch_first=True,
            dropout=0.3
        )
        self.tracker_fc = nn.Linear(256, 128)
        
        # Task 2: Activity Recognition GRU
        self.activity_gru = nn.GRU(
            input_size=512,
            hidden_size=256,
            num_layers=2,
            batch_first=True,
            dropout=0.3
        )
        self.activity_classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 5)
        )
        
        # Task 3: Anomaly Detection LSTM
        self.anomaly_lstm = nn.LSTM(
            input_size=512,
            hidden_size=128,
            num_layers=2,
            batch_first=True,
            dropout=0.3
        )
        self.anomaly_fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        batch_size, seq_len, _ = x.shape
        x_flat = x.view(-1, self.feature_dim)
        x_compressed = self.feature_compressor(x_flat)
        x_compressed = x_compressed.view(batch_size, seq_len, -1)
        
        lstm_out, _ = self.tracker_lstm(x_compressed)
        tracking_embeddings = self.tracker_fc(lstm_out[:, -1, :])
        
        gru_out, _ = self.activity_gru(x_compressed)
        activity_logits = self.activity_classifier(gru_out[:, -1, :])
        
        anomaly_out, _ = self.anomaly_lstm(x_compressed)
        anomaly_scores = self.anomaly_fc(anomaly_out[:, -1, :])
        
        return {
            'tracking_embeddings': tracking_embeddings,
            'activity_logits': activity_logits,
            'anomaly_scores': anomaly_scores.squeeze()
        }


class TemporalBuffer:
    """Manages frame sequences for RNN processing"""
    def __init__(self, sequence_length: int = 16):
        self.sequence_length = sequence_length
        self.buffer = deque(maxlen=sequence_length)
        
    def add_frame(self, features: np.ndarray):
        self.buffer.append(features)
        
    def get_sequence(self) -> np.ndarray:
        if len(self.buffer) < self.sequence_length:
            padding = [np.zeros_like(self.buffer[0])] * (self.sequence_length - len(self.buffer))
            return np.stack(list(padding) + list(self.buffer))
        return np.stack(list(self.buffer))
    
    def is_ready(self) -> bool:
        return len(self.buffer) >= self.sequence_length // 2


# ============================================
# ENHANCED: RNNTemporal with EMA Smoothing
# ============================================

class RNNTemporal:
    """
    Enhanced RNN Temporal class with Exponential Moving Average
    Provides smooth, continuous confidence growth over time
    """
    def __init__(self, model_path: str = None, sequence_length: int = 5, conf_threshold: float = 0.5):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.sequence_length = sequence_length
        self.conf_threshold = conf_threshold
        
        # Load model if available (optional for now)
        self.model = None
        if model_path and os.path.exists(model_path):
            try:
                self.model = MultiTaskTemporalRNN().to(self.device)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.eval()
                print(f"✅ Loaded RNN model from {model_path}")
            except Exception as e:
                print(f"⚠️  Failed to load RNN model: {e}")
                self.model = None
        
        # Track history for each object
        self.track_history = defaultdict(list)
        self.track_ages = defaultdict(int)
        
        # NEW: Exponential Moving Average for smooth confidence
        self.confidence_ema = defaultdict(lambda: None)
        self.ema_alpha = 0.3  # Smoothing factor (0.3 = 30% new, 70% old)
        
        # NEW: Track confidence trend (increasing/decreasing)
        self.confidence_trend = defaultdict(list)
        
        # Activity labels
        self.activity_labels = ['stationary', 'being_moved', 'obstructed', 'missing', 'normal']
        
    def process_detections(self, detections: List[Dict]) -> List[Dict]:
        """
        Process detections and update temporal confidence with EMA smoothing
        """
        enhanced_detections = []
        current_time = time.time()
        
        for det in detections:
            class_name = det.get('class', 'unknown')
            confidence = det.get('confidence', 0.0)
            bbox = det.get('bbox', [0, 0, 0, 0])
            
            # Generate tracking ID based on class and position
            track_id = self._get_track_id(class_name, bbox)
            
            # Update tracking history
            self.track_history[track_id].append({
                'time': current_time,
                'confidence': confidence,
                'bbox': bbox
            })
            
            # Keep only recent history
            if len(self.track_history[track_id]) > self.sequence_length:
                self.track_history[track_id].pop(0)
            
            # Update track age
            self.track_ages[track_id] += 1
            
            # Calculate temporal confidence with EMA
            temporal_conf = self._calculate_temporal_confidence_ema(track_id, confidence)
            
            # Calculate confidence trend
            trend = self._calculate_confidence_trend(track_id)
            
            # Create enhanced detection
            enhanced_det = {
                **det,
                'confidence': temporal_conf,
                'track_id': track_id,
                'track_age': self.track_ages[track_id],
                'original_confidence': confidence,
                'temporal_boost': temporal_conf - confidence,
                'confidence_trend': trend,  # NEW: 'increasing', 'stable', 'decreasing'
                'ema_smoothed': True
            }
            
            enhanced_detections.append(enhanced_det)
        
        # Clean up old tracks
        self._cleanup_old_tracks(current_time)
        
        return enhanced_detections
    
    def _get_track_id(self, class_name: str, bbox: List[float]) -> str:
        """Generate tracking ID based on class and approximate position"""
        x_center = (bbox[0] + bbox[2]) / 2
        y_center = (bbox[1] + bbox[3]) / 2
        
        # Grid-based tracking (divide image into regions)
        grid_x = int(x_center / 100)
        grid_y = int(y_center / 100)
        
        return f"{class_name}_{grid_x}_{grid_y}"
    
    def _calculate_temporal_confidence_ema(self, track_id: str, current_conf: float) -> float:
        """
        Calculate confidence boost with Exponential Moving Average
        Provides smooth, continuous growth over time
        """
        history = self.track_history[track_id]
        age = self.track_ages[track_id]
        
        if len(history) < 2:
            self.confidence_ema[track_id] = current_conf
            return current_conf
        
        # Calculate confidence stability (variance)
        recent_confidences = [h['confidence'] for h in history]
        avg_conf = sum(recent_confidences) / len(recent_confidences)
        conf_variance = sum((c - avg_conf) ** 2 for c in recent_confidences) / len(recent_confidences)
        
        # Boost factors with improved scaling
        stability_boost = 0.15 * (1 - min(conf_variance, 0.5))  # Up to +0.15
        
        # Logarithmic age boost (diminishing returns, never stops)
        age_boost = min(0.25, 0.05 * np.log(1 + age))  # Up to +0.25
        
        # History length bonus (rewards long-term tracking)
        history_bonus = min(0.10, len(history) * 0.01)  # Up to +0.10
        
        # Calculate raw boosted confidence
        raw_boosted = current_conf + stability_boost + age_boost + history_bonus
        
        # Apply Exponential Moving Average for smoothing
        if self.confidence_ema[track_id] is None:
            self.confidence_ema[track_id] = raw_boosted
        else:
            # EMA formula: new_ema = α * new_value + (1 - α) * old_ema
            self.confidence_ema[track_id] = (
                self.ema_alpha * raw_boosted + 
                (1 - self.ema_alpha) * self.confidence_ema[track_id]
            )
        
        # Dynamic ceiling that grows with track maturity
        max_conf = 0.95 + (0.04 * min(age / 100, 1))  # 0.95 → 0.99 over 100 frames
        final_conf = min(max_conf, self.confidence_ema[track_id])
        
        # Store for trend calculation
        self.confidence_trend[track_id].append(final_conf)
        if len(self.confidence_trend[track_id]) > 10:
            self.confidence_trend[track_id].pop(0)
        
        return final_conf
    
    def _calculate_confidence_trend(self, track_id: str) -> str:
        """
        Determine if confidence is increasing, stable, or decreasing
        """
        trend_history = self.confidence_trend.get(track_id, [])
        
        if len(trend_history) < 3:
            return 'initializing'
        
        # Calculate linear trend
        recent = trend_history[-5:]
        if len(recent) < 3:
            return 'stable'
        
        # Simple trend detection
        increases = sum(1 for i in range(1, len(recent)) if recent[i] > recent[i-1])
        decreases = sum(1 for i in range(1, len(recent)) if recent[i] < recent[i-1])
        
        if increases > decreases + 1:
            return 'increasing'
        elif decreases > increases + 1:
            return 'decreasing'
        else:
            return 'stable'
    
    def _cleanup_old_tracks(self, current_time: float, max_age: float = 2.0):
        """Remove tracks that haven't been updated recently"""
        tracks_to_remove = []
        
        for track_id, history in self.track_history.items():
            if history and (current_time - history[-1]['time']) > max_age:
                tracks_to_remove.append(track_id)
        
        for track_id in tracks_to_remove:
            del self.track_history[track_id]
            del self.track_ages[track_id]
            if track_id in self.confidence_ema:
                del self.confidence_ema[track_id]
            if track_id in self.confidence_trend:
                del self.confidence_trend[track_id]
    
    def get_tracking_stats(self) -> Dict:
        """
        Get statistics about current tracking state
        """
        return {
            'active_tracks': len(self.track_history),
            'total_detections': sum(self.track_ages.values()),
            'avg_track_age': np.mean(list(self.track_ages.values())) if self.track_ages else 0,
            'max_track_age': max(self.track_ages.values()) if self.track_ages else 0,
            'tracked_objects': list(self.track_history.keys())
        }


# ============================================
# KEEP: Original RNNInferenceEngine for frame-based processing
# ============================================

class RNNInferenceEngine:
    """
    Full RNN inference with frame features (for video streaming)
    """
    def __init__(self, model_path: str = None, device: str = 'cpu'):
        self.device = device
        self.model = MultiTaskTemporalRNN().to(device)
        
        if model_path and os.path.exists(model_path):
            print(f"✅ Loading RNN weights from {model_path}")
            self.model.load_state_dict(torch.load(model_path, map_location=device))
        else:
            print("⚠️  No pretrained RNN weights found. Using random initialization.")
        
        self.model.eval()
        self.feature_extractor = FeatureExtractor(device=device)
        self.object_buffers: Dict[int, TemporalBuffer] = {}
        
        self.activity_labels = ['stationary', 'being_moved', 'obstructed', 'missing', 'normal']
        
    def process_detections(self, 
                          frame: np.ndarray,
                          yolo_detections: List[Dict]) -> List[Dict]:
        """Process YOLO detections with RNN temporal reasoning"""
        enhanced_detections = []
        
        for det in yolo_detections:
            track_id = det.get('track_id', -1)
            
            if track_id == -1:
                det['temporal'] = {
                    'activity': 'no_tracking',
                    'activity_confidence': 0.0,
                    'anomaly_score': 0.0
                }
                enhanced_detections.append(det)
                continue
                
            if track_id not in self.object_buffers:
                self.object_buffers[track_id] = TemporalBuffer()
            
            features = self.feature_extractor.extract(frame, det['bbox'])
            self.object_buffers[track_id].add_frame(features)
            
            if self.object_buffers[track_id].is_ready():
                sequence = self.object_buffers[track_id].get_sequence()
                sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    outputs = self.model(sequence_tensor)
                
                activity_probs = torch.softmax(outputs['activity_logits'], dim=-1)
                activity_idx = activity_probs.argmax().item()
                
                det['temporal'] = {
                    'activity': self.activity_labels[activity_idx],
                    'activity_confidence': float(activity_probs.max().item()),
                    'anomaly_score': float(outputs['anomaly_scores'].item()),
                    'tracking_embedding': outputs['tracking_embeddings'].cpu().numpy()[0].tolist()
                }
            else:
                det['temporal'] = {
                    'activity': 'buffering',
                    'activity_confidence': 0.0,
                    'anomaly_score': 0.0
                }
                
            enhanced_detections.append(det)
            
        return enhanced_detections
    
    def cleanup_old_tracks(self, active_track_ids: List[int]):
        """Remove buffers for tracks that are no longer active"""
        dead_tracks = set(self.object_buffers.keys()) - set(active_track_ids)
        for track_id in dead_tracks:
            del self.object_buffers[track_id]