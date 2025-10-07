import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { SessionManager } from '../utils/sessionManager';
import type {
  ApiResponse,
  LoginRequest,
  AuthData,
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  Worker,
  CreateWorkerRequest,
  WorkerSearchParams,
  PaginatedResponse,
  PayPeriod,
  CreatePayPeriodRequest,
  UpdatePayPeriodRequest,
  PayrollSearchParams,
  PayrollSearchResponse,
  AutoAssignResponse,
  DisbursementBatch,
  Payout,
  CreateSinglePayoutRequest,
} from '../types';

const BASE_URL = 'https://fund-disbursement-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = SessionManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh and session expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      // Handle session expiry using SessionManager
      SessionManager.handleSessionExpiry();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthData>> => {
    const response: AxiosResponse<ApiResponse<AuthData>> = await api.post(
      '/api/v1/auth/fund-disbursement/authenticate',
      credentials
    );
    return response.data;
  },
};

export const positionsApi = {
  create: async (data: CreatePositionRequest): Promise<ApiResponse<Position>> => {
    const response: AxiosResponse<ApiResponse<Position>> = await api.post('/api/v1/admin/positions', data);
    return response.data;
  },
  
  list: async (activeOnly?: boolean): Promise<ApiResponse<Position[]>> => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    const response: AxiosResponse<ApiResponse<Position[]>> = await api.get('/api/v1/admin/positions', { params });
    return response.data;
  },
  
  get: async (uuid: string): Promise<ApiResponse<Position>> => {
    const response: AxiosResponse<ApiResponse<Position>> = await api.get(`/api/v1/admin/positions/${uuid}`);
    return response.data;
  },
  
  update: async (uuid: string, data: UpdatePositionRequest): Promise<ApiResponse<Position>> => {
    const response: AxiosResponse<ApiResponse<Position>> = await api.patch(`/api/v1/admin/positions/${uuid}`, data);
    return response.data;
  },
  
  delete: async (uuid: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/api/v1/admin/positions/${uuid}`);
    return response.data;
  },
};

export const workersApi = {
  create: async (data: CreateWorkerRequest): Promise<ApiResponse<Worker>> => {
    const response: AxiosResponse<ApiResponse<Worker>> = await api.post('/api/v1/admin/workers', data);
    return response.data;
  },
  
  list: async (): Promise<ApiResponse<Worker[]>> => {
    const response: AxiosResponse<ApiResponse<Worker[]>> = await api.get('/api/v1/admin/workers');
    return response.data;
  },
  
  search: async (params: WorkerSearchParams = {}): Promise<ApiResponse<PaginatedResponse<Worker>>> => {
    const searchParams = new URLSearchParams();
    
    if (params.status) searchParams.append('status', params.status);
    if (params.payFrequency) searchParams.append('payFrequency', params.payFrequency);
    if (params.payable !== undefined) searchParams.append('payable', params.payable.toString());
    if (params.team) searchParams.append('team', params.team);
    if (params.minRate !== undefined) searchParams.append('minRate', params.minRate.toString());
    if (params.maxRate !== undefined) searchParams.append('maxRate', params.maxRate.toString());
    if (params.start) searchParams.append('start', params.start);
    if (params.end) searchParams.append('end', params.end);
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach((sortParam: string) => searchParams.append('sort', sortParam));
    }
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Worker>>> = await api.get(
      `/api/v1/admin/workers/search?${searchParams.toString()}`
    );
    return response.data;
  },
  
  get: async (uuid: string): Promise<ApiResponse<Worker>> => {
    const response: AxiosResponse<ApiResponse<Worker>> = await api.get(`/api/v1/admin/workers/${uuid}`);
    return response.data;
  },
  
  update: async (uuid: string, data: Partial<CreateWorkerRequest>): Promise<ApiResponse<Worker>> => {
    const response: AxiosResponse<ApiResponse<Worker>> = await api.patch(`/api/v1/admin/workers/${uuid}`, data);
    return response.data;
  },
  
  delete: async (uuid: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/api/v1/admin/workers/${uuid}`);
    return response.data;
  },
  
  togglePayable: async (uuid: string, payable: boolean): Promise<ApiResponse<Worker>> => {
    const response: AxiosResponse<ApiResponse<Worker>> = await api.patch(
      `/api/v1/admin/workers/${uuid}/payable?payable=${payable}`
    );
    return response.data;
  }
};

