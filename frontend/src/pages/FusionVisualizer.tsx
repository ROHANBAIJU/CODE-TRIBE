import { motion } from 'framer-motion';
import { Layers, Zap, Target } from 'lucide-react';

const FusionVisualizer = () => {
  // Mock data for demonstration
  const mockDetections = {
    layer1: [
      { bbox: [0.1, 0.2, 0.3, 0.4], confidence: 0.72, class: 'OxygenTank' },
      { bbox: [0.5, 0.3, 0.7, 0.6], confidence: 0.68, class: 'FireExtinguisher' },
    ],
    layer2: [
      { bbox: [0.12, 0.21, 0.32, 0.42], confidence: 0.79, class: 'OxygenTank' },
      { bbox: [0.51, 0.31, 0.72, 0.62], confidence: 0.75, class: 'FireExtinguisher' },
      { bbox: [0.75, 0.1, 0.9, 0.3], confidence: 0.82, class: 'SafetyHelmet' },
    ],
    fusion: [
      { bbox: [0.11, 0.205, 0.31, 0.41], confidence: 0.86, class: 'OxygenTank' },
      { bbox: [0.505, 0.305, 0.71, 0.61], confidence: 0.84, class: 'FireExtinguisher' },
      { bbox: [0.75, 0.1, 0.9, 0.3], confidence: 0.82, class: 'SafetyHelmet' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-glow text-terminal-green flex items-center space-x-3">
          <Layers className="w-8 h-8" />
          <span>Fusion Visualizer</span>
        </h2>
        <p className="text-gray-400 font-mono mt-1">
          See how 3-layer architecture resolves conflicts
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="glass-panel p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Layer 1: Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400">Layer 1: Speed</h3>
                <p className="text-xs text-gray-500 font-mono">YOLOv11-Nano (~15ms)</p>
              </div>
            </div>
            
            <div className="bg-panel-dark rounded-lg p-4 border-2 border-yellow-400/30">
              <div className="aspect-video bg-space-dark rounded flex items-center justify-center mb-4">
                <p className="text-gray-500 font-mono text-sm">Mock Detection View</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-mono">Detections: {mockDetections.layer1.length}</p>
                {mockDetections.layer1.map((det, idx) => (
                  <div key={idx} className="text-xs font-mono p-2 bg-space-dark rounded">
                    <span className="text-yellow-400">{det.class}</span>
                    <span className="text-gray-500 ml-2">{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="metric-card">
              <p className="text-sm text-gray-400">mAP Score</p>
              <p className="text-2xl font-bold text-yellow-400 font-mono">0.72</p>
            </div>
          </motion.div>

          {/* Layer 2: Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-border-glow" />
              <div>
                <h3 className="text-lg font-bold text-border-glow">Layer 2: Accuracy</h3>
                <p className="text-xs text-gray-500 font-mono">YOLOv11-Small (~35ms)</p>
              </div>
            </div>
            
            <div className="bg-panel-dark rounded-lg p-4 border-2 border-border-glow/30">
              <div className="aspect-video bg-space-dark rounded flex items-center justify-center mb-4">
                <p className="text-gray-500 font-mono text-sm">Mock Detection View</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-mono">Detections: {mockDetections.layer2.length}</p>
                {mockDetections.layer2.map((det, idx) => (
                  <div key={idx} className="text-xs font-mono p-2 bg-space-dark rounded">
                    <span className="text-border-glow">{det.class}</span>
                    <span className="text-gray-500 ml-2">{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="metric-card">
              <p className="text-sm text-gray-400">mAP Score</p>
              <p className="text-2xl font-bold text-border-glow font-mono">0.79</p>
            </div>
          </motion.div>

          {/* Layer 3: Fusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Layers className="w-6 h-6 text-terminal-green" />
              <div>
                <h3 className="text-lg font-bold text-terminal-green">Layer 3: Fusion</h3>
                <p className="text-xs text-gray-500 font-mono">WBF Arbiter (~42ms)</p>
              </div>
            </div>
            
            <div className="bg-panel-dark rounded-lg p-4 border-2 border-terminal-green/50 animate-glow">
              <div className="aspect-video bg-space-dark rounded flex items-center justify-center mb-4">
                <p className="text-gray-500 font-mono text-sm">Mock Detection View</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-mono">Detections: {mockDetections.fusion.length}</p>
                {mockDetections.fusion.map((det, idx) => (
                  <div key={idx} className="text-xs font-mono p-2 bg-space-dark rounded">
                    <span className="text-terminal-green">{det.class}</span>
                    <span className="text-gray-500 ml-2">{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="metric-card border-terminal-green/50">
              <p className="text-sm text-gray-400">mAP Score</p>
              <p className="text-2xl font-bold text-terminal-green font-mono">0.86 🏆</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it Works */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-border-glow mb-4">How Weighted Box Fusion Works</h3>
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-border-glow/20 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold">1</span>
            </div>
            <div>
              <h4 className="font-bold">Collect Predictions</h4>
              <p className="text-sm text-gray-400">Both models detect objects independently with different confidence levels</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-border-glow/20 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold">2</span>
            </div>
            <div>
              <h4 className="font-bold">Calculate IoU</h4>
              <p className="text-sm text-gray-400">Compute Intersection over Union to find overlapping boxes</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-border-glow/20 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold">3</span>
            </div>
            <div>
              <h4 className="font-bold">Apply Weights</h4>
              <p className="text-sm text-gray-400">Layer 2 (accuracy) gets 2x weight, Layer 1 (speed) gets 1x</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-terminal-green/20 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-terminal-green">4</span>
            </div>
            <div>
              <h4 className="font-bold text-terminal-green">Fuse Results</h4>
              <p className="text-sm text-gray-400">Creates unified, high-confidence detection that resolves conflicts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FusionVisualizer;
