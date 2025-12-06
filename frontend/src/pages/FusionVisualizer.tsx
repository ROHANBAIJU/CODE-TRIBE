import { motion } from 'framer-motion';
import { Layers, Zap, Target, Upload, Play, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const FusionVisualizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Mock data
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
    <div className="min-h-screen">
      {/* Hero Section with Upload */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 p-8 border border-blue-500/30"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  3-Layer Fusion Detection
                </h1>
                <p className="text-blue-200 font-mono text-sm">
                  Combining speed and accuracy with intelligent weighted box fusion
                </p>
              </div>
              <Layers className="w-16 h-16 text-blue-400 opacity-50" />
            </div>

            {/* Upload Area */}
            <label className="relative block">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="cursor-pointer bg-white/10 backdrop-blur-xl rounded-xl p-6 border-2 border-dashed border-blue-400/50 hover:border-blue-400 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                    {previewUrl ? <ImageIcon className="w-7 h-7 text-blue-400" /> : <Upload className="w-7 h-7 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {selectedFile ? selectedFile.name : 'Drop your file here'}
                    </h3>
                    <p className="text-blue-200 text-sm">
                      {previewUrl ? 'Click to change file' : 'Supports images and videos • Max 50MB'}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Main Detection Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - YOLO Small */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-5"
        >
          <div className="glass-panel h-full p-5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-400">YOLO Small</h2>
                  <p className="text-xs text-gray-500 font-mono">Accuracy First • 35ms</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                <span className="text-xs font-bold text-blue-400">Layer 1</span>
              </div>
            </div>

            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black/50 mb-4" style={{ height: '280px' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Small" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm font-mono">Waiting for input</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Objects</p>
                <p className="text-2xl font-bold text-blue-400">{mockDetections.layer2.length}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">mAP Score</p>
                <p className="text-2xl font-bold text-blue-400">0.79</p>
              </div>
            </div>

            {/* Detections */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-mono mb-2">DETECTIONS</p>
              {mockDetections.layer2.map((det, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center justify-between p-2 bg-black/20 rounded border border-blue-500/20 hover:border-blue-500/40 transition-all"
                >
                  <span className="text-sm font-mono text-blue-300">{det.class}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${det.confidence * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono w-12 text-right">{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Middle Column - YOLO Nano */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-5"
        >
          <div className="glass-panel h-full p-5 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">YOLO Nano</h2>
                  <p className="text-xs text-gray-500 font-mono">Speed Optimized • 15ms</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <span className="text-xs font-bold text-yellow-400">Layer 2</span>
              </div>
            </div>

            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black/50 mb-4" style={{ height: '280px' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Nano" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm font-mono">Waiting for input</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Objects</p>
                <p className="text-2xl font-bold text-yellow-400">{mockDetections.layer1.length}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">mAP Score</p>
                <p className="text-2xl font-bold text-yellow-400">0.72</p>
              </div>
            </div>

            {/* Detections */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-mono mb-2">DETECTIONS</p>
              {mockDetections.layer1.map((det, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center justify-between p-2 bg-black/20 rounded border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                >
                  <span className="text-sm font-mono text-yellow-300">{det.class}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${det.confidence * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono w-12 text-right">{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Stats & Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 lg:col-span-2"
        >
          <div className="space-y-4">
            {/* Performance Card */}
            <div className="glass-panel p-4">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-sm font-bold text-gray-400 mb-2">PERFORMANCE</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Total Time</p>
                  <p className="text-xl font-bold text-white">~42ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">FPS</p>
                  <p className="text-xl font-bold text-green-400">~24</p>
                </div>
              </div>
            </div>

            {/* Layer Info */}
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">LAYERS</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-400">Small</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-gray-400">Nano</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-400">Fusion</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Full Width - Fusion Result */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-12"
        >
          <div className="glass-panel p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-2 border-green-500/30">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Layers className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">Fused Detection Result</h2>
                  <p className="text-sm text-gray-400 font-mono">Weighted Box Fusion • Combined Confidence</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40">
                <span className="text-sm font-bold text-green-400">Final Output</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Preview */}
              <div className="col-span-12 lg:col-span-7">
                <div className="relative rounded-xl overflow-hidden bg-black/50 border-2 border-green-500/20" style={{ height: '320px' }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Fusion" className="w-full h-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm font-mono">Final detection will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detections & Stats */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-gray-500 mb-1">Objects</p>
                    <p className="text-2xl font-bold text-green-400">{mockDetections.fusion.length}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-gray-500 mb-1">mAP</p>
                    <p className="text-2xl font-bold text-green-400">0.86</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-gray-500 mb-1">Boost</p>
                    <p className="text-2xl font-bold text-green-400">+8%</p>
                  </div>
                </div>

                {/* Detections List */}
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-3">FUSED DETECTIONS</p>
                  <div className="space-y-2">
                    {mockDetections.fusion.map((det, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-500/30 hover:border-green-500/50 hover:bg-black/40 transition-all"
                      >
                        <span className="text-sm font-semibold text-green-300">{det.class}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${det.confidence * 100}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-300 font-mono w-14 text-right font-bold">{(det.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FusionVisualizer;
