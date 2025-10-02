// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthData {
  message: string | null;
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  role: string;
  sub: string;
}

// Position Types
export interface Position {
  uuid: string;
  name: string;
  active: boolean;
  description: string;
}

export interface CreatePositionRequest {
  name: string;
  description: string;
  active: boolean;
}

export interface UpdatePositionRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

// Worker Types
export interface Worker {
  uuid: string;
  fullName: string;
  phone: string;
  email: string;
  payFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  rate: number;
  status: 'ACTIVE' | 'INACTIVE';
  payable: boolean;
  team: string;
  positionUuid: string;
  positionName: string;
  nationalId?: string;
  kraPin?: string;
}

export interface CreateWorkerRequest {
  fullName: string;
  phone: string;
  email: string;
  payFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  rate: number;
  nationalId?: string;
  kraPin?: string;
  team?: string;
  positionUuid: string;
}

// Pay Period Types
export interface PayPeriod {
  uuid: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  label?: string;
  status: 'DRAFT' | 'APPROVED';
}

export interface CreatePayPeriodRequest {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  label?: string;
}

// Disbursement Types
export interface DisbursementBatch {
  uuid: string;
  createdAt: string;
  status: 'DRAFT' | 'SENT' | 'COMPLETED';
  sourceType: 'PERIOD' | 'SINGLE';
  sourceRef: string;
  counts: {
    total: number;
    sent: number;
    success: number;
    failed: number;
    pending: number;
  };
  totalAmount: number;
}

export interface Payout {
  uuid: string;
  workerName: string;
  msisdn: string;
  amount: number;
  state: 'PENDING' | 'SENT' | 'SUCCESS' | 'FAILED';
  mpesaExternalRef?: string;
  mpesaOriginatorConversationId?: string;
  mpesaConversationId?: string;
  sentAt?: string;
  finalizedAt?: string;
  mpesaResultDesc?: string;
}

export interface CreateSinglePayoutRequest {
  workerUuid: string;
  amount: number;
  clientRef?: string;
}