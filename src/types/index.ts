
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
  status: 'ACTIVE' | 'INACTIVE';
  nationalId?: string;
  kraPin?: string;
  team: string;
  positionUuid: string;
}

// Worker Search Parameters
export interface WorkerSearchParams {
  status?: 'ACTIVE' | 'INACTIVE';
  payFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  payable?: boolean;
  team?: string;
  minRate?: number;
  maxRate?: number;
  start?: string;
  end?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// Pay Period Types
export interface PayPeriod {
  id?: number;
  uuid: string;
  label: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'DISBURSING';
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface CreatePayPeriodRequest {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  label: string;
}

export interface UpdatePayPeriodRequest {
  label?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate?: string;
  endDate?: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'DISBURSING' | 'COMPLETED';
}

export interface PayrollSearchParams {
  q?: string;
  status?: string;
  frequency?: string;
  startFrom?: string;
  startTo?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PayrollSearchResponse {
  content: PayPeriod[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AutoAssignResponse {
  status: string;
}

// Pay Item Types (workers assigned to a payroll period)
export interface PayItem {
  uuid: string;
  createdAt: string;
  periodUuid: string;
  periodLabel: string;
  workerUuid: string;
  workerName: string;
  workerPhone: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  state: string; // e.g. LOCKED
}

export interface PayItemSearchParams {
  periodUuid: string; // required
  page?: number;
  size?: number;
  sort?: string; // e.g. createdAt,DESC
}

export interface PayItemSearchResponse {
  content: PayItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
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

// Disbursement API Response Types
export interface CreateBatchResponse {
  batchUuid: string;
  createdAt: string;
  updatedAt: string;
  sourceType: 'PERIOD' | 'SINGLE';
  sourceRef: string;
  status: 'DRAFT' | 'SENT' | 'COMPLETED';
  payoutCount: number;
  amountTotal: number;
  payrollLabel?: string | null;
}

export interface SendBatchResponse {
  status: string;
}

// KPI Types
export interface WorkersKPI {
  totalWorkers: number;
  activeWorkers: number;
  inactiveWorkers: number;
  payableWorkers: number;
  kycGaps: number;
  phoneValidPct: number;
  byFrequencyOverall: {
    counts: {
      DAILY: number;
      WEEKLY: number;
      MONTHLY: number;
    };
    daily: number;
    weekly: number;
    monthly: number;
  };
  byFrequencyActive: {
    counts: {
      DAILY: number;
      WEEKLY: number;
      MONTHLY: number;
    };
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface PayoutsKPI {
  total: number;
  pending: number;
  sent: number;
  success: number;
  failed: number;
  totalAmount: number;
  successAmount: number;
}

export interface PayItemsKPI {
  total: number;
  ready: number;
  locked: number;
}

export interface PayPeriodsKPI {
  totalPeriods: number;
  draftPeriods: number;
  approvedPeriods: number;
  byFrequency: {
    counts: {
      WEEKLY: number;
      MONTHLY: number;
      DAILY: number;
    };
  };
  totalItems: number;
  itemsReady: number;
  itemsLocked: number;
  totalNetAmount: number;
}

export interface DashboardKPIs {
  workers: WorkersKPI;
  payouts: PayoutsKPI;
  payItems: PayItemsKPI;
  payPeriods: PayPeriodsKPI;
}