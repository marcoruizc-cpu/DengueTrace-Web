export type Role = 'USER' | 'ADMIN' | 'MODERATOR';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationChannel = 'PUSH' | 'SMS';
export type Symptom = 'HIGH_FEVER' | 'HEADACHE' | 'MUSCLE_JOINT_PAIN' | 'RASH' | 'BLEEDING_GUMS_OR_NOSE';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  districtId: number | null;
  districtName: string | null;
  role: Role;
  preferredChannel: NotificationChannel | null;
  alertRadiusKm: number | null;
  pushRegistered: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  districtId?: number;
}

export interface UserUpdateRequest {
  fullName?: string;
  phone?: string;
  districtId?: number;
  preferredChannel?: NotificationChannel;
  alertRadiusKm?: number;
  fcmToken?: string;
}

export interface District {
  id: number;
  name: string;
  department: string;
  province: string | null;
  population: number | null;
  latitude: number | null;
  longitude: number | null;
}
export type DistrictRequest = Omit<District, 'id'>;

export interface Alert {
  id: number;
  districtId: number;
  districtName: string;
  riskLevel: RiskLevel;
  message: string;
  thresholdExceeded: number | null;
  active: boolean;
  createdAt: string;
}

export interface AlertCreateRequest {
  districtId: number;
  riskLevel: RiskLevel;
  message: string;
  thresholdExceeded?: number;
}

export interface PredictiveModel {
  id: number;
  districtId: number;
  districtName: string;
  historicalAverage: number;
  recentAverage: number;
  trendFactor: number;
  climateFactor: number;
  projectedWeek1: number;
  projectedWeek2: number;
  projectedWeek3: number;
  projectedWeek4: number;
  riskLevel: RiskLevel;
  confidenceLevel: number;
  generatedAt: string;
}

export interface HistoricalCase {
  id: number;
  districtId: number;
  districtName: string;
  caseCount: number;
  weekStartDate: string;
  year: number;
}
export type HistoricalCaseRequest = Omit<HistoricalCase, 'id' | 'districtName'>;

export interface ClimateData {
  id: number;
  districtId: number;
  temperature: number;
  humidity: number;
  precipitationMm: number;
  recordedDate: string;
}
export type ClimateDataRequest = Omit<ClimateData, 'id'>;

export interface News {
  id: number;
  districtId: number;
  title: string;
  summary: string | null;
  source: string | null;
  url: string | null;
  publishedAt: string;
}

export interface Report {
  id: number;
  districtId: number;
  districtName: string;
  latitude: number | null;
  longitude: number | null;
  symptoms: string;
  createdAt: string;
}

export interface ReportRequest {
  districtId?: number;
  latitude?: number;
  longitude?: number;
  symptoms: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[] | null;
}
