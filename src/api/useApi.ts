import { useAuth, BASE_URL } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

export function useApi() {
  const { session, logout } = useAuth();

  async function request(path: string, options: RequestInit = {}) {
    const lang = await SecureStore.getItemAsync('lang') || 'fa';
    const headers: any = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (session) headers['Cookie'] = `session=${session}; lang=${lang}`;

    const res = await fetch(`${BASE_URL}/mobile${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      await logout();
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'خطای سرور' })) as any;
      throw new Error(err.error || 'خطای سرور');
    }
    return res.json();
  }

  return {
    get: (path: string) => request(path),
    post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: (path: string) => request(path, { method: 'DELETE' }),
    getDashboard: () => request('/dashboard'),
    getInventory: (page = 1) => request(`/inventory?page=${page}`),
    getAllocations: (page = 1, seller_id?: number) =>
      request(`/allocations?page=${page}${seller_id ? `&seller_id=${seller_id}` : ''}`),
    addAllocation: (data: any) => request('/allocations', { method: 'POST', body: JSON.stringify(data) }),
    getSales: (page = 1, seller_id?: number) =>
      request(`/sales?page=${page}${seller_id ? `&seller_id=${seller_id}` : ''}`),
    addSale: (data: any) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
    deleteSale: (id: number) => request(`/sales/${id}`, { method: 'DELETE' }),
    getPayments: (page = 1) => request(`/payments?page=${page}`),
    addPayment: (data: any) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    deletePayment: (id: number) => request(`/payments/${id}`, { method: 'DELETE' }),
    getReports: (from?: string, to?: string) =>
      request(`/reports${from ? `?from=${from}&to=${to}` : ''}`),
    getSellers: () => request('/sellers'),
    getPackages: () => request('/packages'),
    getMe: () => request('/me'),
  };
}
