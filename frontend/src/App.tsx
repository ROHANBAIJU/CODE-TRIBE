import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FalconMonitor from './pages/FalconMonitor';
import FusionVisualizer from './pages/FusionVisualizer';
import SingularityNet from './pages/SingularityNet';
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
          <Route path="/snet" element={<SingularityNet />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
