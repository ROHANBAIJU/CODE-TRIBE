import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Wallet,
  Coins,
  Server,
  CheckCircle,
  XCircle,
  TrendingUp,
  Zap,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface SNetService {
  service_id: string;
  name: string;
  description: string;
  organization: string;
  price_per_call: number;
  rating: number;
  calls: number;
}

interface SNetStatus {
  connected: boolean;
  mode: string;
  wallet_address: string | null;
  agi_balance: number;
  published_services: number;
  total_agi_earned: number;
  total_calls: number;
}

interface SNetPanelProps {
  onStatusChange?: (connected: boolean) => void;
}

const SingularityNetPanel = ({ onStatusChange }: SNetPanelProps) => {
  const [status, setStatus] = useState<SNetStatus | null>(null);
  const [services, setServices] = useState<SNetService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [earnings, setEarnings] = useState<any>(null);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchStatus();
    fetchServices();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/snet/status`);
      const data = await res.json();
      setStatus(data);
      onStatusChange?.(data.connected);
    } catch (err) {
      console.error('Failed to fetch SNet status:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/snet/services`);
      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      console.error('Failed to fetch SNet services:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch(`${API_BASE}/snet/earnings`);
      const data = await res.json();
      setEarnings(data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  };

  const connectToSNet = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(`${API_BASE}/snet/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      await fetchStatus();
      await fetchEarnings();
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromSNet = async () => {
    try {
      await fetch(`${API_BASE}/snet/disconnect`, { method: 'POST' });
      await fetchStatus();
      setEarnings(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const callService = async (serviceId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/snet/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          input_data: { demo: true }
        })
      });
      const result = await res.json();
      // Refresh status to update balance
      await fetchStatus();
      alert(`Service call successful! Result: ${JSON.stringify(result.result)}`);
    } catch (err) {
      console.error('Service call failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">SingularityNET</h3>
            <p className="text-xs text-gray-400 font-mono">Decentralized AI Marketplace</p>
          </div>
        </div>

        {status?.connected ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={disconnectFromSNet}
            className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm font-mono hover:bg-red-500/30"
          >
            Disconnect
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectToSNet}
            disabled={isConnecting}
            className="px-4 py-2 bg-terminal-green/20 border border-terminal-green rounded-lg text-terminal-green text-sm font-mono hover:bg-terminal-green/30 disabled:opacity-50"
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
            ) : null}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </motion.button>
        )}
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-panel-dark rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            {status?.connected ? (
              <CheckCircle className="w-4 h-4 text-terminal-green" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            Status
          </div>
          <p className={`font-bold font-mono ${status?.connected ? 'text-terminal-green' : 'text-red-400'}`}>
            {status?.connected ? 'CONNECTED' : 'OFFLINE'}
          </p>
        </div>

        <div className="bg-panel-dark rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Wallet className="w-4 h-4 text-blue-400" />
            AGI Balance
          </div>
          <p className="font-bold font-mono text-blue-400">
            {status?.agi_balance?.toFixed(3) || '0.000'} AGI
          </p>
        </div>

        <div className="bg-panel-dark rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Coins className="w-4 h-4 text-yellow-400" />
            Earned
          </div>
          <p className="font-bold font-mono text-yellow-400">
            {status?.total_agi_earned?.toFixed(2) || '0.00'} AGI
          </p>
        </div>

        <div className="bg-panel-dark rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            API Calls
          </div>
          <p className="font-bold font-mono text-purple-400">
            {status?.total_calls?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Wallet Address */}
      {status?.wallet_address && (
        <div className="bg-panel-dark rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Wallet:</span>
          <code className="text-xs text-terminal-green font-mono">
            {status.wallet_address.slice(0, 10)}...{status.wallet_address.slice(-8)}
          </code>
        </div>
      )}

      {/* Available Services */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Marketplace Services
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {services.map((service) => (
            <motion.div
              key={service.service_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-panel-dark rounded-lg p-3 flex items-center justify-between hover:bg-panel-dark/70 transition-colors"
            >
              <div className="flex-1">
                <p className="font-mono text-sm text-white">{service.name}</p>
                <p className="text-xs text-gray-500">{service.organization}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-yellow-400">{service.price_per_call} AGI/call</span>
                  <span className="text-xs text-gray-500">⭐ {service.rating}</span>
                  <span className="text-xs text-gray-500">{service.calls.toLocaleString()} calls</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => callService(service.service_id)}
                disabled={isLoading || !status?.connected}
                className="p-2 bg-terminal-green/20 rounded-lg text-terminal-green hover:bg-terminal-green/30 disabled:opacity-30 disabled:cursor-not-allowed"
                title={status?.connected ? 'Call Service' : 'Connect wallet first'}
              >
                <Zap className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Earnings Report */}
      {earnings && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Earnings Report
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white font-mono">
                {earnings.total_agi_earned?.toFixed(2)} AGI
              </p>
              <p className="text-xs text-gray-400">Total Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-terminal-green font-mono">
                ${earnings.usd_equivalent?.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">USD Equivalent</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Link */}
      <a
        href="https://singularitynet.io"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-terminal-green transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Learn more about SingularityNET
      </a>
    </div>
  );
};

export default SingularityNetPanel;
