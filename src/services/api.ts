import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  LoginRequest,
  AuthData,
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  Worker,
  CreateWorkerRequest,
  PayPeriod,
  CreatePayPeriodRequest,
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
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
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
  },
};

export const payrollApi = {
  createPeriod: async (data: CreatePayPeriodRequest): Promise<ApiResponse<PayPeriod>> => {
    const response: AxiosResponse<ApiResponse<PayPeriod>> = await api.post('/api/payroll/periods', data);
    return response.data;
  },
  
  generatePayItems: async (periodUuid: string): Promise<ApiResponse<{ status: string }>> => {
    const response: AxiosResponse<ApiResponse<{ status: string }>> = await api.post(
      `/api/payroll/periods/${periodUuid}/items:auto`
    );
    return response.data;
  },
  
  approvePeriod: async (periodUuid: string): Promise<ApiResponse<{ status: string }>> => {
    const response: AxiosResponse<ApiResponse<{ status: string }>> = await api.post(
      `/api/payroll/periods/${periodUuid}/approve`
    );
    return response.data;
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