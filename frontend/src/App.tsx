import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FusionVisualizer from './pages/FusionVisualizer';
import FalconMonitor from './pages/FalconMonitor';
import StationMap from './pages/StationMap';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fusion" element={<FusionVisualizer />} />
          <Route path="/falcon" element={<FalconMonitor />} />
          <Route path="/map" element={<StationMap />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
