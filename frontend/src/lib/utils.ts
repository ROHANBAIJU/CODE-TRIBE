import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.75) return 'text-terminal-green';
  if (confidence >= 0.45) return 'text-yellow-400';
  return 'text-red-500';
};

export const getConfidenceStatus = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
};

export const classColors: Record<string, string> = {
  OxygenTank: '#00FF41',
  FireExtinguisher: '#FC3D21',
  EmergencyPhone: '#FFA500',
  FireAlarm: '#FF1744',
  SafetyHelmet: '#2196F3',
};
