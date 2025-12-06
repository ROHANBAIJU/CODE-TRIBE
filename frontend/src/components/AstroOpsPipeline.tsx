import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Brain,
    CheckCircle,
    Clock,
    Database,
    Eye,
    Loader2,
    Play,
    RefreshCw,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFalconStatus, runHealingPipeline, type FalconStatus } from '../services/api';

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
  onHealingComplete?: (healedClass: string) => void;
}

const AstroOpsPipeline = ({ 
  falconTriggered = false, 
  onHealingComplete 
}: AstroOpsPipelineProps) => {
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [isHealing, setIsHealing] = useState(false);
  const [healingHistory, setHealingHistory] = useState<AstroOpsStatus[]>([]);
  const [syntheticImagesGenerated, setSyntheticImagesGenerated] = useState(0);
  const [modelAccuracy, setModelAccuracy] = useState(0.72);
  const [falconStatus, setFalconStatus] = useState<FalconStatus | null>(null);
  const [selectedClass, setSelectedClass] = useState('OxygenTank');

  const safetyClasses = [
    'OxygenTank', 'NitrogenTank', 'FirstAidBox', 'FireAlarm', 
    'SafetySwitchPanel', 'EmergencyPhone', 'FireExtinguisher'
  ];

  const stages: PipelineStage[] = [
    {
      id: 'monitor',
      name: 'Monitoring',
      icon: <Eye className="w-5 h-5" />,
      status: currentStage >= 0 ? (currentStage === 0 ? 'active' : 'completed') : 'idle',
      description: 'Real-time confidence monitoring'
    },
    {
      id: 'detect',
      name: 'Detection',
      icon: <AlertTriangle className="w-5 h-5" />,
      status: currentStage >= 1 ? (currentStage === 1 ? 'active' : 'completed') : 'idle',
      description: 'Failure threshold triggered'
    },
    {
      id: 'generate',
      name: 'Generate',
      icon: <Database className="w-5 h-5" />,
      status: currentStage >= 2 ? (currentStage === 2 ? 'active' : 'completed') : 'idle',
      description: 'Synthetic data generation'
    },
    {
      id: 'retrain',
      name: 'Retrain',
      icon: <Brain className="w-5 h-5" />,
      status: currentStage >= 3 ? (currentStage === 3 ? 'active' : 'completed') : 'idle',
      description: 'Fine-tune on edge cases'
    },
    {
      id: 'deploy',
      name: 'Deploy',
      icon: <Zap className="w-5 h-5" />,
      status: currentStage >= 4 ? (currentStage === 4 ? 'active' : 'completed') : 'idle',
      description: 'Hot-swap model update'
    },
    {
      id: 'healed',
      name: 'Healed',
      icon: <CheckCircle className="w-5 h-5" />,
      status: currentStage >= 5 ? 'completed' : 'idle',
      description: 'System restored'
    }
  ];

  // Fetch Falcon status on mount
  useEffect(() => {
    fetchFalconStatus();
    const interval = setInterval(fetchFalconStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Trigger healing when falcon is activated
  useEffect(() => {
    if (falconTriggered && !isHealing) {
      startRealHealingSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [falconTriggered]);

  const fetchFalconStatus = async () => {
    try {
      const status = await getFalconStatus();
      setFalconStatus(status);
      setSyntheticImagesGenerated(status.synthetic_images_generated);
    } catch (err) {
      console.error('Failed to fetch Falcon status:', err);
    }
  };

  const startRealHealingSequence = async () => {
    if (isHealing) return;
    
    setIsHealing(true);
    setCurrentStage(0);
    
    try {
      // Stage 0: Monitoring
      addToHistory('monitoring', `Starting healing for ${selectedClass}...`);
      await delay(800);
      
      // Stage 1: Failure Detected
      setCurrentStage(1);
      addToHistory('failure_detected', `Low confidence detection triggered for ${selectedClass}`);
      await delay(800);
      
      // Stage 2: Generating Synthetic Data - REAL API CALL
      setCurrentStage(2);
      addToHistory('generating_data', 'Calling Falcon-Link API to generate synthetic data...');
      
      // Real API call to generate synthetic images
      const result = await runHealingPipeline(selectedClass);
      
      // Animate the count
      const targetImages = result.synthetic_images_generated;
      for (let i = 0; i <= targetImages; i += 5) {
        setSyntheticImagesGenerated(prev => prev + 5);
        await delay(50);
      }
      
      await delay(500);
      
      // Stage 3: Retraining
      setCurrentStage(3);
      addToHistory('retraining', `Fine-tuning model with ${targetImages} new synthetic images...`);
      
      // Animate accuracy improvement
      const improvementPercent = parseFloat(result.improvement_estimate.replace('+', '').replace('%', ''));
      const targetAccuracy = 0.72 + (improvementPercent / 100);
      
      for (let acc = 0.72; acc <= targetAccuracy; acc += 0.01) {
        setModelAccuracy(acc);
        await delay(100);
      }
      await delay(500);
      
      // Stage 4: Deploying
      setCurrentStage(4);
      addToHistory('deploying', 'Hot-swapping model weights at edge...');
      await delay(1000);
      
      // Stage 5: Healed
      setCurrentStage(5);
      addToHistory('healed', `✅ Self-healed! ${result.improvement_estimate} accuracy improvement`);
      
      // Refresh status
      await fetchFalconStatus();
      
    } catch (error) {
      console.error('Healing failed:', error);
      addToHistory('failure_detected', '❌ Healing failed - check backend connection');
    } finally {
      setIsHealing(false);
      if (onHealingComplete) {
        onHealingComplete(selectedClass);
      }
    }
  };

  const addToHistory = (stage: AstroOpsStatus['stage'], message: string) => {
    setHealingHistory(prev => [{
      stage,
      progress: 100,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 10));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStageColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
      case 'completed': return 'text-terminal-green border-terminal-green bg-terminal-green/20';
      case 'error': return 'text-red-500 border-red-500 bg-red-500/20';
      default: return 'text-gray-500 border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHealing ? 'bg-yellow-400/20' : 'bg-terminal-green/20'}`}>
            <RefreshCw className={`w-5 h-5 ${isHealing ? 'animate-spin text-yellow-400' : 'text-terminal-green'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AstroOps Self-Healing</h3>
            <p className="text-xs text-gray-400 font-mono">
              {isHealing ? 'Healing in progress...' : 'Autonomous recovery system'}
            </p>
          </div>
        </div>
        
        {/* Class Selector & Trigger */}
        <div className="flex items-center gap-2">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={isHealing}
            className="bg-panel-dark border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-terminal-green focus:outline-none"
          >
            {safetyClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRealHealingSequence}
            disabled={isHealing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
              isHealing 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400'
            }`}
          >
            {isHealing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Healing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Healing
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Compact Pipeline Visualization */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              {/* Stage Circle */}
              <motion.div
                animate={{ 
                  scale: stage.status === 'active' ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: stage.status === 'active' ? Infinity : 0 }}
                className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStageColor(stage.status)}`}
              >
                {stage.icon}
                
                {stage.status === 'active' && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                  />
                )}
              </motion.div>

              {/* Connector */}
              {idx < stages.length - 1 && (
                <div className="flex items-center mx-1">
                  <motion.div
                    animate={{ 
                      backgroundColor: currentStage > idx ? '#00FF41' : '#374151'
                    }}
                    className="h-0.5 w-8 rounded"
                  />
                  <ArrowRight className={`w-3 h-3 ${currentStage > idx ? 'text-terminal-green' : 'text-gray-600'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage Labels */}
        <div className="flex items-start justify-between mt-2">
          {stages.map((stage) => (
            <div key={stage.id} className="text-center w-12">
              <p className={`text-[10px] font-mono leading-tight ${
                stage.status === 'active' ? 'text-yellow-400' : 
                stage.status === 'completed' ? 'text-terminal-green' : 'text-gray-500'
              }`}>
                {stage.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Metrics - Compact Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-panel p-3 text-center">
          <Database className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <motion.p 
            key={syntheticImagesGenerated}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-blue-400 font-mono"
          >
            {syntheticImagesGenerated}
          </motion.p>
          <p className="text-[10px] text-gray-500">Synthetic Images</p>
        </div>

        <div className="glass-panel p-3 text-center">
          <TrendingUp className="w-4 h-4 text-terminal-green mx-auto mb-1" />
          <motion.p 
            key={modelAccuracy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-terminal-green font-mono"
          >
            {(modelAccuracy * 100).toFixed(1)}%
          </motion.p>
          <p className="text-[10px] text-gray-500">Accuracy</p>
        </div>

        <div className="glass-panel p-3 text-center">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-400 font-mono">
            {falconStatus?.total_triggers || 0}
          </p>
          <p className="text-[10px] text-gray-500">Triggers</p>
        </div>

        <div className="glass-panel p-3 text-center">
          <CheckCircle className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-400 font-mono">
            {falconStatus?.cases_resolved || 0}/{falconStatus?.total_cases || 0}
          </p>
          <p className="text-[10px] text-gray-500">Resolved</p>
        </div>
      </div>

      {/* History Log - Compact */}
      <div className="glass-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400">Activity Log</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          <AnimatePresence>
            {healingHistory.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-2">
                Select a class and click "Run Healing" to start
              </p>
            ) : (
              healingHistory.map((event, idx) => (
                <motion.div
                  key={`${event.timestamp.getTime()}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs font-mono py-1 px-2 bg-panel-dark rounded"
                >
                  <span className="text-gray-500 text-[10px]">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`truncate ${
                    event.stage === 'healed' ? 'text-terminal-green' :
                    event.stage === 'failure_detected' ? 'text-yellow-400' :
                    event.stage === 'generating_data' ? 'text-blue-400' :
                    event.stage === 'retraining' ? 'text-purple-400' : 'text-gray-300'
                  }`}>
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
