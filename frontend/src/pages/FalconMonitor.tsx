import { motion } from 'framer-motion';
import { Flame, TrendingUp, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FalconMonitor = () => {
  // Mock data for synthetic data generation progress
  const mockData = [
    { epoch: 0, realOnly: 0.40, withSynthetic: 0.40 },
    { epoch: 500, realOnly: 0.55, withSynthetic: 0.62 },
    { epoch: 1000, realOnly: 0.62, withSynthetic: 0.74 },
    { epoch: 1500, realOnly: 0.65, withSynthetic: 0.82 },
    { epoch: 2000, realOnly: 0.66, withSynthetic: 0.86 },
    { epoch: 2500, realOnly: 0.66, withSynthetic: 0.88 },
  ];

  const edgeCases = [
    { scenario: 'Occluded Oxygen Tank', triggers: 47, improved: '+18%', status: 'resolved' },
    { scenario: 'Low-Light Fire Extinguisher', triggers: 32, improved: '+15%', status: 'resolved' },
    { scenario: 'Glare on Safety Helmet', triggers: 28, improved: '+12%', status: 'active' },
    { scenario: 'Partial Emergency Phone', triggers: 19, improved: '+9%', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-glow text-spacex-orange flex items-center space-x-3">
          <Flame className="w-8 h-8" />
          <span>Falcon-Link Monitor</span>
        </h2>
        <p className="text-gray-400 font-mono mt-1">
          Autonomous synthetic data generation for edge cases
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card border-spacex-orange/50"
        >
          <div className="flex items-center justify-between">
            <Flame className="w-6 h-6 text-spacex-orange" />
            <span className="text-sm text-gray-400">Total Triggers</span>
          </div>
          <p className="text-3xl font-bold text-spacex-orange font-mono mt-2">126</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <ImageIcon className="w-6 h-6 text-border-glow" />
            <span className="text-sm text-gray-400">Synthetic Images</span>
          </div>
          <p className="text-3xl font-bold text-border-glow font-mono mt-2">3,847</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-6 h-6 text-terminal-green" />
            <span className="text-sm text-gray-400">Avg Improvement</span>
          </div>
          <p className="text-3xl font-bold text-terminal-green font-mono mt-2">+13.5%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <CheckCircle className="w-6 h-6 text-terminal-green" />
            <span className="text-sm text-gray-400">Cases Resolved</span>
          </div>
          <p className="text-3xl font-bold text-terminal-green font-mono mt-2">2/4</p>
        </motion.div>
      </div>

      {/* Performance Graph */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-terminal-green mb-6">
          Impact of Synthetic Data on Model Performance
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="epoch" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
              label={{ value: 'Training Epochs', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
              label={{ value: 'mAP Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              domain={[0.3, 1.0]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#141b2d', 
                border: '1px solid #2196F3',
                borderRadius: '8px',
                fontFamily: 'monospace'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="realOnly" 
              stroke="#6b7280" 
              strokeWidth={2}
              name="Real Data Only"
              dot={{ fill: '#6b7280', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="withSynthetic" 
              stroke="#00FF41" 
              strokeWidth={3}
              name="Real + Synthetic (Falcon)"
              dot={{ fill: '#00FF41', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-400 font-mono">Real Data Only (Plateaus)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-terminal-green rounded"></div>
            <span className="text-sm text-terminal-green font-mono">With Falcon Synthetic Data</span>
          </div>
        </div>
      </div>

      {/* Edge Cases Table */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-border-glow mb-4">Active Edge Cases</h3>
        <div className="space-y-3">
          {edgeCases.map((caseItem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-panel-dark rounded-lg 
                       border border-border-glow/20 hover:border-border-glow/40 transition-all"
            >
              <div className="flex items-center space-x-4">
                <Flame className={`w-5 h-5 ${caseItem.status === 'active' ? 'text-spacex-orange animate-pulse-slow' : 'text-gray-500'}`} />
                <div>
                  <p className="font-mono font-bold">{caseItem.scenario}</p>
                  <p className="text-xs text-gray-500">Triggers: {caseItem.triggers}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Improvement</p>
                  <p className="font-mono font-bold text-terminal-green">{caseItem.improved}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold
                               ${caseItem.status === 'resolved' 
                                 ? 'bg-terminal-green/20 text-terminal-green' 
                                 : 'bg-spacex-orange/20 text-spacex-orange'}`}>
                  {caseItem.status.toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How Falcon Works */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-spacex-orange mb-4">How Falcon-Link Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-border-glow mb-2">Trigger Conditions</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-spacex-orange">•</span>
                <span>Confidence between <code className="text-yellow-400">0.25-0.45</code> (ambiguous)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-spacex-orange">•</span>
                <span>Repeated detection failures on same object</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-spacex-orange">•</span>
                <span>High IoU variance between Layer 1 & 2</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-terminal-green mb-2">Synthetic Generation Pipeline</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-terminal-green">1.</span>
                <span>Extract edge case features (occlusion, lighting, angle)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-terminal-green">2.</span>
                <span>Generate augmented variants (rotation, noise, blur)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-terminal-green">3.</span>
                <span>Re-train model incrementally on new data</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-terminal-green">4.</span>
                <span>Validate improvement and mark case as resolved</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FalconMonitor;
