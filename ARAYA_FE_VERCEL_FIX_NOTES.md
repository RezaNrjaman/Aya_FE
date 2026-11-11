# ARAYA FE — Vercel TypeScript Build Fix

## Perubahan
- `src/pages/cart/CartPage.tsx`: total keranjang dan jumlah item sekarang dibaca dengan null-safe fallback. Render tidak lagi mengakses `cart.total_amount` atau `cart.total_items` secara langsung.
- `src/pages/quotations/QuotationFormModal.tsx`: selector unit usaha menggunakan `BusinessUnit.name`; properti `partner_name` tidak digunakan.

## Verifikasi lokal
- TypeScript check dijalankan terpisah dengan compiler yang tersedia di lingkungan pemeriksaan.
- Vite production build belum dapat dipastikan dari arsip ini karena `node_modules` yang disertakan pengguna berisi native binding Windows, sedangkan lingkungan pemeriksaan Linux membutuhkan binding Linux. Vercel akan memasang dependency sesuai platform dari `package-lock.json`.

## Deployment
- Jangan mengunggah `.env`, `.git`, `node_modules`, atau `dist`.
- Salin isi folder `FE` ke root repository `Aya_FE`, commit, lalu push ke branch `main`.
- Pastikan Deployment Vercel berikutnya menggunakan commit terbaru, bukan SHA lama `31b023f`.
