// Contoh helper untuk frontend React/Vite. Salin ke src/lib/orders-api.ts
// di frontend, lalu sesuaikan tipe dan nama file dengan struktur aplikasimu.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export type OrderStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Diambil';
export type ServiceType = 'Cuci Kering' | 'Cuci Setrika' | 'Setrika';

export interface Order {
  id: string;
  kodePesanan: string;
  namaPelanggan: string;
  nomorTelepon: string;
  jenisLayanan: ServiceType;
  beratKg: number;
  status: OrderStatus;
  tanggalMasuk: string;
  tanggalSelesai?: string;
  catatan?: string;
  totalHarga: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderInput = Pick<
  Order,
  'namaPelanggan' | 'nomorTelepon' | 'jenisLayanan' | 'beratKg' | 'tanggalMasuk'
> & Partial<Pick<Order, 'status' | 'tanggalSelesai' | 'catatan'>>;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message ?? `Request gagal (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const ordersApi = {
  findAll: () => request<Order[]>('/orders'),
  findOne: (id: string) => request<Order>(`/orders/${id}`),
  create: (data: CreateOrderInput) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateOrderInput>) =>
    request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/orders/${id}`, { method: 'DELETE' }),
};
