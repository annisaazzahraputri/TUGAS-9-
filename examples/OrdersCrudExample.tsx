import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  CreateOrderInput,
  Order,
  OrderStatus,
  ServiceType,
  ordersApi,
} from './orders-api';

type FormState = {
  namaPelanggan: string;
  nomorTelepon: string;
  jenisLayanan: ServiceType;
  beratKg: string;
  tanggalMasuk: string;
  catatan: string;
};

const emptyForm = (): FormState => ({
  namaPelanggan: '',
  nomorTelepon: '',
  jenisLayanan: 'Cuci Setrika',
  beratKg: '',
  tanggalMasuk: new Date().toISOString().slice(0, 10),
  catatan: '',
});

const nextStatus: Record<OrderStatus, OrderStatus> = {
  Menunggu: 'Diproses',
  Diproses: 'Selesai',
  Selesai: 'Diambil',
  Diambil: 'Menunggu',
};

// Contoh halaman React sederhana untuk membuktikan alur tambah, ubah, hapus.
// Integrasikan komponen ini ke routing frontend, atau pindahkan pemanggilan
// ordersApi ke halaman Laundryrku yang sudah ada.
export default function OrdersCrudExample() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setOrders(await ordersApi.findAll());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const payload: CreateOrderInput = {
      namaPelanggan: form.namaPelanggan.trim(),
      nomorTelepon: form.nomorTelepon.trim(),
      jenisLayanan: form.jenisLayanan,
      beratKg: Number(form.beratKg),
      tanggalMasuk: form.tanggalMasuk,
      catatan: form.catatan.trim() || undefined,
    };

    try {
      if (editingId) {
        await ordersApi.update(editingId, payload);
        setMessage('Pesanan berhasil diperbarui.');
      } else {
        await ordersApi.create(payload);
        setMessage('Pesanan berhasil ditambahkan.');
      }
      setForm(emptyForm());
      setEditingId(null);
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan pesanan.');
    }
  }

  function startEdit(order: Order) {
    setEditingId(order.id);
    setForm({
      namaPelanggan: order.namaPelanggan,
      nomorTelepon: order.nomorTelepon,
      jenisLayanan: order.jenisLayanan,
      beratKg: String(order.beratKg),
      tanggalMasuk: order.tanggalMasuk.slice(0, 10),
      catatan: order.catatan ?? '',
    });
  }

  async function changeStatus(order: Order) {
    try {
      await ordersApi.update(order.id, { status: nextStatus[order.status] });
      setMessage(`Status ${order.kodePesanan} berhasil diubah.`);
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal mengubah status.');
    }
  }

  async function deleteOrder(id: string) {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await ordersApi.remove(id);
      setMessage('Pesanan berhasil dihapus.');
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus pesanan.');
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: '32px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Laundryrku · Kelola Pesanan</h1>
      <p>Tambah, ubah status, edit, dan hapus pesanan laundry.</p>

      {message && <p role="status">{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, maxWidth: 520, marginBottom: 28 }}>
        <h2>{editingId ? 'Edit Pesanan' : 'Tambah Pesanan'}</h2>
        <label>
          Nama pelanggan
          <input required minLength={3} value={form.namaPelanggan} onChange={(e) => setForm({ ...form, namaPelanggan: e.target.value })} />
        </label>
        <label>
          Nomor telepon
          <input required value={form.nomorTelepon} onChange={(e) => setForm({ ...form, nomorTelepon: e.target.value })} placeholder="081234567890" />
        </label>
        <label>
          Jenis layanan
          <select value={form.jenisLayanan} onChange={(e) => setForm({ ...form, jenisLayanan: e.target.value as ServiceType })}>
            <option value="Cuci Kering">Cuci Kering</option>
            <option value="Cuci Setrika">Cuci Setrika</option>
            <option value="Setrika">Setrika</option>
          </select>
        </label>
        <label>
          Berat (kg)
          <input required type="number" min="0.1" max="100" step="0.1" value={form.beratKg} onChange={(e) => setForm({ ...form, beratKg: e.target.value })} />
        </label>
        <label>
          Tanggal masuk
          <input required type="date" value={form.tanggalMasuk} onChange={(e) => setForm({ ...form, tanggalMasuk: e.target.value })} />
        </label>
        <label>
          Catatan (opsional)
          <input maxLength={250} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Simpan Perubahan' : 'Tambah Pesanan'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm()); }}>Batal Edit</button>}
        </div>
      </form>

      <section>
        <h2>Daftar Pesanan</h2>
        <button type="button" onClick={() => void loadOrders()} disabled={loading}>Muat Ulang</button>
        {loading ? <p>Memuat...</p> : orders.length === 0 ? <p>Belum ada pesanan.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  <th align="left">Kode</th><th align="left">Pelanggan</th><th align="left">Layanan</th>
                  <th align="left">Berat</th><th align="left">Status</th><th align="left">Total</th><th align="left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.kodePesanan}</td>
                    <td>{order.namaPelanggan}<br />{order.nomorTelepon}</td>
                    <td>{order.jenisLayanan}</td>
                    <td>{order.beratKg} kg</td>
                    <td>{order.status}</td>
                    <td>Rp{order.totalHarga.toLocaleString('id-ID')}</td>
                    <td>
                      <button type="button" onClick={() => startEdit(order)}>Edit</button>{' '}
                      <button type="button" onClick={() => void changeStatus(order)}>Status Berikutnya</button>{' '}
                      <button type="button" onClick={() => void deleteOrder(order.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
