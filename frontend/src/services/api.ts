import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // Increased to 60 seconds for healing with training images
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Detection {
  bbox?: number[];
  box?: number[];  // Alternative format from API
  confidence?: number;
  score?: number;  // Alternative format from API
  class?: string;
  label?: string;  // Alternative format from API
  class_id?: number;
  track_id?: string;
  track_age?: number;
  temporal_boost?: number;
  layer?: string;
  yolo_confidence?: number;
  rnn_confidence?: number;
  fusion_weights?: string;
}

export interface InferenceResponse {
  detections: Detection[];
  inference_time?: number;
  latency_ms?: number;
  falcon_triggered?: boolean;
  falcon_trigger?: boolean;  // Alternative format from API
  total_objects?: number;
  count?: number;  // Alternative format from API
  layer_timings?: {
    layer1_yolo_ms: number;
    layer2_rnn_ms: number;
    layer3_fusion_ms: number;
  };
  system_info?: {
    rnn_enabled: boolean;
    fusion_version: string;
  };
}

export interface HealthStatus {
  status: string;
  modules: string[];
  db_connection: string;
  gpu: string;
  rnn_temporal?: string;
}

export interface LogEntry {
  id: string;
  camera_id: string;
  confidence: number;
  object_class: string;
  timestamp: string;
}

// NEW: Chat Types
export interface ChatResponse {
  query: string;
  response: string;
  is_safe: boolean;
  confidence: number;
  alerts: string[];
  recommendations: string[];
  equipment_detected: number;
  detections: Detection[];
  processing_time_ms: number;
}

export interface ChatStatus {
  provider: string;
  groq_configured: boolean;
  status: string;
  last_detections_count: number;
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

// NEW: Chat API Functions
export const chatSafetyQuery = async (imageFile: File, query: string): Promise<ChatResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('query', query);

