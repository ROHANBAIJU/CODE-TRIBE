import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EquipmentMarker {
  id: string;
  x: number;
  y: number;
  type: string;
  confidence: number;
  status: 'high' | 'medium' | 'low';
  lastSeen: string;
}

const StationMap = () => {
  const [selectedMarker, setSelectedMarker] = useState<EquipmentMarker | null>(null);

  // Mock equipment data across the station
  const equipment: EquipmentMarker[] = [
    { id: '1', x: 15, y: 20, type: 'OxygenTank', confidence: 0.92, status: 'high', lastSeen: '2s ago' },
    { id: '2', x: 45, y: 35, type: 'FireExtinguisher', confidence: 0.88, status: 'high', lastSeen: '5s ago' },
    { id: '3', x: 70, y: 25, type: 'SafetyHelmet', confidence: 0.95, status: 'high', lastSeen: '1s ago' },
    { id: '4', x: 30, y: 60, type: 'EmergencyPhone', confidence: 0.67, status: 'medium', lastSeen: '12s ago' },
    { id: '5', x: 55, y: 70, type: 'FireAlarm', confidence: 0.91, status: 'high', lastSeen: '3s ago' },
    { id: '6', x: 80, y: 55, type: 'OxygenTank', confidence: 0.38, status: 'low', lastSeen: '45s ago' },
    { id: '7', x: 20, y: 80, type: 'FireExtinguisher', confidence: 0.85, status: 'high', lastSeen: '7s ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-terminal-green border-terminal-green';
      case 'medium': return 'bg-yellow-400 border-yellow-400';
      case 'low': return 'bg-red-500 border-red-500';
      default: return 'bg-gray-500 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <CheckCircle2 className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-glow text-terminal-green flex items-center space-x-3">
          <MapPin className="w-8 h-8" />
          <span>Station Map</span>
        </h2>
        <p className="text-gray-400 font-mono mt-1">
          Real-time equipment location tracking
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 glass-panel p-4">
        <span className="text-sm text-gray-400 font-mono">Confidence:</span>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-terminal-green"></div>
          <span className="text-sm font-mono">High (&gt;0.75)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-sm font-mono">Medium (0.45-0.75)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm font-mono">Low (&lt;0.45) - Falcon Triggered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 hud-border">
            <h3 className="text-lg font-bold text-border-glow mb-4">Station Layout - Deck A2</h3>
            
            {/* 2D Map Container */}
            <div className="relative bg-panel-dark rounded-lg border-2 border-border-glow/30"
                 style={{ height: '600px' }}>
              
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20"
                   style={{
                     backgroundImage: 'linear-gradient(#2196F3 1px, transparent 1px), linear-gradient(90deg, #2196F3 1px, transparent 1px)',
                     backgroundSize: '50px 50px'
                   }}>
              </div>

              {/* Station sections (mock rooms) */}
              <div className="absolute top-10 left-10 w-1/3 h-1/4 border-2 border-border-glow/20 rounded">
                <span className="absolute top-2 left-2 text-xs text-gray-500 font-mono">Lab Module</span>
              </div>
              <div className="absolute top-10 right-10 w-2/5 h-2/5 border-2 border-border-glow/20 rounded">
                <span className="absolute top-2 left-2 text-xs text-gray-500 font-mono">Command Center</span>
              </div>
              <div className="absolute bottom-10 left-10 w-1/2 h-1/3 border-2 border-border-glow/20 rounded">
                <span className="absolute top-2 left-2 text-xs text-gray-500 font-mono">Crew Quarters</span>
              </div>

              {/* Equipment Markers */}
              {equipment.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedMarker(item)}
                >
                  {/* Pulse effect for active items */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute inset-0 rounded-full ${getStatusColor(item.status)} -z-10`}
                  ></motion.div>

                  {/* Marker */}
                  <div className={`w-8 h-8 rounded-full border-2 ${getStatusColor(item.status)} 
                                flex items-center justify-center bg-space-dark
                                ${selectedMarker?.id === item.id ? 'ring-2 ring-white' : ''}`}>
                    {getStatusIcon(item.status)}
                  </div>

                  {/* Label on hover */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 
                                opacity-0 hover:opacity-100 transition-opacity
                                bg-panel-dark px-2 py-1 rounded text-xs font-mono
                                whitespace-nowrap pointer-events-none border border-border-glow/30">
                    {item.type}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-border-glow mb-4">Equipment Details</h3>
            
            {selectedMarker ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-mono font-bold text-lg">{selectedMarker.type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Confidence</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono font-bold text-lg">
                      {(selectedMarker.confidence * 100).toFixed(1)}%
                    </p>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedMarker.status)}`}></div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className={`font-mono font-bold uppercase ${
                    selectedMarker.status === 'high' ? 'text-terminal-green' :
                    selectedMarker.status === 'medium' ? 'text-yellow-400' :
                    'text-red-500'
                  }`}>
                    {selectedMarker.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Last Seen</p>
                  <p className="font-mono">{selectedMarker.lastSeen}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Position</p>
                  <p className="font-mono">X: {selectedMarker.x}% | Y: {selectedMarker.y}%</p>
                </div>

                {selectedMarker.status === 'low' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-sm text-red-400 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-mono">Falcon Triggered - Low Confidence</span>
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-mono text-sm">Click a marker to view details</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-terminal-green mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Equipment</span>
                <span className="font-mono font-bold">{equipment.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">High Confidence</span>
                <span className="font-mono font-bold text-terminal-green">
                  {equipment.filter(e => e.status === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Medium Confidence</span>
                <span className="font-mono font-bold text-yellow-400">
                  {equipment.filter(e => e.status === 'medium').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Needs Attention</span>
                <span className="font-mono font-bold text-red-500">
                  {equipment.filter(e => e.status === 'low').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
