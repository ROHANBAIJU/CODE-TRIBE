import { motion } from 'framer-motion';
import {
  Activity,
  Circle,
  Flame,
  Globe,
  Layers,
  Map,
  Shield
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { healthCheck } from '../services/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'degraded' | 'offline'>('offline');
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await healthCheck();
        setSystemStatus(health.status === 'nominal' ? 'nominal' : 'degraded');
      } catch {
        setSystemStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/dashboard', icon: Activity, label: 'Dashboard' },
    { path: '/fusion', icon: Layers, label: 'Fusion' },
    { path: '/falcon', icon: Flame, label: 'Falcon' },
    { path: '/map', icon: Map, label: 'Station Map' },
    { path: '/snet', icon: Globe, label: 'SingularityNET' },
  ];

  const statusColors = {
    nominal: 'text-terminal-green',
    degraded: 'text-yellow-400',
    offline: 'text-red-500',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-panel" style={{ 
        borderBottom: '1px solid rgba(33, 150, 243, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield style={{ width: '32px', height: '32px', color: '#00FF41' }} className="animate-pulse-slow" />
              <div>
                <h1 className="text-glow" style={{ 
                  fontSize: '1.875rem', 
                  fontWeight: 'bold', 
                  color: '#00FF41',
                  margin: 0 
                }}>
                  SafetyGuard AI
                </h1>
                <p className="font-mono" style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  margin: 0
                }}>
                  Industrial Safety Platform v3.0 • Powered by SingularityNET
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Recording Indicator */}
              <motion.div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isRecording && (
                  <>
                    <Circle style={{ width: '12px', height: '12px', fill: '#ef4444', color: '#ef4444' }} />
                    <span className="font-mono" style={{ fontSize: '0.875rem' }}>REC</span>
                  </>
                )}
              </motion.div>

              {/* System Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="font-mono" style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  System:
                </span>
                <span className={`font-mono ${statusColors[systemStatus]}`} style={{ 
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {systemStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <nav className="glass-panel" style={{ 
          width: '80px',
          borderRight: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '2rem 0',
            gap: '2rem'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ 
                    position: 'relative',
                    textDecoration: 'none'
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      backgroundColor: isActive ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
                      color: isActive ? '#2196F3' : '#9ca3af',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Icon style={{ width: '24px', height: '24px' }} />
                  </motion.div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      style={{
                        position: 'absolute',
                        right: '-2px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '32px',
                        backgroundColor: '#00FF41',
                        borderRadius: '9999px'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="container" style={{ padding: '1.5rem' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
