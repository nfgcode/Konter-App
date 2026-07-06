# Konter-TrackApp
> Sistem Pencatatan Penjualan Konter & Bagi Hasil Koperasi Transparan.

Aplikasi web berbasis client-side (SPA) modern yang dibangun menggunakan **HTML5, CSS3, JavaScript (ES6)**. Aplikasi ini dirancang agar dapat di-deploy 100% gratis pada serverless hosting dan mendukung sinkronisasi database cloud Supabase secara gratis.

---

## 🚀 Fitur Utama
*   **Dashboard Finansial:** Memantau Omset, Modal, Laba Reseller, Laba Koperasi, dan Kas Pembulatan lengkap dengan grafik tren harian (**Chart.js**).
*   **Form Transaksi Otomatis:** Memiliki fitur auto-fill berdasarkan list nama pelanggan serta kalkulasi pembulatan ke atas secara otomatis.
*   **Bagi Hasil Konfigurasif:** 
    *   **Pulsa:** Komisi tetap Koperasi (Rp 1.000) dan Reseller (Rp 1.000) + sisa pembulatan ke atas.
    *   **Topup & Tagihan:** Markup tetap Rp 3.000 penuh untuk reseller (koperasi Rp 0).
*   **Laporan Laba Terpisah:** Tabular khusus untuk Laporan Laba Saya (Reseller) dan Laporan Laba Koperasi yang dapat diekspor ke `.csv` atau dicetak ke fisik/PDF.
*   **Cloud Database Sync:** Terkoneksi ke **Supabase** secara gratis untuk sinkronisasi data real-time antar perangkat (HP & Laptop).

---

## 💻 Cara Menjalankan Secara Lokal (Offline)
Aplikasi ini sudah dilengkapi dengan script server dev bawaan menggunakan Python:

1.  Buka terminal/PowerShell di direktori proyek `D:/Konter-App`.
2.  Jalankan server pengembangan:
    ```bash
    python server.py
    ```
3.  Buka web browser Anda dan akses:
    👉 **[http://localhost:8000](http://localhost:8000)**
4.  Gunakan kredensial default untuk masuk:
    *   **Username:** `admin`
    *   **Password:** `koperasi123`

---

## ☁️ Cara Hubungkan ke Cloud Database (Supabase Free Tier)
Agar data konter tersinkronisasi otomatis di seluruh perangkat Anda (HP, Laptop, PC):

1.  Buat akun dan project baru di **[Supabase](https://supabase.com/)** secara gratis.
2.  Masuk ke menu **SQL Editor** Supabase, klik **New Query**, salin dan jalankan script SQL berikut:
    ```sql
    -- Tabel Pelanggan
    CREATE TABLE konter_customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Tabel Transaksi
    CREATE TABLE konter_transactions (
        id TEXT PRIMARY KEY,
        date TIMESTAMPTZ NOT NULL,
        customerName TEXT,
        targetNumber TEXT NOT NULL,
        productCode TEXT,
        productName TEXT NOT NULL,
        category TEXT NOT NULL,
        modalPrice NUMERIC NOT NULL,
        sellingPrice NUMERIC NOT NULL,
        resellerProfit NUMERIC NOT NULL,
        koperasiProfit NUMERIC NOT NULL,
        roundingProfit NUMERIC NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Nonaktifkan RLS untuk mode pengembangan mandiri
    ALTER TABLE konter_customers DISABLE ROW LEVEL SECURITY;
    ALTER TABLE konter_transactions DISABLE ROW LEVEL SECURITY;
    ```
3.  Masuk ke **Settings (ikon roda gigi) -> API** di Supabase. Salin **Project URL** dan **Anon API Key**.
4.  Buka aplikasi di web browser Anda -> Menu **Daftar Harga** -> Scroll ke bawah -> masukkan data URL dan Anon Key Anda di formulir **Sinkronisasi Cloud Database** -> Klik **Hubungkan & Sinkronkan**.

---

## 🌐 Cara Hosting Gratis di Internet

### Opsi A: Netlify Drop (Paling Cepat - 1 Menit)
1.  Buka situs **[Netlify Drop](https://app.netlify.com/drop)**.
2.  Seret (*drag*) folder proyek `Konter-App` Anda dan lepas (*drop*) ke kotak di halaman web tersebut.`
3.  Website Anda langsung online dengan domain acak gratis dari Netlify!

### Opsi B: Vercel (Koneksi Git - Pembaruan Otomatis)
1.  Upload file proyek Anda ke repository baru di **GitHub** (Private/Public).
2.  Login ke **[Vercel](https://vercel.com/)** menggunakan akun GitHub Anda.
3.  Klik **New Project**, pilih repository proyek Anda yang baru diunggah.
4.  Klik **Deploy**! Vercel akan membaca konfigurasi `vercel.json` dan menyajikan website Anda secara gratis selamanya.
