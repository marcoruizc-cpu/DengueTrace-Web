import type { RiskLevel, Symptom } from '../types/api';

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  HIGH_FEVER: 'Fiebre alta (>38°C)',
  HEADACHE: 'Dolor de cabeza intenso',
  MUSCLE_JOINT_PAIN: 'Dolor muscular/articular',
  RASH: 'Sarpullido (rash)',
  BLEEDING_GUMS_OR_NOSE: 'Sangrado de encías o nariz (signo de alarma)',
};

export const RISK_META: Record<RiskLevel, { label: string; color: string }> = {
  LOW: { label: 'Bajo', color: '#FCD9A8' },
  MEDIUM: { label: 'Medio', color: '#F59E0B' },
  HIGH: { label: 'Alto', color: '#DC2626' },
  CRITICAL: { label: 'Muy alto', color: '#7F1D1D' },
};

export const serializeSymptoms = (symptoms: Symptom[]) => symptoms.join(',');

export const parseSymptoms = (raw: string): Symptom[] =>
  raw
    .split(',')
    .map(s => s.trim())
    .filter((s): s is Symptom => s in SYMPTOM_LABELS);
