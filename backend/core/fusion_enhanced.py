"""
Enhanced Spatio-Temporal Fusion System
Combines YOLO detections with RNN temporal insights
"""

import numpy as np
from typing import List, Dict, Tuple
from collections import deque, defaultdict


def simple_weighted_boxes_fusion(
    boxes_list: List[List[List[float]]],
    scores_list: List[List[float]],
    labels_list: List[List[int]],
    iou_thr: float = 0.5,
    skip_box_thr: float = 0.3
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Simplified Weighted Box Fusion implementation
    No external dependencies needed
    """
    if not boxes_list or len(boxes_list[0]) == 0:
        return np.array([]), np.array([]), np.array([])
    
    # For single model, just filter by threshold
    boxes = np.array(boxes_list[0])
    scores = np.array(scores_list[0])
    labels = np.array(labels_list[0])
    
    # Filter by threshold
    mask = scores >= skip_box_thr
    boxes = boxes[mask]
    scores = scores[mask]
    labels = labels[mask]
    
    if len(boxes) == 0:
        return np.array([]), np.array([]), np.array([])
    
    # Apply NMS-style filtering
    keep_indices = []
    sorted_indices = np.argsort(scores)[::-1]
    
    while len(sorted_indices) > 0:
        idx = sorted_indices[0]
        keep_indices.append(idx)
        
        if len(sorted_indices) == 1:
            break
        
        # Compute IoU with remaining boxes
        ious = np.array([compute_iou(boxes[idx], boxes[i]) for i in sorted_indices[1:]])
        
        # Keep boxes with IoU below threshold
        keep_mask = ious < iou_thr
        sorted_indices = sorted_indices[1:][keep_mask]
    
    return boxes[keep_indices], scores[keep_indices], labels[keep_indices]


def compute_iou(box1: np.ndarray, box2: np.ndarray) -> float:
    """Compute IoU between two boxes"""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    if x2 < x1 or y2 < y1:
        return 0.0
    
    intersection = (x2 - x1) * (y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection
    
    return intersection / union if union > 0 else 0.0


# ============================================
# OLD CLASS (Keep for backward compatibility)
# ============================================

class SpatioTemporalFusion:
    """
    Enhanced Weighted Box Fusion with temporal weighting and alert generation
    """
    def __init__(self, 
                 iou_threshold: float = 0.5,
                 skip_box_threshold: float = 0.3,
                 temporal_weight: float = 0.3,
                 trajectory_buffer_size: int = 30):
        """
        Args:
            iou_threshold: IoU threshold for WBF
            skip_box_threshold: Minimum confidence threshold
            temporal_weight: Weight for temporal consistency (0-1)
            trajectory_buffer_size: Number of frames to track trajectories
        """
        self.iou_threshold = iou_threshold
        self.skip_box_threshold = skip_box_threshold
        self.temporal_weight = temporal_weight
        self.trajectory_buffer_size = trajectory_buffer_size
        
        # Track object trajectories over time
        self.trajectories: Dict[int, deque] = {}
        
        # Alert thresholds
        self.anomaly_threshold = 0.7
        self.low_confidence_threshold = 0.4
        
    def fuse_detections(self,
                       boxes_list: List[List[List[float]]],
                       scores_list: List[List[float]],
                       labels_list: List[List[int]],
                       metadata_list: List[Dict],
                       image_size: Tuple[int, int]) -> List[Dict]:
        """
        Perform spatio-temporal fusion on detections
        
        Args:
            boxes_list: List of detection boxes (normalized coords)
            scores_list: List of confidence scores
            labels_list: List of class labels
            metadata_list: List of detection metadata (with temporal info)
            image_size: (height, width) of image
            
        Returns:
            List of fused detections with temporal insights and alerts
        """
        if not boxes_list or len(boxes_list[0]) == 0:
            return []
        
        # Apply our custom WBF (no external dependencies)
        fused_boxes, fused_scores, fused_labels = simple_weighted_boxes_fusion(
            boxes_list,
            scores_list,
            labels_list,
            iou_thr=self.iou_threshold,
            skip_box_thr=self.skip_box_threshold
        )
        
        if len(fused_boxes) == 0:
            return []
        
        # Create enhanced detections
        enhanced_detections = []
        
        for i, (box, score, label) in enumerate(zip(fused_boxes, fused_scores, fused_labels)):
            # Find matching metadata (closest IoU)
            matched_metadata = self._match_metadata(box, metadata_list)
            
            # Denormalize bbox
            h, w = image_size
            x1, y1, x2, y2 = box
            bbox_pixel = [x1 * w, y1 * h, x2 * w, y2 * h]
            
            # Build detection dict
            detection = {
                'bbox': bbox_pixel,
                'bbox_normalized': box.tolist(),
                'confidence': float(score),
                'class_id': int(label),
                'class_name': matched_metadata.get('class_name', 'unknown'),
                'track_id': matched_metadata.get('track_id', -1)
            }
            
            # Add temporal insights if available
            if 'temporal' in matched_metadata:
                temporal = matched_metadata['temporal']
                detection['temporal'] = temporal
                
                # Apply temporal smoothing
                if detection['track_id'] != -1:
                    smoothed_conf = self._smooth_confidence(
                        detection['track_id'],
                        score,
                        temporal.get('activity_confidence', 0)
                    )
                    detection['confidence_smoothed'] = float(smoothed_conf)
                
                # Generate alerts
                alert = self._generate_alert(detection, temporal)
                if alert:
                    detection['alert'] = alert
            
            enhanced_detections.append(detection)
        
        return enhanced_detections
    
    def _match_metadata(self, box: np.ndarray, metadata_list: List[Dict]) -> Dict:
        """
        Match fused box to original metadata using IoU
        """
        if not metadata_list:
            return {}
        
        best_iou = 0
        best_metadata = metadata_list[0]
        
        for metadata in metadata_list:
            if 'bbox_normalized' in metadata:
                iou = compute_iou(box, np.array(metadata['bbox_normalized']))
                if iou > best_iou:
                    best_iou = iou
                    best_metadata = metadata
        
        return best_metadata
    
    def _smooth_confidence(self, 
                          track_id: int, 
                          current_conf: float,
                          temporal_conf: float) -> float:
        """
        Smooth confidence using temporal trajectory
        """
        # Initialize trajectory buffer if new track
        if track_id not in self.trajectories:
            self.trajectories[track_id] = deque(maxlen=self.trajectory_buffer_size)
        
        # Add current confidence
        self.trajectories[track_id].append(current_conf)
        
        # Compute temporal average
        if len(self.trajectories[track_id]) > 0:
            temporal_avg = np.mean(list(self.trajectories[track_id]))
        else:
            temporal_avg = current_conf
        
        # Weighted combination
        smoothed = (1 - self.temporal_weight) * current_conf + \
                   self.temporal_weight * temporal_avg
        
        return smoothed
    
    def _generate_alert(self, detection: Dict, temporal: Dict) -> Dict:
        """
        Generate alerts based on detection and temporal insights
        
        Alert triggers:
        1. High anomaly score
        2. Object being moved (activity)
        3. Low confidence detection
        4. Missing object (was tracked, now gone)
        """
        alerts = []
        
        # 1. Anomaly detection
        anomaly_score = temporal.get('anomaly_score', 0.0)
        if anomaly_score > self.anomaly_threshold:
            alerts.append({
                'type': 'anomaly',
                'severity': 'high',
                'message': f'High anomaly score detected: {anomaly_score:.2f}',
                'value': anomaly_score
            })
        
        # 2. Activity detection
        activity = temporal.get('activity', 'unknown')
        if activity == 'being_moved':
            alerts.append({
                'type': 'movement',
                'severity': 'medium',
                'message': f'{detection["class_name"]} is being moved',
                'activity': activity
            })
        elif activity == 'obstructed':
            alerts.append({
                'type': 'obstruction',
                'severity': 'medium',
                'message': f'{detection["class_name"]} is obstructed',
                'activity': activity
            })
        elif activity == 'missing':
            alerts.append({
                'type': 'missing',
                'severity': 'high',
                'message': f'{detection["class_name"]} is missing from expected location',
                'activity': activity
            })
        
        # 3. Low confidence
        if detection['confidence'] < self.low_confidence_threshold:
            alerts.append({
                'type': 'low_confidence',
                'severity': 'low',
                'message': f'Low confidence detection: {detection["confidence"]:.2f}',
                'confidence': detection['confidence']
            })
        
        # Return consolidated alert
        if alerts:
            # Pick highest severity
            severity_order = {'high': 3, 'medium': 2, 'low': 1}
            alerts.sort(key=lambda x: severity_order[x['severity']], reverse=True)
            
            return {
                'triggered': True,
                'primary_alert': alerts[0],
                'all_alerts': alerts,
                'alert_reason': alerts[0]['message'],
                'severity': alerts[0]['severity']
            }
        
        return None
    
    def cleanup_old_trajectories(self, active_track_ids: List[int]):
        """Remove trajectory buffers for inactive tracks"""
        dead_tracks = set(self.trajectories.keys()) - set(active_track_ids)
        for track_id in dead_tracks:
            del self.trajectories[track_id]


# ============================================
# NEW CLASS (Enhanced with Different Confidence)
# ============================================

class FusionEnhanced:
    """
    NEW: Weighted fusion that modifies confidence scores
    Combines YOLO spatial detections with RNN temporal analysis
    """
    def __init__(self, yolo_weight=0.5, rnn_weight=0.5, iou_threshold=0.5):
        self.yolo_weight = yolo_weight
        self.rnn_weight = rnn_weight
        self.iou_threshold = iou_threshold
        
    def fuse_detections(self, yolo_detections, rnn_detections):
        """Fuse YOLO and RNN detections with weighted confidence"""
        fused_detections = []
        
        # Group detections by class
        yolo_by_class = self._group_by_class(yolo_detections)
        rnn_by_class = self._group_by_class(rnn_detections)
        
        all_classes = set(yolo_by_class.keys()) | set(rnn_by_class.keys())
        
        for class_name in all_classes:
            yolo_class_dets = yolo_by_class.get(class_name, [])
            rnn_class_dets = rnn_by_class.get(class_name, [])
            
            # Fuse matching detections
            fused_class_dets = self._fuse_class_detections(yolo_class_dets, rnn_class_dets)
            fused_detections.extend(fused_class_dets)
        
        # Apply NMS to remove duplicates
        fused_detections = self._apply_nms(fused_detections)
        
        return fused_detections
    
    def _group_by_class(self, detections):
        """Group detections by class name"""
        grouped = defaultdict(list)
        for det in detections:
            class_name = det.get('class', 'unknown')
            grouped[class_name].append(det)
        return dict(grouped)
    
    def _fuse_class_detections(self, yolo_dets, rnn_dets):
        """Fuse detections of the same class"""
        fused = []
        matched_rnn = set()
        
        for yolo_det in yolo_dets:
            best_match = None
            best_iou = 0
            best_idx = -1
            
            # Find matching RNN detection
            for idx, rnn_det in enumerate(rnn_dets):
                if idx in matched_rnn:
                    continue
                
                iou = self._calculate_iou(yolo_det['bbox'], rnn_det['bbox'])
                if iou > best_iou and iou > self.iou_threshold:
                    best_iou = iou
                    best_match = rnn_det
                    best_idx = idx
            
            if best_match:
                # Fuse matched detections
                fused_det = self._weighted_fusion(yolo_det, best_match, best_iou)
                matched_rnn.add(best_idx)
            else:
                # Use YOLO detection only
                fused_det = {
                    **yolo_det,
                    'fusion_source': 'yolo_only',
                    'final_confidence': yolo_det['confidence']
                }
            
            fused.append(fused_det)
        
        # Add unmatched RNN detections
        for idx, rnn_det in enumerate(rnn_dets):
            if idx not in matched_rnn:
                fused_det = {
                    **rnn_det,
                    'fusion_source': 'rnn_only',
                    'final_confidence': rnn_det['confidence'] * 0.8  # Penalize RNN-only
                }
                fused.append(fused_det)
        
        return fused
    
    def _weighted_fusion(self, yolo_det, rnn_det, iou):
        """Weighted fusion of YOLO and RNN detections"""
        yolo_conf = yolo_det.get('confidence', 0.0)
        rnn_conf = rnn_det.get('confidence', 0.0)
        
        # Adjust weights based on IOU (higher IOU = more trust in fusion)
        iou_factor = (iou - self.iou_threshold) / (1 - self.iou_threshold)
        adjusted_yolo_weight = self.yolo_weight * (1 + 0.2 * iou_factor)
        adjusted_rnn_weight = self.rnn_weight * (1 + 0.2 * iou_factor)
        
        # Normalize weights
        total_weight = adjusted_yolo_weight + adjusted_rnn_weight
        adjusted_yolo_weight /= total_weight
        adjusted_rnn_weight /= total_weight
        
        # Fused confidence
        fused_conf = (yolo_conf * adjusted_yolo_weight) + (rnn_conf * adjusted_rnn_weight)
        
        # Fused bounding box (weighted average)
        yolo_bbox = yolo_det['bbox']
        rnn_bbox = rnn_det['bbox']
        fused_bbox = [
            yolo_bbox[i] * adjusted_yolo_weight + rnn_bbox[i] * adjusted_rnn_weight
            for i in range(4)
        ]
        
        return {
            'class': yolo_det['class'],
            'confidence': fused_conf,
            'bbox': fused_bbox,
            'yolo_confidence': yolo_conf,
            'rnn_confidence': rnn_conf,
            'temporal_boost': rnn_det.get('temporal_boost', 0.0),
            'track_id': rnn_det.get('track_id', 'no_track'),
            'track_age': rnn_det.get('track_age', 0),
            'fusion_source': 'fused',
            'iou': iou,
            'weights': f"Y:{adjusted_yolo_weight:.2f},R:{adjusted_rnn_weight:.2f}"
        }
    
    def _calculate_iou(self, box1, box2):
        """Calculate Intersection over Union"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0
    
    def _apply_nms(self, detections, nms_threshold=0.45):
        """Apply Non-Maximum Suppression to remove duplicates"""
        if not detections:
            return []
        
        # Group by class
        by_class = defaultdict(list)
        for det in detections:
            by_class[det['class']].append(det)
        
        final_detections = []
        
        for class_name, class_dets in by_class.items():
            # Sort by confidence
            class_dets.sort(key=lambda x: x['confidence'], reverse=True)
            
            keep = []
            while class_dets:
                best = class_dets.pop(0)
                keep.append(best)
                
                # Remove overlapping detections
                class_dets = [
                    det for det in class_dets
                    if self._calculate_iou(best['bbox'], det['bbox']) < nms_threshold
                ]
            
            final_detections.extend(keep)
        
        return final_detections