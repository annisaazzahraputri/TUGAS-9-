# Integrasi Frontend Laundryrku ke NestJS

Paket ini berisi helper API dan komponen React untuk menghubungkan halaman frontend dengan backend Laundryrku yang sudah kamu jalankan.

## Isi paket

- `src/lib/orders-api.ts`: fungsi komunikasi ke endpoint NestJS (`GET`, `POST`, `PATCH`, `DELETE`).
- `src/components/LaundryOrdersSection.tsx`: komponen daftar pesanan dan form tambah/edit.
- `src/components/LaundryOrdersSection.css`: tampilan responsif mandiri untuk komponen.
- `.env.local.example`: contoh alamat API lokal.

## Langkah pemasangan

1. Pastikan frontend memang menggunakan React + Vite. Buka folder frontend Laundryrku (bukan `laundryrku-nest-backend`).
2. Buat folder `src/lib` jika belum ada, lalu salin `orders-api.ts` ke dalamnya.
3. Buat folder `src/components` jika belum ada, lalu salin `LaundryOrdersSection.tsx` dan `LaundryOrdersSection.css` ke dalamnya.
4. Buat file `.env.local` pada folder utama frontend (sejajar dengan `package.json`) dengan isi:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

5. Di halaman React yang ingin menampilkan pengelolaan pesanan (contoh `src/App.tsx` atau halaman dashboard), tambahkan import:

   ```tsx
   import LaundryOrdersSection from './components/LaundryOrdersSection';
   ```

   Lalu letakkan komponen di dalam JSX halaman:

   ```tsx
   <LaundryOrdersSection />
   ```

   Sesuaikan path import jika halaman berada di dalam subfolder. Contoh: dari `src/pages/OrdersPage.tsx`, path-nya `../components/LaundryOrdersSection`.

6. Pastikan backend berjalan di terminal backend dengan `npm run start:dev` pada port 3001.
7. Buka terminal kedua di folder frontend, jalankan `npm install` bila dependency belum di-install, lalu `npm run dev`.
8. Buka alamat Vite yang ditampilkan terminal (biasanya `http://localhost:5173`). Jika `.env.local` baru dibuat atau diubah, restart server frontend agar variabel terbaca.

## Uji alur dari browser

1. Tambahkan pesanan baru melalui form. Pesanan harus muncul di tabel setelah berhasil disimpan.
2. Klik `Edit`, ubah detail, lalu `Simpan perubahan`.
3. Klik `Ubah status` untuk berpindah status.
4. Klik `Hapus` dan setujui konfirmasi; pesanan harus hilang dari tabel.

## Penting

- Komponen ini adalah bagian CRUD mandiri yang siap ditempel ke halaman React. Tanpa file frontend asli, paket ini belum bisa ditempelkan secara otomatis ke desain/routing Laundryrku yang sudah ada.
- Backend Bab 9 menyimpan data dalam array memori. Data akan hilang ketika proses backend dihentikan atau direstart.
- Pastikan CORS backend mengizinkan origin frontend. `main.ts` backend yang disiapkan sudah mengizinkan `http://localhost:5173` secara default.
- Cocokkan daftar harga di backend dengan harga yang dipakai pada desain/aplikasi Laundryrku sebelum demo final.
