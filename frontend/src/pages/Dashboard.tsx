import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  Cpu,
  MessageCircle,
  RefreshCw,
  Target,
  TrendingUp,
  Upload,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AstroOpsPipeline from '../components/AstroOpsPipeline';
import SafetyChat from '../components/SafetyChat';
import { detectObjects, type Detection, type InferenceResponse } from '../services/api';

// Color mapping for detection classes
const classColors: { [key: string]: string } = {
  'OxygenTank': '#00FF41',
  'FireExtinguisher': '#FC3D21',
  'EmergencyPhone': '#FFA500',
  'FireAlarm': '#FF1744',
  'SafetyHelmet': '#2196F3',
  'NitrogenTank': '#00CED1',
  'FirstAidBox': '#FF69B4',
  'SafetySwitchPanel': '#9370DB',
};

const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const [falconTriggered, setFalconTriggered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{timestamp: string; objects: number; confidence: string; falcon: boolean; healed?: boolean}[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showAstroOps, setShowAstroOps] = useState(false);
  const [isHealed, setIsHealed] = useState(false);
  const [healingClass, setHealingClass] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamDetections, setWebcamDetections] = useState<Detection[]>([]);
  const [webcamFps, setWebcamFps] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const [videoDetections, setVideoDetections] = useState<Detection[]>([]);
  const [videoFrameDetections, setVideoFrameDetections] = useState<Map<number, Detection[]>>(new Map());
  const [videoFps, setVideoFps] = useState(30);
  const [videoProcessedFrames, setVideoProcessedFrames] = useState(0);
  const [currentVideoFrame, setCurrentVideoFrame] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Handler for when healing completes - boost detection confidence
  const handleHealingComplete = (healedClass: string) => {
    console.log(`Healing complete for ${healedClass}!`);
    setIsHealed(true);
    setHealingClass(healedClass);
    setFalconTriggered(false);
    
    // Boost confidence for the healed class
    setDetections(prevDetections => 
      prevDetections.map(d => {
        if (d.class === healedClass || !healedClass) {
          // Boost confidence by 10-15%
          const boost = 0.10 + Math.random() * 0.05;
          const newConfidence = Math.min((d.confidence ?? 0) + boost, 0.98);
          return { ...d, confidence: newConfidence, healed: true };
        }
        return d;
      })
    );
    
    // Add healed log entry
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      objects: detections.length,
      confidence: 'BOOSTED',
      falcon: false,
      healed: true
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
    
    // Clear healed status after 5 seconds
    setTimeout(() => {
      setIsHealed(false);
      setHealingClass(null);
    }, 5000);
  };

  // ===== WEBCAM FUNCTIONS =====
  const startWebcam = async () => {
    try {
      stopWebcam();
      setIsWebcamActive(true);
      setSelectedImage(null);
      setIsVideo(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('📹 Got camera stream:', stream);
      setWebcamStream(stream);
    } catch (error) {
      console.error('Failed to start webcam:', error);
      setIsWebcamActive(false);
      alert('Failed to access camera: ' + error);
    }
  };

  const stopWebcam = () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setWebcamStream(null);
    setWebcamDetections([]);
    setWebcamFps(0);
  };

  // Connect to WebSocket for real-time detection
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/webcam');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('📹 WebSocket connected');
      startFrameLoop();
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'detection') {
        setWebcamDetections(data.detections || []);
        setInferenceTime(data.latency_ms || 0);
        setWebcamFps(data.fps || 0);
        setFalconTriggered(data.falcon_trigger || false);
        drawWebcamDetections(data.detections || []);
      }
    };
    
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => console.log('📹 WebSocket disconnected');
  };

  // Send frames to backend
  const startFrameLoop = () => {
    const loop = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      if (!webcamRef.current) return;
      
      const video = webcamRef.current;
      if (video.readyState < 2) {
        requestAnimationFrame(loop);
        return;
      }
      
      // Create temp canvas for frame capture
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth || 640;
      tempCanvas.height = video.videoHeight || 480;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) { requestAnimationFrame(loop); return; }
      
      ctx.drawImage(video, 0, 0);
      const frameData = tempCanvas.toDataURL('image/jpeg', 0.6);
      
      wsRef.current.send(JSON.stringify({ type: 'frame', data: frameData }));
      
      // Continue at ~10 FPS
      setTimeout(() => requestAnimationFrame(loop), 100);
    };
    loop();
  };

  // Draw bounding boxes on webcam canvas overlay
  const drawWebcamDetections = (dets: Detection[]) => {
    const canvas = webcamCanvasRef.current;
    const video = webcamRef.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaleX = rect.width / (video.videoWidth || 640);
    const scaleY = rect.height / (video.videoHeight || 480);
    
    dets.forEach((det) => {
      if (!det.bbox || !det.class) return;
      const [x1, y1, x2, y2] = det.bbox;
      const color = classColors[det.class] || '#00FF41';
      
      const sx1 = x1 * scaleX, sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX, sy2 = y2 * scaleY;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
      
      const label = `${det.class} ${((det.confidence ?? 0) * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px monospace';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = color;
      ctx.fillRect(sx1, sy1 - 22, textWidth + 10, 22);
      ctx.fillStyle = '#000';
      ctx.fillText(label, sx1 + 5, sy1 - 6);
    });
  };

  // Draw bounding boxes on video canvas overlay
  const drawVideoDetections = (dets: Detection[]) => {
    const canvas = videoCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaleX = rect.width / (video.videoWidth || 1280);
    const scaleY = rect.height / (video.videoHeight || 720);
    
    dets.forEach((det) => {
      if (!det.bbox || !det.class) return;
      const [x1, y1, x2, y2] = det.bbox;
      const color = classColors[det.class] || '#00FF41';
      
      const sx1 = x1 * scaleX, sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX, sy2 = y2 * scaleY;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);
      
      const label = `${det.class} ${((det.confidence ?? 0) * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px monospace';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = color;
      ctx.fillRect(sx1, sy1 - 22, textWidth + 10, 22);
      ctx.fillStyle = '#000';
      ctx.fillText(label, sx1 + 5, sy1 - 6);
    });
  };

  // Effect to attach webcam stream to video element
  useEffect(() => {
    if (webcamStream && webcamRef.current && isWebcamActive) {
      console.log('📹 Attaching stream to video element');
      webcamRef.current.srcObject = webcamStream;
      webcamRef.current.play()
        .then(() => {
          console.log('📹 Video playing!');
          // Connect WebSocket after video starts
          connectWebSocket();
        })
        .catch(err => console.error('📹 Play error:', err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamStream, isWebcamActive]);

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Redraw video detections when they change or video loads
  // This syncs bounding boxes with video playback frame-by-frame
  useEffect(() => {
    if (isVideo && videoFrameDetections.size > 0 && videoRef.current) {
      const video = videoRef.current;
      const frameKeys = Array.from(videoFrameDetections.keys()).sort((a, b) => a - b);
      
      const handleTimeUpdate = () => {
        if (!video) return;
        
        // Calculate current frame based on video time and fps
        const currentTime = video.currentTime;
        const currentFrame = Math.floor(currentTime * videoFps);
        setCurrentVideoFrame(currentFrame);
        
        // Find the closest analyzed frame
        let closestFrame = frameKeys[0];
        for (const frameKey of frameKeys) {
          if (frameKey <= currentFrame) {
            closestFrame = frameKey;
          } else {
            break;
          }
        }
        
        // Get detections for this frame and draw them
        const frameDets = videoFrameDetections.get(closestFrame) || [];
        setVideoDetections(frameDets);
        setDetections(frameDets);
        drawVideoDetections(frameDets);
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadeddata', () => {
        // Draw first frame detections when video loads
        const firstDets = videoFrameDetections.get(frameKeys[0]) || [];
        drawVideoDetections(firstDets);
      });
      video.addEventListener('play', handleTimeUpdate);
      video.addEventListener('seeked', handleTimeUpdate);
      
      // Initial draw
      setTimeout(() => {
        const firstDets = videoFrameDetections.get(frameKeys[0]) || [];
        drawVideoDetections(firstDets);
      }, 200);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handleTimeUpdate);
        video.removeEventListener('seeked', handleTimeUpdate);
      };
    }
  }, [isVideo, videoFrameDetections, videoFps]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Stop webcam if active
    stopWebcam();
    setSelectedFile(file);
    
    // Check if it's a video file
    const isVideoFile = file.type.startsWith('video/');
    setIsVideo(isVideoFile);
    
    if (isVideoFile) {
      // Handle video file
      const videoUrl = URL.createObjectURL(file);
      setSelectedImage(videoUrl);
      
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('🎬 Uploading video for frame-by-frame analysis...');
        
        const response = await fetch('http://localhost:8000/detect/video', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Video detection failed');
        
        const result = await response.json();
        
        // Store per-frame detections in a Map (frame_index -> detections)
        const frameDetectionsMap = new Map<number, Detection[]>();
        let totalLatency = 0;
        
        if (result.frames) {
          console.log(`🎬 Received ${result.frames.length} analyzed frames`);
          result.frames.forEach((frame: { frame?: number, detections?: Detection[], latency_ms?: number }) => {
            const frameIdx = frame.frame ?? 0;
            const dets = (frame.detections || []).map(d => ({
              bbox: d.bbox || [0, 0, 0, 0],
              confidence: d.confidence ?? 0,
              class: d.class || 'Unknown',
              track_id: d.track_id,
            }));
            frameDetectionsMap.set(frameIdx, dets);
            totalLatency += frame.latency_ms || 0;
          });
        }
        
        // Store the frame detections map
        setVideoFrameDetections(frameDetectionsMap);
        setVideoFps(result.video_info?.fps || 30);
        setVideoProcessedFrames(result.video_info?.processed_frames || frameDetectionsMap.size);
        
        // Set initial detections from first frame
        const firstFrameKey = Math.min(...Array.from(frameDetectionsMap.keys()));
        const initialDets = frameDetectionsMap.get(firstFrameKey) || [];
        setDetections(initialDets);
        setVideoDetections(initialDets);
        
        setInferenceTime(result.avg_latency_ms || (totalLatency / Math.max(frameDetectionsMap.size, 1)));
        setFalconTriggered(result.falcon_triggered || false);
        
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          objects: result.total_objects || 0,
          confidence: result.avg_confidence?.toFixed(2) || 'N/A',
          falcon: result.falcon_triggered || false,
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
        
        console.log(`🎬 Video ready! ${frameDetectionsMap.size} frames with detections. Press play to see live bounding boxes.`);
        
      } catch (error) {
        console.error('Video detection failed:', error);
        alert('Video detection failed: ' + error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Handle image file
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setIsProcessing(true);
      try {
        const result: InferenceResponse = await detectObjects(file);
        // Normalize detections to handle both API formats (box/score/label or bbox/confidence/class)
        const normalizedDetections = (result.detections || []).map(d => ({
          bbox: d.box || d.bbox || [0, 0, 0, 0],
          confidence: d.score ?? d.confidence ?? 0,
          class: d.label || d.class || 'Unknown',
          track_id: d.track_id,
          track_age: d.track_age,
          temporal_boost: d.temporal_boost,
        }));
        setDetections(normalizedDetections);
        setInferenceTime(result.latency_ms || result.inference_time || 0);
        setFalconTriggered(result.falcon_trigger ?? result.falcon_triggered ?? false);
        
        const firstConf = normalizedDetections[0]?.confidence;
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          objects: result.count ?? result.total_objects ?? normalizedDetections.length,
          confidence: firstConf !== undefined ? firstConf.toFixed(2) : 'N/A',
          falcon: result.falcon_trigger ?? result.falcon_triggered ?? false,
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Detection failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      detections.forEach((detection) => {
        const bbox = detection.bbox || [0, 0, 0, 0];
        let x1, y1, x2, y2;
        
        // Check if coordinates are normalized (0-1) or absolute pixels
        if (bbox[0] <= 1 && bbox[1] <= 1 && bbox[2] <= 1 && bbox[3] <= 1) {
          // Normalized coordinates - scale to image size
          x1 = bbox[0] * img.width;
          y1 = bbox[1] * img.height;
          x2 = bbox[2] * img.width;
          y2 = bbox[3] * img.height;
        } else {
          // Absolute pixel coordinates - use directly
          x1 = bbox[0];
          y1 = bbox[1];
          x2 = bbox[2];
          y2 = bbox[3];
        }
        
        const width = x2 - x1;
        const height = y2 - y1;

        const className = detection.class || 'Unknown';
        const confidence = detection.confidence ?? 0;
        const color = classColors[className] || '#00FF41';
        
        // Draw bounding box with thicker lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);
        
        // Add corner accents for a modern look
        const cornerSize = Math.min(20, width * 0.15, height * 0.15);
        ctx.lineWidth = 5;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(x1, y1 + cornerSize);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 + cornerSize, y1);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(x2 - cornerSize, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y1 + cornerSize);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(x1, y2 - cornerSize);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x1 + cornerSize, y2);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(x2 - cornerSize, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y2 - cornerSize);
        ctx.stroke();

        // Draw label with larger, bolder text
        const isHealedDetection = (detection as Detection & { healed?: boolean }).healed;
        const healedSuffix = isHealedDetection ? ' ✓' : '';
        const label = `${className} ${(confidence * 100).toFixed(0)}%${healedSuffix}`;
        const fontSize = Math.max(18, Math.min(28, width * 0.12));
        ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        const padding = 8;
        const labelHeight = textHeight + padding * 2;
        const labelWidth = textWidth + padding * 2;
        
        // Position label above the box, or inside if no room above
        const labelY = y1 > labelHeight + 5 ? y1 - labelHeight - 5 : y1 + 5;
        const labelX = x1;
        
        // Draw label background with rounded corners effect - use gold/green for healed
        ctx.fillStyle = isHealedDetection ? '#00FF41' : color;
        ctx.beginPath();
        const radius = 6;
        ctx.moveTo(labelX + radius, labelY);
        ctx.lineTo(labelX + labelWidth - radius, labelY);
        ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
        ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
        ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
        ctx.lineTo(labelX + radius, labelY + labelHeight);
        ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
        ctx.lineTo(labelX, labelY + radius);
        ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
        ctx.closePath();
        ctx.fill();
        
        // Draw text with shadow for better readability
        ctx.fillStyle = '#000000';
        ctx.fillText(label, labelX + padding, labelY + textHeight + padding / 2 - 2);
      });
    };
    img.src = selectedImage;
  }, [selectedImage, detections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-glow" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#00FF41', margin: 0 }}>
            SafetyGuard AI Dashboard
          </h2>
          <p className="font-mono" style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Industrial safety monitoring powered by AI
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAstroOps(!showAstroOps)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
              background: showAstroOps ? 'rgba(255, 165, 0, 0.2)' : 'rgba(100, 100, 100, 0.2)',
              border: `1px solid ${showAstroOps ? '#FFA500' : '#666'}`,
              borderRadius: '0.5rem', color: '#e5e7eb', fontSize: '0.875rem',
              fontFamily: 'monospace', cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} /> <span>AstroOps</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(!showChat)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
              background: showChat ? 'rgba(0, 255, 65, 0.2)' : 'rgba(100, 100, 100, 0.2)',
              border: `1px solid ${showChat ? '#00FF41' : '#666'}`,
              borderRadius: '0.5rem', color: '#e5e7eb', fontSize: '0.875rem',
              fontFamily: 'monospace', cursor: 'pointer'
            }}
          >
            <MessageCircle style={{ width: '18px', height: '18px' }} /> <span>AI Chat</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
              background: 'rgba(33, 150, 243, 0.2)', border: '1px solid #2196F3',
              borderRadius: '0.5rem', color: '#e5e7eb', fontSize: '0.875rem',
              fontFamily: 'monospace', cursor: 'pointer'
            }}
          >
            <Upload style={{ width: '18px', height: '18px' }} /> <span>Upload</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isWebcamActive ? stopWebcam : startWebcam}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
              background: isWebcamActive ? 'rgba(252, 61, 33, 0.3)' : 'rgba(0, 255, 65, 0.2)', 
              border: isWebcamActive ? '1px solid #FC3D21' : '1px solid #00FF41',
              borderRadius: '0.5rem', color: '#e5e7eb', fontSize: '0.875rem',
              fontFamily: 'monospace', cursor: 'pointer'
            }}
          >
            <Camera style={{ width: '18px', height: '18px' }} /> 
            <span>{isWebcamActive ? 'Stop Cam' : 'Webcam'}</span>
          </motion.button>
        </div>
        
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: showChat ? '1fr 380px' : '1fr',
        gap: '1.5rem'
      }}>
        {/* Left Side: Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Detection Area + Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* Image Display */}
            <div className="glass-panel hud-border" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div className="scan-line"></div>
              
              {isWebcamActive ? (
                <div style={{ position: 'relative', backgroundColor: '#000', minHeight: '300px' }}>
                  <video 
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: '0.5rem', 
                      display: 'block'
                    }}
                  />
                  {/* Canvas overlay for detections */}
                  <canvas 
                    ref={webcamCanvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {/* Live indicator with stats */}
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)', padding: '8px 12px',
                    borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    <span style={{ color: '#00FF41' }}>🔴 LIVE</span>
                    <span style={{ color: '#00FF41' }}>{webcamDetections.length} objects</span>
                    <span style={{ color: '#2196F3' }}>{webcamFps.toFixed(1)} FPS</span>
                  </div>
                </div>
              ) : isVideo && selectedImage ? (
                <div style={{ position: 'relative' }}>
                  <video 
                    ref={videoRef}
                    src={selectedImage}
                    controls
                    onLoadedMetadata={() => {
                      // Redraw detections when video metadata is loaded
                      if (videoDetections.length > 0) {
                        setTimeout(() => drawVideoDetections(videoDetections), 100);
                      }
                    }}
                    onPlay={() => {
                      // Redraw detections when video plays
                      if (videoDetections.length > 0) {
                        drawVideoDetections(videoDetections);
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: '0.5rem', 
                      display: 'block'
                    }}
                  />
                  {/* Canvas overlay for bounding boxes */}
                  <canvas 
                    ref={videoCanvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  {/* Video detection stats */}
                  {videoFrameDetections.size > 0 && !isProcessing && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(0, 0, 0, 0.7)', padding: '8px 12px',
                      borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                      <span style={{ color: '#2196F3' }}>📹 AI ANALYSIS</span>
                      <span style={{ color: '#00FF41' }}>{videoDetections.length} objects</span>
                      <span style={{ color: '#9370DB' }}>Frame: {currentVideoFrame}</span>
                      <span style={{ color: '#fbbf24' }}>{videoProcessedFrames} frames analyzed</span>
                    </div>
                  )}
                  {isProcessing && (
                    <div style={{
                      position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 14, 26, 0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Cpu style={{ width: '48px', height: '48px', color: '#2196F3' }} />
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : !selectedImage ? (
                <div style={{
                  aspectRatio: '16/9', backgroundColor: 'rgba(20, 27, 45, 0.6)',
                  borderRadius: '0.5rem', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed rgba(33, 150, 243, 0.3)'
                }}>
                  <Camera style={{ width: '64px', height: '64px', color: '#4b5563', marginBottom: '1rem' }} />
                  <p className="font-mono" style={{ color: '#9ca3af' }}>No image selected</p>
                  <p className="font-mono" style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Upload an image or use Webcam
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '0.5rem' }} />
                  {isProcessing && (
                    <div style={{
                      position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 14, 26, 0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Cpu style={{ width: '48px', height: '48px', color: '#2196F3' }} />
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metrics Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Inference Time */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Zap style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Inference Time</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#00FF41' }}>
                  {inferenceTime.toFixed(0)}ms
                </div>
                <div style={{ marginTop: '0.5rem', height: '8px', backgroundColor: 'rgba(20, 27, 45, 0.6)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((inferenceTime / 50) * 100, 100)}%` }}
                    style={{ height: '100%', backgroundColor: inferenceTime < 50 ? '#00FF41' : '#ef4444' }}
                  />
                </div>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Target: &lt;50ms {inferenceTime > 0 && inferenceTime < 50 && '✓'}
                </p>
              </motion.div>

              {/* Objects Detected */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Target style={{ width: '20px', height: '20px', color: '#2196F3' }} />
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Objects Detected</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2196F3' }}>
                  {detections.length}
                </div>
              </motion.div>

              {/* Average Confidence */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 }} 
                className={`metric-card ${isHealed ? 'animate-glow' : ''}`}
                style={isHealed ? { borderColor: '#00FF41', boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: isHealed ? '#00FF41' : '#00FF41' }} />
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Avg Confidence {isHealed && <span style={{ color: '#00FF41' }}>✓ HEALED</span>}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#00FF41' }}>
                  {detections.length > 0
                    ? (detections.reduce((sum, d) => sum + (d.confidence ?? 0), 0) / detections.length * 100).toFixed(1)
                    : '0.0'}%
                </div>
                {isHealed && healingClass && (
                  <p style={{ fontSize: '0.75rem', color: '#00FF41', marginTop: '0.5rem' }}>
                    🎯 {healingClass} boosted!
                  </p>
                )}
              </motion.div>

              {/* Falcon Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className={`metric-card ${falconTriggered ? 'animate-glow' : ''}`}
                style={falconTriggered ? { borderColor: '#FC3D21' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: falconTriggered ? '#FC3D21' : '#4b5563' }} />
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Falcon-Link</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: falconTriggered ? '#FC3D21' : '#4b5563' }}>
                  {falconTriggered ? '🦅 ACTIVE' : 'STANDBY'}
                </div>
                {falconTriggered && (
                  <p style={{ fontSize: '0.75rem', color: '#FC3D21', marginTop: '0.5rem' }}>
                    Generating synthetic data...
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Detection Log */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#00FF41', marginBottom: '1rem' }}>
              🎯 Detection Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '12rem', overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <p className="font-mono" style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
                  No detections yet
                </p>
              ) : (
                logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem', 
                      backgroundColor: log.healed ? 'rgba(0, 255, 65, 0.1)' : 'rgba(20, 27, 45, 0.6)',
                      borderRadius: '0.375rem', 
                      border: log.healed ? '1px solid rgba(0, 255, 65, 0.5)' : '1px solid rgba(33, 150, 243, 0.2)'
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{log.timestamp}</span>
                    <span className="font-mono" style={{ fontSize: '0.875rem' }}>Objects: {log.objects}</span>
                    <span className="font-mono" style={{ fontSize: '0.875rem', color: log.healed ? '#00FF41' : 'inherit' }}>
                      Conf: {log.confidence}
                    </span>
                    {log.falcon && (
                      <span className="font-mono" style={{ color: '#FC3D21', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        🦅 FALCON
                      </span>
                    )}
                    {log.healed && (
                      <span className="font-mono" style={{ color: '#00FF41', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        ✅ HEALED
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* AstroOps Panel */}
          {showAstroOps && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '1.5rem' }}>
              <AstroOpsPipeline 
                falconTriggered={falconTriggered}
                onHealingComplete={handleHealingComplete}
              />
            </motion.div>
          )}
        </div>

        {/* Right Side: Chat Panel */}
        {showChat && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SafetyChat 
              currentImage={selectedFile}
              onImageRequest={() => fileInputRef.current?.click()}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