export const payrollApi = {
  // Search payroll periods with pagination
  search: async (params: PayrollSearchParams): Promise<ApiResponse<PayrollSearchResponse>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    const response: AxiosResponse<ApiResponse<PayrollSearchResponse>> = await api.get(`/api/v1/payroll/search?${queryParams}`);
    return response.data;
  },

  // Create a new payroll period
  createPeriod: async (data: CreatePayPeriodRequest): Promise<ApiResponse<PayPeriod>> => {
    const response: AxiosResponse<ApiResponse<PayPeriod>> = await api.post('/api/v1/payroll/periods', data);
    return response.data;
  },

  // Get a single payroll period by UUID
  getPeriod: async (uuid: string): Promise<ApiResponse<PayPeriod>> => {
    const response: AxiosResponse<ApiResponse<PayPeriod>> = await api.get(`/api/v1/payroll/${uuid}`);
    return response.data;
  },

  // Update a payroll period
  updatePeriod: async (uuid: string, data: UpdatePayPeriodRequest): Promise<ApiResponse<PayPeriod>> => {
    const response: AxiosResponse<ApiResponse<PayPeriod>> = await api.put(`/api/v1/payroll/update/${uuid}`, data);
    return response.data;
  },
  
  // Auto-assign workers to payroll period (only for DRAFT status)
  autoAssignWorkers: async (periodUuid: string): Promise<ApiResponse<AutoAssignResponse>> => {
    const response: AxiosResponse<ApiResponse<AutoAssignResponse>> = await api.post(
      `/api/v1/payroll/periods/${periodUuid}/items:auto`
    );
    return response.data;
  },
  
  // Approve payroll period (only for PENDING status)
  approvePeriod: async (periodUuid: string): Promise<ApiResponse<{ additionalProp1: string; additionalProp2: string; additionalProp3: string }>> => {
    const response: AxiosResponse<ApiResponse<{ additionalProp1: string; additionalProp2: string; additionalProp3: string }>> = await api.post(
      `/api/v1/payroll/periods/${periodUuid}/approve`
    );
    return response.data;
  },

  // Download payroll periods as CSV
  downloadCSV: async (): Promise<Blob> => {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`CSV download attempt ${attempt}/${maxRetries}`);
        
        // Create a new axios instance specifically for file downloads
        const downloadApi = axios.create({
          baseURL: BASE_URL,
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${SessionManager.getAccessToken()}`,
          },
          responseType: 'blob',
          timeout: 30000, // 30 second timeout
          validateStatus: (status) => status === 200, // Only accept 200 responses
        });

        const response = await downloadApi.get('/v1/payroll/periods:csv');
        
        // Verify the response is actually a blob and not empty
        if (response.data instanceof Blob && response.data.size > 0) {
          console.log('CSV download successful on attempt', attempt);
          return response.data;
        }
        
        throw new Error('Empty or invalid CSV data received');
      } catch (error: any) {
        console.error(`CSV download attempt ${attempt} failed:`, error);
        lastError = error;
        
        // If it's a 500 error and we have more attempts, wait a bit and retry
        if (error.response?.status === 500 && attempt < maxRetries) {
          console.log(`500 error on attempt ${attempt}, retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // If it's not a 500 error or we're on the last attempt, throw immediately
        if (error.response?.status !== 500 || attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  },
};

export const disbursementsApi = {
  createBatchFromPeriod: async (periodUuid: string): Promise<ApiResponse<{ batchUuid: string }>> => {
    const response: AxiosResponse<ApiResponse<{ batchUuid: string }>> = await api.post(
      `/api/disbursements/from-period/${periodUuid}`
    );
    return response.data;
  },
  
  createSinglePayout: async (data: CreateSinglePayoutRequest): Promise<ApiResponse<{ batchUuid: string }>> => {
    const response: AxiosResponse<ApiResponse<{ batchUuid: string }>> = await api.post('/api/disbursements/single', data);
    return response.data;
  },
  
  sendBatch: async (batchUuid: string): Promise<ApiResponse<{ status: string }>> => {
    const response: AxiosResponse<ApiResponse<{ status: string }>> = await api.post(`/api/disbursements/send/${batchUuid}`);
    return response.data;
  },
  
  getBatch: async (batchUuid: string): Promise<ApiResponse<DisbursementBatch>> => {
    const response: AxiosResponse<ApiResponse<DisbursementBatch>> = await api.get(`/api/disbursements/${batchUuid}`);
    return response.data;
  },
  
  getBatchPayouts: async (batchUuid: string): Promise<ApiResponse<Payout[]>> => {
    const response: AxiosResponse<ApiResponse<Payout[]>> = await api.get(`/api/disbursements/${batchUuid}/payouts`);
    return response.data;
  },
  
  getPayout: async (payoutUuid: string): Promise<ApiResponse<Payout>> => {
    const response: AxiosResponse<ApiResponse<Payout>> = await api.get(`/api/disbursements/payouts/${payoutUuid}`);
    return response.data;
  },
};

export default api;