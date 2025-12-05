import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database, 
  Zap,
  Eye,
  Brain,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AstroOpsStatus {
  stage: 'monitoring' | 'failure_detected' | 'generating_data' | 'retraining' | 'deploying' | 'healed';
  progress: number;
  message: string;
  timestamp: Date;
}

interface PipelineStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'active' | 'completed' | 'error';
  description: string;
}

interface AstroOpsPipelineProps {
  falconTriggered?: boolean;
  lowConfidenceCount?: number;
  onHealingComplete?: () => void;
}

const AstroOpsPipeline = ({ 
  falconTriggered = false, 
  lowConfidenceCount = 0,
  onHealingComplete 
}: AstroOpsPipelineProps) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isHealing, setIsHealing] = useState(false);
  const [healingHistory, setHealingHistory] = useState<AstroOpsStatus[]>([]);
  const [syntheticImagesGenerated, setSyntheticImagesGenerated] = useState(0);
  const [modelAccuracy, setModelAccuracy] = useState(0.72);

  const stages: PipelineStage[] = [
    {
      id: 'monitor',
      name: 'Real-Time Monitoring',
      icon: <Eye className="w-6 h-6" />,
      status: currentStage >= 0 ? (currentStage === 0 && isHealing ? 'active' : 'completed') : 'idle',
      description: 'Continuous confidence monitoring'
    },
    {
      id: 'detect',
      name: 'Failure Detection',
      icon: <AlertTriangle className="w-6 h-6" />,
      status: currentStage >= 1 ? (currentStage === 1 ? 'active' : 'completed') : 'idle',
      description: 'Low confidence threshold triggered'
    },
    {
      id: 'simulate',
      name: 'Synthetic Data Gen',
      icon: <Database className="w-6 h-6" />,
      status: currentStage >= 2 ? (currentStage === 2 ? 'active' : 'completed') : 'idle',
      description: 'Duality Falcon simulation'
    },
    {
      id: 'retrain',
      name: 'Auto-Retrain',
      icon: <Brain className="w-6 h-6" />,
      status: currentStage >= 3 ? (currentStage === 3 ? 'active' : 'completed') : 'idle',
      description: 'Fine-tune on edge cases'
    },
    {
      id: 'deploy',
      name: 'Hot-Swap Deploy',
      icon: <Zap className="w-6 h-6" />,
      status: currentStage >= 4 ? (currentStage === 4 ? 'active' : 'completed') : 'idle',
      description: 'Zero-downtime model update'
    },
    {
      id: 'healed',
      name: 'Self-Healed',
      icon: <CheckCircle className="w-6 h-6" />,
      status: currentStage >= 5 ? 'completed' : 'idle',
      description: 'System restored to optimal'
    }
  ];

  // Trigger healing when falcon is activated
  useEffect(() => {
    if (falconTriggered && !isHealing) {
      startHealingSequence();
    }
  }, [falconTriggered]);

  const startHealingSequence = async () => {
    if (isHealing) return;
    
    setIsHealing(true);
    setCurrentStage(0);
    setSyntheticImagesGenerated(0);

    // Stage 0: Monitoring (already active)
    await delay(1000);
    
    // Stage 1: Failure Detected
    setCurrentStage(1);
    addToHistory('failure_detected', 'Low confidence detection triggered Falcon-Link');
    await delay(1500);

    // Stage 2: Generating Synthetic Data
    setCurrentStage(2);
    addToHistory('generating_data', 'Duality Falcon generating synthetic training data...');
    
    // Animate synthetic image generation
    for (let i = 0; i <= 1000; i += 50) {
      setSyntheticImagesGenerated(i);
      await delay(100);
    }
    await delay(500);

    // Stage 3: Retraining
    setCurrentStage(3);
    addToHistory('retraining', 'Fine-tuning model on edge cases...');
    
    // Animate accuracy improvement
    for (let acc = 0.72; acc <= 0.86; acc += 0.02) {
      setModelAccuracy(acc);
      await delay(200);
    }
    await delay(500);

    // Stage 4: Deploying
    setCurrentStage(4);
    addToHistory('deploying', 'Hot-swapping model weights at edge...');
    await delay(1500);

    // Stage 5: Healed
    setCurrentStage(5);
    addToHistory('healed', 'System self-healed successfully! +14% accuracy improvement');
    setIsHealing(false);
    
    if (onHealingComplete) {
      onHealingComplete();
    }
  };

  const addToHistory = (stage: AstroOpsStatus['stage'], message: string) => {
    setHealingHistory(prev => [{
      stage,
      progress: 100,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 5));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStageColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'completed': return 'text-terminal-green border-terminal-green bg-terminal-green/10';
      case 'error': return 'text-red-500 border-red-500 bg-red-500/10';
      default: return 'text-gray-500 border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-terminal-green flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 ${isHealing ? 'animate-spin' : ''}`} />
            AstroOps Self-Healing Pipeline
          </h3>
          <p className="text-sm text-gray-400 font-mono mt-1">
            Autonomous failure detection and recovery
          </p>
        </div>
        
        {!isHealing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startHealingSequence}
            className="px-4 py-2 bg-yellow-400/20 border border-yellow-400 rounded-lg text-yellow-400 font-mono text-sm hover:bg-yellow-400/30 transition-colors"
          >
            Simulate Failure
          </motion.button>
        )}
      </div>

      {/* Pipeline Visualization */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              {/* Stage Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: stage.status === 'active' ? [1, 1.1, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: stage.status === 'active' ? Infinity : 0 
                }}
                className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center ${getStageColor(stage.status)}`}
              >
                {stage.icon}
                
                {/* Pulse effect for active */}
                {stage.status === 'active' && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                  />
                )}
              </motion.div>

              {/* Connector Arrow */}
              {idx < stages.length - 1 && (
                <div className="flex items-center mx-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: currentStage > idx ? '100%' : '0%',
                      backgroundColor: currentStage > idx ? '#00FF41' : '#374151'
                    }}
                    className="h-1 w-12 rounded"
                    style={{ minWidth: '3rem' }}
                  />
                  <ArrowRight className={`w-4 h-4 ${currentStage > idx ? 'text-terminal-green' : 'text-gray-600'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage Labels */}
        <div className="flex items-start justify-between mt-4">
          {stages.map((stage) => (
            <div key={stage.id} className="text-center w-16">
              <p className={`text-xs font-mono ${stage.status === 'active' ? 'text-yellow-400' : stage.status === 'completed' ? 'text-terminal-green' : 'text-gray-500'}`}>
                {stage.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {/* Synthetic Images */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Synthetic Images</span>
          </div>
          <motion.p 
            key={syntheticImagesGenerated}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-blue-400 font-mono"
          >
            {syntheticImagesGenerated.toLocaleString()}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">Generated by Falcon</p>
        </div>

        {/* Model Accuracy */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-terminal-green" />
            <span className="text-sm text-gray-400">Model Accuracy</span>
          </div>
          <motion.p 
            key={modelAccuracy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-terminal-green font-mono"
          >
            {(modelAccuracy * 100).toFixed(1)}%
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">
            {modelAccuracy > 0.72 ? `+${((modelAccuracy - 0.72) * 100).toFixed(1)}% improvement` : 'Baseline'}
          </p>
        </div>

        {/* Healing Status */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">System Status</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${isHealing ? 'text-yellow-400' : 'text-terminal-green'}`}>
            {isHealing ? 'HEALING' : 'OPTIMAL'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isHealing ? 'Self-repair in progress...' : 'All systems nominal'}
          </p>
        </div>
      </div>

      {/* History Log */}
      <div className="glass-panel p-4">
        <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Healing History
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <AnimatePresence>
            {healingHistory.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-4">
                No healing events yet. System is monitoring...
              </p>
            ) : (
              healingHistory.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-xs font-mono p-2 bg-panel-dark rounded"
                >
                  <span className="text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`
                    ${event.stage === 'healed' ? 'text-terminal-green' : ''}
                    ${event.stage === 'failure_detected' ? 'text-yellow-400' : ''}
                    ${event.stage === 'generating_data' ? 'text-blue-400' : ''}
                    ${event.stage === 'retraining' ? 'text-purple-400' : ''}
                  `}>
                    {event.message}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AstroOpsPipeline;
