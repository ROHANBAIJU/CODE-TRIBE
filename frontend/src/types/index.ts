// Global type definitions for AstroGuard frontend

export interface Detection {
  bbox: number[]; // [x1, y1, x2, y2] normalized
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

export interface EquipmentMarker {
  id: string;
  x: number;
  y: number;
  type: string;
  confidence: number;
  status: 'high' | 'medium' | 'low';
  lastSeen: string;
}

export type ConfidenceStatus = 'high' | 'medium' | 'low';

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.75,
  MEDIUM: 0.45,
  LOW: 0.25,
} as const;

export const EQUIPMENT_CLASSES = [
  'OxygenTank',
  'FireExtinguisher',
  'EmergencyPhone',
  'FireAlarm',
  'SafetyHelmet',
] as const;

export type EquipmentClass = typeof EQUIPMENT_CLASSES[number];
