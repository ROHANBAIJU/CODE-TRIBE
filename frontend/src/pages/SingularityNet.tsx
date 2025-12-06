import { motion } from 'framer-motion';
import SingularityNetPanel from '../components/SingularityNetPanel';

const SingularityNet = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h2 className="text-glow" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#8B5CF6', margin: 0 }}>
          SingularityNET Integration
        </h2>
        <p className="font-mono" style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Decentralized AI Marketplace • AGI Token Economy
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🌐
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e5e7eb', fontWeight: 'bold', margin: 0 }}>
              Connect to the AI Economy
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Publish your safety detection services to the SingularityNET marketplace and earn AGI tokens. 
              Access advanced AI services from the decentralized network.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main SingularityNET Panel */}
      <SingularityNetPanel onStatusChange={(connected) => console.log('SNet connected:', connected)} />

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel"
          style={{ padding: '1.5rem', borderRadius: '0.75rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💰</div>
          <h4 style={{ color: '#e5e7eb', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Earn AGI Tokens</h4>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
            Monetize your safety AI services. Get paid in AGI tokens for every API call.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel"
          style={{ padding: '1.5rem', borderRadius: '0.75rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔗</div>
          <h4 style={{ color: '#e5e7eb', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Decentralized Network</h4>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
            Join the world's first decentralized AI marketplace. No middlemen, direct P2P.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-panel"
          style={{ padding: '1.5rem', borderRadius: '0.75rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
          <h4 style={{ color: '#e5e7eb', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Access AI Services</h4>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
            Consume advanced AI services from the network to enhance your safety monitoring.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SingularityNet;
