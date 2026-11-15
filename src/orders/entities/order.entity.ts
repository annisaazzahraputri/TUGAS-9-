export type ServiceType = 'Cuci Kering' | 'Cuci Setrika' | 'Setrika';
export type OrderStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Diambil';

// Model data pesanan Laundryrku yang disimpan sementara di array.
export class Order {
  id!: string;
  kodePesanan!: string;
  namaPelanggan!: string;
  nomorTelepon!: string;
  jenisLayanan!: ServiceType;
  beratKg!: number;
  status!: OrderStatus;
  tanggalMasuk!: string;
  tanggalSelesai?: string;
  catatan?: string;
  totalHarga!: number;
  createdAt!: string;
  updatedAt!: string;
}
