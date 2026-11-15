# Laundryrku - Backend NestJS (Tugas Bab 9)

Backend dasar Laundryrku untuk mengelola **Pesanan Laundry** menggunakan NestJS dengan pola Controller-Service-Entity. Data disimpan sementara dalam array di memori, sesuai instruksi Tugas Perkuliahan Bab 9.

## Fitur

- CRUD pesanan: create, findAll, findOne, update, remove.
- DTO create dan update dengan `class-validator`.
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Dependency Injection untuk `OrdersService`.
- Error `NotFoundException` (404) dan `ConflictException` (409).
- CORS untuk frontend lokal Vite di `http://localhost:5173`.
- Helper API contoh untuk integrasi frontend React/Vite.

## Struktur

```text
src/
├── main.ts
├── app.module.ts
└── orders/
    ├── dto/
    │   ├── create-order.dto.ts
    │   └── update-order.dto.ts
    ├── entities/
    │   └── order.entity.ts
    ├── orders.controller.ts
    ├── orders.service.ts
    └── orders.module.ts
examples/
├── orders.http
├── orders-api.ts
└── OrdersCrudExample.tsx
```

## Menjalankan backend

Pastikan Node.js dan npm sudah terpasang.

```bash
npm install
npm run start:dev
```

Server berjalan di `http://localhost:3001`.

Opsional: salin `.env.example` menjadi `.env`, lalu sesuaikan `PORT` atau `CORS_ORIGIN`.

## Data pesanan

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | UUID yang dibuat backend |
| `kodePesanan` | string | Kode otomatis, misalnya LDY-0001 |
| `namaPelanggan` | string | Nama pelanggan |
| `nomorTelepon` | string | Nomor HP Indonesia |
| `jenisLayanan` | string | Cuci Kering / Cuci Setrika / Setrika |
| `beratKg` | number | Berat cucian dalam kilogram |
| `status` | string | Menunggu / Diproses / Selesai / Diambil |
| `tanggalMasuk` | string | Tanggal pesanan masuk |
| `tanggalSelesai` | string | Opsional |
| `catatan` | string | Opsional, maksimal 250 karakter |
| `totalHarga` | number | Dihitung backend berdasarkan layanan dan berat |

Harga contoh yang digunakan: Cuci Kering Rp7.000/kg, Cuci Setrika Rp10.000/kg, dan Setrika Rp5.000/kg. Ubah tabel harga di `src/orders/orders.service.ts` agar sama dengan ketentuan harga aplikasi Laundryrku.

## Endpoint

| Method | URL | Fungsi |
|---|---|---|
| POST | `/orders` | Tambah pesanan |
| GET | `/orders` | Ambil seluruh pesanan |
| GET | `/orders/:id` | Ambil satu pesanan |
| PATCH | `/orders/:id` | Ubah pesanan |
| DELETE | `/orders/:id` | Hapus pesanan |

## Pengujian REST Client

1. Install ekstensi **REST Client** di Visual Studio Code.
2. Buka `examples/orders.http`.
3. Jalankan request CREATE terlebih dahulu.
4. Salin nilai `id` dari response CREATE ke variabel `@orderId`.
5. Jalankan GET ALL, GET ONE, UPDATE, dan DELETE.
6. Jalankan request ERROR untuk memperoleh bukti 404, 409, dan 400.
7. Ambil screenshot request serta response setiap method untuk dimasukkan ke `docs/screenshots` atau README tugas.

## Integrasi frontend React/Vite

Salin `examples/orders-api.ts` ke frontend menjadi `src/lib/orders-api.ts`. Salin `examples/OrdersCrudExample.tsx` ke folder halaman/components frontend, lalu sesuaikan import helper API. Komponen contoh itu menunjukkan alur tambah, edit data, ubah status, dan hapus. Helper menyediakan `ordersApi.findAll()`, `create()`, `update()`, `remove()`, dan `findOne()`.

Untuk memuat daftar pesanan saat halaman dibuka, panggil `ordersApi.findAll()` dari `useEffect`. Untuk form tambah, panggil `ordersApi.create(data)`. Untuk tombol edit/status, panggil `ordersApi.update(id, data)`. Untuk tombol hapus, panggil `ordersApi.remove(id)`, kemudian muat ulang daftar.

Jika frontend tidak berjalan di `http://localhost:5173`, ubah `CORS_ORIGIN` pada `.env` sesuai alamat frontend.

## Catatan

- Array memori akan kosong kembali ketika server dimatikan atau di-restart. Ini memang sesuai batasan tugas Bab 9 yang meminta penyimpanan sementara dalam array, bukan database.
- Endpoint DELETE mengembalikan `204 No Content`.
- Deteksi duplikat mencegah pesanan dengan nomor telepon, tanggal masuk, jenis layanan, dan berat yang sama tercatat dua kali.
- Nilai harga adalah contoh dan perlu disesuaikan dengan rancangan Laundryrku yang sebenarnya.
