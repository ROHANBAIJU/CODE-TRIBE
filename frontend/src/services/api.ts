import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Detection {
  bbox: number[];
  confidence: number;
  class: string;
}

export interface InferenceResponse {
  detections: Detection[];
  inference_time: number;
  falcon_triggered: boolean;
  total_objects: number;
}

export interface HealthStatus {
  status: string;
  modules: string[];
  db_connection: string;
  gpu: string;
}

export interface LogEntry {
  id: string;
  camera_id: string;
  confidence: number;
  object_class: string;
  timestamp: string;
}

// API Functions
export const healthCheck = async (): Promise<HealthStatus> => {
  const response = await apiClient.get('/system/health');
  return response.data;
};

export const detectObjects = async (imageFile: File): Promise<InferenceResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await apiClient.post('/detect/fusion', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDetectionLogs = async (): Promise<LogEntry[]> => {
  const response = await apiClient.get('/logs');
  return response.data;
};

export default apiClient;
