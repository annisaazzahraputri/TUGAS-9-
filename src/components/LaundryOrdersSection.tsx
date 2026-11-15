import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ordersApi } from '../lib/orders-api';
import type { CreateOrderInput, Order, OrderStatus, ServiceType } from '../lib/orders-api';
import './LaundryOrdersSection.css';

type FormState = {
  namaPelanggan: string;
  nomorTelepon: string;
  jenisLayanan: ServiceType;
  beratKg: string;
  tanggalMasuk: string;
  catatan: string;
};

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyForm = (): FormState => ({
  namaPelanggan: '',
  nomorTelepon: '',
  jenisLayanan: 'Cuci Setrika',
  beratKg: '',
  tanggalMasuk: localDate(),
  catatan: '',
});

const nextStatus: Record<OrderStatus, OrderStatus> = {
  Menunggu: 'Diproses',
  Diproses: 'Selesai',
  Selesai: 'Diambil',
  Diambil: 'Menunggu',
};

const rupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function LaundryOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await ordersApi.findAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil daftar pesanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    const payload: CreateOrderInput = {
      namaPelanggan: form.namaPelanggan.trim(),
      nomorTelepon: form.nomorTelepon.trim(),
      jenisLayanan: form.jenisLayanan,
      beratKg: Number(form.beratKg),
      tanggalMasuk: form.tanggalMasuk,
      catatan: form.catatan.trim() || undefined,
    };

    if (!Number.isFinite(payload.beratKg) || payload.beratKg <= 0) {
      setError('Berat cucian harus lebih dari 0 kg.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await ordersApi.update(editingId, payload);
        setNotice('Pesanan berhasil diperbarui.');
      } else {
        await ordersApi.create(payload);
        setNotice('Pesanan berhasil ditambahkan.');
      }
      resetForm();
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pesanan.');
    } finally {
      setSaving(false);
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
    setNotice(`Mengedit pesanan ${order.kodePesanan}.`);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function changeStatus(order: Order) {
    setError('');
    setNotice('');
    try {
      const statusBaru = nextStatus[order.status];
      await ordersApi.update(order.id, { status: statusBaru });
      setNotice(`Status ${order.kodePesanan} diubah menjadi ${statusBaru}.`);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status pesanan.');
    }
  }

  async function deleteOrder(order: Order) {
    const confirmed = window.confirm(`Hapus pesanan ${order.kodePesanan} milik ${order.namaPelanggan}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    try {
      await ordersApi.remove(order.id);
      if (editingId === order.id) resetForm();
      setNotice(`Pesanan ${order.kodePesanan} berhasil dihapus.`);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus pesanan.');
    }
  }

  return (
    <section className="laundry-orders" aria-labelledby="laundry-orders-title">
      <header className="laundry-orders__header">
        <div>
          <p className="laundry-orders__eyebrow">MANAJEMEN LAUNDRY</p>
          <h1 id="laundry-orders-title">Pesanan Laundry</h1>
          <p className="laundry-orders__intro">Kelola pesanan pelanggan dari satu tempat.</p>
        </div>
        <button className="laundry-orders__secondary" type="button" onClick={() => void loadOrders()} disabled={loading}>
          {loading ? 'Memuat…' : 'Muat ulang'}
        </button>
      </header>

      {error && <div className="laundry-orders__alert laundry-orders__alert--error" role="alert">{error}</div>}
      {notice && <div className="laundry-orders__alert laundry-orders__alert--success" role="status">{notice}</div>}

      <div className="laundry-orders__layout">
        <form className="laundry-orders__form" onSubmit={handleSubmit}>
          <div className="laundry-orders__section-heading">
            <div>
              <p className="laundry-orders__eyebrow">FORM PESANAN</p>
              <h2>{editingId ? 'Ubah pesanan' : 'Tambah pesanan'}</h2>
            </div>
            {editingId && <span className="laundry-orders__editing">Mode edit</span>}
          </div>

          <label className="laundry-orders__field">
            <span>Nama pelanggan</span>
            <input value={form.namaPelanggan} onChange={(e) => updateForm('namaPelanggan', e.target.value)} required minLength={3} maxLength={80} placeholder="Nama pelanggan" />
          </label>

          <label className="laundry-orders__field">
            <span>Nomor telepon</span>
            <input value={form.nomorTelepon} onChange={(e) => updateForm('nomorTelepon', e.target.value)} required placeholder="081234567890" inputMode="tel" />
          </label>

          <div className="laundry-orders__form-row">
            <label className="laundry-orders__field">
              <span>Jenis layanan</span>
              <select value={form.jenisLayanan} onChange={(e) => updateForm('jenisLayanan', e.target.value as ServiceType)}>
                <option value="Cuci Kering">Cuci Kering</option>
                <option value="Cuci Setrika">Cuci Setrika</option>
                <option value="Setrika">Setrika</option>
              </select>
            </label>
            <label className="laundry-orders__field">
              <span>Berat (kg)</span>
              <input type="number" min="0.1" max="100" step="0.1" value={form.beratKg} onChange={(e) => updateForm('beratKg', e.target.value)} required placeholder="2.5" />
            </label>
          </div>

          <label className="laundry-orders__field">
            <span>Tanggal masuk</span>
            <input type="date" value={form.tanggalMasuk} onChange={(e) => updateForm('tanggalMasuk', e.target.value)} required />
          </label>

          <label className="laundry-orders__field">
            <span>Catatan <small>(opsional)</small></span>
            <textarea rows={3} maxLength={250} value={form.catatan} onChange={(e) => updateForm('catatan', e.target.value)} placeholder="Catatan khusus untuk cucian…" />
          </label>

          <div className="laundry-orders__form-actions">
            <button className="laundry-orders__primary" type="submit" disabled={saving}>
              {saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Tambah pesanan'}
            </button>
            {editingId && <button className="laundry-orders__secondary" type="button" onClick={resetForm}>Batal</button>}
          </div>
        </form>

        <div className="laundry-orders__list-card">
          <div className="laundry-orders__section-heading">
            <div>
              <p className="laundry-orders__eyebrow">DATA MASUK</p>
              <h2>Daftar pesanan</h2>
            </div>
            <span className="laundry-orders__count">{orders.length} pesanan</span>
          </div>

          {loading ? (
            <div className="laundry-orders__empty">Memuat daftar pesanan…</div>
          ) : orders.length === 0 ? (
            <div className="laundry-orders__empty">
              <strong>Belum ada pesanan</strong>
              <span>Pesanan baru akan muncul di sini setelah ditambahkan.</span>
            </div>
          ) : (
            <div className="laundry-orders__table-wrap">
              <table className="laundry-orders__table">
                <thead>
                  <tr>
                    <th>Kode / Pelanggan</th>
                    <th>Layanan</th>
                    <th>Berat</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.kodePesanan}</strong>
                        <span className="laundry-orders__subtext">{order.namaPelanggan}</span>
                        <span className="laundry-orders__subtext">{order.nomorTelepon}</span>
                      </td>
                      <td>{order.jenisLayanan}</td>
                      <td>{order.beratKg} kg</td>
                      <td><span className={`laundry-orders__status laundry-orders__status--${order.status.toLowerCase()}`}>{order.status}</span></td>
                      <td>{rupiah(order.totalHarga)}</td>
                      <td>
                        <div className="laundry-orders__actions">
                          <button type="button" onClick={() => startEdit(order)}>Edit</button>
                          <button type="button" onClick={() => void changeStatus(order)}>Ubah status</button>
                          <button className="laundry-orders__delete" type="button" onClick={() => void deleteOrder(order)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <p className="laundry-orders__footnote">Data disimpan sementara di memori backend. Data akan kembali kosong saat backend direstart, sesuai ketentuan tugas Bab 9.</p>
    </section>
  );
}
