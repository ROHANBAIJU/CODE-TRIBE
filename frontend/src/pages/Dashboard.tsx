import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  Zap, 
  Target, 
  AlertTriangle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { detectObjects, type Detection, type InferenceResponse } from '../services/api';

const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const [falconTriggered, setFalconTriggered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const classColors: { [key: string]: string } = {
    'OxygenTank': '#00FF41',
    'FireExtinguisher': '#FC3D21',
    'EmergencyPhone': '#FFA500',
    'FireAlarm': '#FF1744',
    'SafetyHelmet': '#2196F3',
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process with backend
    setIsProcessing(true);
    try {
      const result: InferenceResponse = await detectObjects(file);
      setDetections(result.detections);
      setInferenceTime(result.inference_time);
      setFalconTriggered(result.falcon_triggered);
      
      // Add to logs
      const newLog = {
        timestamp: new Date().toLocaleTimeString(),
        objects: result.total_objects,
        confidence: result.detections[0]?.confidence.toFixed(2) || 'N/A',
        falcon: result.falcon_triggered,
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw bounding boxes on canvas
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

      // Draw detections
      detections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const width = (x2 - x1) * img.width;
        const height = (y2 - y1) * img.height;
        const x = x1 * img.width;
        const y = y1 * img.height;

        const color = classColors[detection.class] || '#00FF41';
        
        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Label background
        const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
        ctx.font = 'bold 16px monospace';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 25, textWidth + 10, 25);
        
        // Label text
        ctx.fillStyle = '#000';
        ctx.fillText(label, x + 5, y - 7);
      });
    };
    img.src = selectedImage;
  }, [selectedImage, detections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="text-glow" style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#00FF41',
            margin: 0
          }}>
            Live Detection Dashboard
          </h2>
          <p className="font-mono" style={{ 
            color: '#9ca3af', 
            marginTop: '0.25rem',
            fontSize: '0.875rem'
          }}>
            Real-time safety equipment monitoring
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(33, 150, 243, 0.2)',
            border: '1px solid #2196F3',
            borderRadius: '0.5rem',
            color: '#e5e7eb',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <Upload style={{ width: '20px', height: '20px' }} />
          <span>Upload Image</span>
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6" style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem'
      }}>
        
        {/* Video Feed / Image Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="glass-panel hud-border" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div className="scan-line"></div>
              
              {!selectedImage ? (
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: 'rgba(20, 27, 45, 0.6)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed rgba(33, 150, 243, 0.3)'
                }}>
                  <Camera style={{ width: '64px', height: '64px', color: '#4b5563', marginBottom: '1rem' }} />
                  <p className="font-mono" style={{ color: '#9ca3af' }}>No image selected</p>
                  <p className="font-mono" style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Upload an image to start detection
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <canvas
                    ref={canvasRef}
                    style={{ width: '100%', borderRadius: '0.5rem' }}
                  />
                  {isProcessing && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(10, 14, 26, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Cpu style={{ width: '48px', height: '48px', color: '#2196F3' }} />
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metrics Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Inference Time */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="metric-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Inference Time</span>
                </div>
              </div>
              <div className="font-mono" style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#00FF41'
              }}>
                {inferenceTime.toFixed(0)}ms
              </div>
              <div style={{ 
                marginTop: '0.5rem', 
                height: '8px', 
                backgroundColor: 'rgba(20, 27, 45, 0.6)', 
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((inferenceTime / 50) * 100, 100)}%` }}
                  style={{
                    height: '100%',
                    backgroundColor: inferenceTime < 50 ? '#00FF41' : '#ef4444',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
              <p className="font-mono" style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginTop: '0.25rem'
              }}>
                Target: {'<'}50ms {inferenceTime < 50 && '✓'}
              </p>
            </motion.div>

            {/* Objects Detected */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="metric-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Target style={{ width: '20px', height: '20px', color: '#2196F3' }} />
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Objects Detected</span>
              </div>
              <div className="font-mono" style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#2196F3'
              }}>
                {detections.length}
              </div>
            </motion.div>

            {/* Average Confidence */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="metric-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: '#00FF41' }} />
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Avg Confidence</span>
              </div>
              <div className="font-mono" style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#00FF41'
              }}>
                {detections.length > 0
                  ? (detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(1)
                  : '0.0'}%
              </div>
            </motion.div>

            {/* Falcon Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`metric-card ${falconTriggered ? 'animate-glow' : ''}`}
              style={falconTriggered ? { borderColor: '#FC3D21' } : {}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: falconTriggered ? '#FC3D21' : '#4b5563'
                }} />
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Falcon-Link</span>
              </div>
              <div className="font-mono" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: falconTriggered ? '#FC3D21' : '#4b5563'
              }}>
                {falconTriggered ? '🦅 ACTIVE' : 'STANDBY'}
              </div>
              {falconTriggered && (
                <p style={{ fontSize: '0.75rem', color: '#FC3D21', marginTop: '0.5rem' }}>
                  Generating synthetic data for edge cases...
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detection Log */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="font-mono" style={{ 
          fontSize: '1.125rem', 
          fontWeight: 'bold', 
          color: '#00FF41', 
          marginBottom: '1rem'
        }}>
          🎯 Detection Log
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem', 
          maxHeight: '16rem', 
          overflowY: 'auto'
        }}>
          {logs.length === 0 ? (
            <p className="font-mono" style={{ 
              color: '#6b7280', 
              textAlign: 'center', 
              padding: '2rem 0'
            }}>
              No detections yet
            </p>
          ) : (
            logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(20, 27, 45, 0.6)',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {log.timestamp}
                </span>
                <span className="font-mono" style={{ fontSize: '0.875rem' }}>
                  Objects: {log.objects}
                </span>
                <span className="font-mono" style={{ fontSize: '0.875rem' }}>
                  Conf: {log.confidence}
                </span>
                {log.falcon && (
                  <span className="font-mono" style={{ 
                    color: '#FC3D21', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold'
                  }}>
                    🦅 FALCON
                  </span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
