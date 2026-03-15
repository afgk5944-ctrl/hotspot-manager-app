import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://hotspot-manager.pages.dev';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach session cookie to every request
api.interceptors.request.use(async (config) => {
  const session = await SecureStore.getItemAsync('session');
  const lang = await SecureStore.getItemAsync('lang') || 'fa';
  if (session) {
    config.headers['Cookie'] = `session=${session}; lang=${lang}`;
  }
  return config;
});

// ── Auth ────────────────────────────────────────
export async function apiLogin(username: string, password: string) {
  const params = new URLSearchParams({ username, password });
  const res = await axios.post(`${BASE_URL}/login`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (s) => s < 400 || s === 302,
  });
  // Extract session cookie from response headers
  const setCookie = res.headers['set-cookie'];
  if (setCookie) {
    const match = Array.isArray(setCookie)
      ? setCookie.join(';')
      : setCookie;
    const sessionMatch = match.match(/session=([^;]+)/);
    if (sessionMatch) {
      await SecureStore.setItemAsync('session', sessionMatch[1]);
      return { success: true };
    }
  }
  // If redirect to dashboard → success
  if (res.status === 302 && res.headers['location']?.includes('dashboard')) {
    return { success: true };
  }
  return { success: false, error: 'نام کاربری یا رمز اشتباه است' };
}

export async function apiLogout() {
  await SecureStore.deleteItemAsync('session');
  try { await api.get('/logout'); } catch {}
}

// ── Dashboard ───────────────────────────────────
export async function apiGetDashboard() {
  const res = await api.get('/api/dashboard/summary');
  return res.data;
}

// ── Inventory ───────────────────────────────────
export async function apiGetInventory(params?: any) {
  const res = await api.get('/api/inventory', { params });
  return res.data;
}
export async function apiAddInventory(data: any) {
  const res = await api.post('/api/inventory', data);
  return res.data;
}
export async function apiDeleteInventory(id: number) {
  const res = await api.delete(`/api/inventory/${id}`);
  return res.data;
}

// ── Allocations ─────────────────────────────────
export async function apiGetAllocations(params?: any) {
  const res = await api.get('/api/allocations', { params });
  return res.data;
}
export async function apiAddAllocation(data: any) {
  const res = await api.post('/api/allocations', data);
  return res.data;
}

// ── Sales ───────────────────────────────────────
export async function apiGetSales(params?: any) {
  const res = await api.get('/api/sales', { params });
  return res.data;
}
export async function apiAddSale(data: any) {
  const res = await api.post('/api/sales', data);
  return res.data;
}

// ── Payments ────────────────────────────────────
export async function apiGetPayments(params?: any) {
  const res = await api.get('/api/payments', { params });
  return res.data;
}
export async function apiAddPayment(data: any) {
  const res = await api.post('/api/payments', data);
  return res.data;
}

// ── Reports ─────────────────────────────────────
export async function apiGetReports(params?: any) {
  const res = await api.get('/api/reports/summary', { params });
  return res.data;
}

// ── Admin ────────────────────────────────────────
export async function apiGetSellers() {
  const res = await api.get('/api/sellers');
  return res.data;
}
export async function apiGetPackages() {
  const res = await api.get('/api/packages');
  return res.data;
}
export async function apiGetBranches() {
  const res = await api.get('/api/branches');
  return res.data;
}

export default api;
