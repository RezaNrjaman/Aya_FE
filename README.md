# Araya Business Hub Platform — Frontend (FE)

Aplikasi Frontend berbasis **React 19 + TypeScript + Vite + Tailwind CSS v4** dengan tema **Dark Glassmorphism** untuk Araya Business Hub Platform.

## 1. Fitur & Struktur

- **Desain UI**: Dark Glassmorphism, font Plus Jakarta Sans (heading) & Source Sans 3 (body), warna Brand Blue, Neutral Slate.
- **Routing & Session**: React Router v7, session-based JWT storage, route guard publik & privat, dynamic navigation berbasis permission.
- **Shared UI**: Button, Input, Select, Textarea, StatusBadge, DataTable, Pagination, ConfirmDialog, LoadingScreen, Toast.
- **API Client**: Axios instance dengan Authorization Bearer interceptor, standard envelope parser, dan HTTP error mapper.

## 2. Cara Menjalankan

### Prasyarat
- Node.js >= 20
- npm >= 10

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Development Server
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:5173`.

### Type Checking & Production Build
```bash
npm run build
```
Output build tersimpan di folder `dist/`.

### Preview Production Build
```bash
npm run preview
```

## 3. Konfigurasi Environment (`.env`)

Salin `.env.example` ke `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Araya Business Hub
```
Pastikan backend Go Gin telah aktif di port 8080 sebelum melakukan login.