  const response = await apiClient.post('/chat/safety', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const chatQuickQuery = async (query: string): Promise<{ query: string; response: string; detections_used: number; equipment: string[] }> => {
  const formData = new FormData();
  formData.append('query', query);

  const response = await apiClient.post('/chat/quick', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getChatStatus = async (): Promise<ChatStatus> => {
  const response = await apiClient.get('/chat/status');
  return response.data;
};

// ============================================
// SINGULARITYNET API FUNCTIONS
// ============================================

export interface SNetStatus {
  connected: boolean;
  mode: string;
  wallet_address: string | null;
  agi_balance: number;
  published_services: number;
  total_agi_earned: number;
  total_calls: number;
}

export interface SNetService {
  service_id: string;
  name: string;
  description: string;
  organization: string;
  price_per_call: number;
  rating: number;
  calls: number;
}

export interface SNetEarnings {
  total_agi_earned: number;
  total_calls_served: number;
  services: {
    name: string;
    calls: number;
    earned: number;
    status: string;
  }[];
  period: string;
  usd_equivalent: number;
}

export const getSNetStatus = async (): Promise<SNetStatus> => {
  const response = await apiClient.get('/snet/status');
  return response.data;
};

export const connectToSNet = async (walletAddress?: string): Promise<any> => {
  const response = await apiClient.post('/snet/connect', { wallet_address: walletAddress });
  return response.data;
};

export const disconnectFromSNet = async (): Promise<any> => {
  const response = await apiClient.post('/snet/disconnect');
  return response.data;
};

export const getSNetServices = async (): Promise<{ services: SNetService[]; count: number }> => {
  const response = await apiClient.get('/snet/services');
  return response.data;
};

export const getSNetPublishedServices = async (): Promise<{ published_services: any[]; count: number }> => {
  const response = await apiClient.get('/snet/published');
  return response.data;
};

export const publishToSNet = async (
  serviceName: string,
  serviceType: string,
  description: string,
  pricePerCall: number = 0.001
): Promise<any> => {
  const response = await apiClient.post('/snet/publish', {
    service_name: serviceName,
    service_type: serviceType,
    description,
    price_per_call: pricePerCall
  });
  return response.data;
};

export const callSNetService = async (serviceId: string, inputData: object = {}): Promise<any> => {
  const response = await apiClient.post('/snet/call', {
    service_id: serviceId,
    input_data: inputData
  });
  return response.data;
};

export const getSNetEarnings = async (): Promise<SNetEarnings> => {
  const response = await apiClient.get('/snet/earnings');
  return response.data;
};


// ============================================
// FALCON-LINK API FUNCTIONS 🦅
// ============================================

export interface FalconStatus {
  status: string;
  total_triggers: number;
  synthetic_images_generated: number;
  avg_improvement: number;
  cases_resolved: number;
  total_cases: number;
  recent_triggers: FalconTrigger[];
  is_generating: boolean;
}

export interface FalconTrigger {
  _id: string;
  object_class: string;
  confidence: number;
  reason: string;
  timestamp: string;
  status: string;
}

export interface SyntheticImage {
  _id: string;
  object_class: string;
  variation: string;
  generated_at: string;
  image_id: string;
  quality_score: number;
  augmentation_params: {
    brightness: number;
    contrast: number;
    rotation: number;
    noise_level: number;
  };
}

export interface EdgeCase {
  _id: string;
  scenario: string;
  object_class: string;
  description: string;
  triggers: number;
  improvement: number;
  status: string;
  created_at: string;
  synthetic_images: number;
}

export interface TrainingImagePreview {
  filename: string;
  augmentation_type: string;
  image_base64: string;
}

export interface HealingResult {
  status: string;
  object_class: string;
  synthetic_images_generated: number;
  augmented_training_images?: number;
  training_images_preview?: TrainingImagePreview[];
  improvement_estimate: string;
  stages: {
    name: string;
    status: string;
    duration_ms: number;
    images?: number;
  }[];
}

export const getFalconStatus = async (): Promise<FalconStatus> => {
  const response = await apiClient.get('/falcon/status');
  return response.data;
};

export const triggerFalcon = async (objectClass: string, confidence: number, reason: string = 'low_confidence'): Promise<any> => {
  const response = await apiClient.post('/falcon/trigger', {
    object_class: objectClass,
    confidence,
    reason
  });
  return response.data;
};

export const getFalconTriggers = async (): Promise<{ triggers: FalconTrigger[] }> => {
  const response = await apiClient.get('/falcon/triggers');
  return response.data;
};

export const generateSyntheticImages = async (
  objectClass: string,
  count: number = 25,
  variationType: string = 'random'
): Promise<{ status: string; object_class: string; images_generated: number; images: SyntheticImage[] }> => {
  const response = await apiClient.post('/falcon/generate-synthetic', {
    object_class: objectClass,
    count,
    variation_type: variationType
  });
  return response.data;
};

export const getSyntheticImages = async (): Promise<{ images: SyntheticImage[]; total: number }> => {
  const response = await apiClient.get('/falcon/synthetic-images');
  return response.data;
};

export const addEdgeCase = async (scenario: string, objectClass: string, description: string): Promise<{ status: string; edge_case: EdgeCase }> => {
  const response = await apiClient.post('/falcon/edge-case', {
    scenario,
    object_class: objectClass,
    description
  });
  return response.data;
};

export const getEdgeCases = async (): Promise<{ edge_cases: EdgeCase[] }> => {
  const response = await apiClient.get('/falcon/edge-cases');
  return response.data;
};

export const resolveEdgeCase = async (caseId: string, improvement: number): Promise<{ status: string; case_id: string; improvement: number }> => {
  const response = await apiClient.post(`/falcon/resolve-case/${caseId}`, {
    improvement
  });
  return response.data;
};

export const runHealingPipeline = async (objectClass: string): Promise<HealingResult> => {
  const response = await apiClient.post('/falcon/run-healing', {
    object_class: objectClass
  });
  return response.data;
};


export default apiClient;
