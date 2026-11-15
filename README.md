# Laundryrku Frontend (React + Vite)

Frontend mandiri untuk menguji integrasi CRUD pesanan Laundryrku dengan backend NestJS.

## Kebutuhan
- Node.js 18 atau lebih baru
- Backend NestJS Laundryrku berjalan pada `http://localhost:3001`

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Konfigurasi API

File `.env.local` sudah diarahkan ke backend lokal:

```env
VITE_API_URL=http://localhost:3001
```

Jika alamat backend berubah, ubah nilai tersebut lalu restart Vite.

## Fitur
- Memuat daftar pesanan dari `GET /orders`.
- Menambah pesanan melalui `POST /orders`.
- Mengubah detail dan status melalui `PATCH /orders/:id`.
- Menghapus pesanan melalui `DELETE /orders/:id`.

## Catatan
Backend Bab 9 menggunakan array di memori. Data pesanan akan hilang ketika proses backend dihentikan atau di-restart. Ini sesuai instruksi tugas yang meminta penyimpanan sementara dalam array.
