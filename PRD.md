# Product Requirement Document (PRD)
## Proyek: Konter-TrackApp (Sistem Pencatatan Transaksi & Bagi Hasil Koperasi)
**Versi:** 1.0  
**Tanggal:** 07 Juli 2026  
**Status:** Final & Diimplementasikan  

---

## 1. Latar Belakang & Tujuan
Sistem ini dirancang untuk mencatat transaksi penjualan pulsa, paket data, voucher, topup e-wallet/game, dan pembayaran tagihan secara digital dan transparan di lingkungan koperasi. Tujuan utamanya adalah:
*   Mengotomatiskan perhitungan bagi hasil bagi Reseller (Anda) dan Koperasi.
*   Menghilangkan kesalahan pencatatan manual.
*   Menyediakan laporan keuntungan terpisah secara real-time yang dapat dicetak atau diekspor ke format spreadsheet (CSV).
*   Menyediakan sinkronisasi cloud multi-perangkat yang gratis biaya hosting.

---

## 2. Struktur Proyek
Proyek dirancang statis di sisi klien (*Single Page Application*) dengan struktur file yang rapi sebagai berikut:

```
Konter-App/
├── css/
│   └── style.css              # File styling premium (dark/light theme, layout)
├── js/
│   ├── app.js                 # File logika aplikasi, kalkulasi profit, & sinkronisasi
│   └── catalog.js             # Katalog produk default & harga modal distributor
├── index.html                 # Entry point aplikasi (tampilan dashboard, form, laporan)
├── vercel.json                # Konfigurasi SPA router untuk hosting Vercel
├── netlify.toml               # Konfigurasi SPA router untuk hosting Netlify
├── server.py                  # Script Python server lokal untuk pengembangan
├── PRD.md                     # Dokumen Spesifikasi Kebutuhan Produk (File ini)
├── README.md                  # Panduan instalasi, penggunaan, dan hosting gratis
├── LAPORAN_PENGHASILAN_RESELLER.md # Dokumen format laporan laba reseller
└── LAPORAN_PENGHASILAN_KOPERASI.md # Dokumen format laporan laba koperasi
```

---

## 3. Fitur Utama & Aliran Pengguna

### F1. Dashboard Finansial Utama
*   Widget Ringkasan Statistik:
    *   **Total Omset:** Akumulasi total harga jual akhir dari seluruh transaksi.
    *   **Total Modal:** Akumulasi total harga modal distributor dari seluruh transaksi.
    *   **Laba Bersih Saya (Reseller):** Akumulasi komisi dasar reseller + akumulasi bonus pembulatan.
    *   **Laba Bersih Koperasi:** Akumulasi komisi bagi hasil koperasi (Rp 1.000/transaksi pulsa).
    *   **Bonus Pembulatan:** Akumulasi surplus hasil pembulatan ke atas.
*   Grafik Tren Penjualan: Grafik perolehan harian Reseller vs Koperasi menggunakan **Chart.js**.
*   Log Transaksi Terkini: Menampilkan 5 transaksi terakhir untuk pemantauan cepat.

### F2. Formulir Transaksi Penjualan
*   **List Nama Pelanggan (Auto-fill):** Fitur rekomendasi nama pelanggan tetap. Ketika dipilih, nama dan nomor tujuan/ID Pelanggan otomatis terisi ke formulir.
*   **Pilihan Produk:** Dropdown yang menampilkan katalog produk terdaftar sesuai kategori (Pulsa, Topup, Tagihan).
*   **Metode Penentuan Harga Jual:**
    *   **Otomatis:** Harga jual dihitung menggunakan rumus profit markup (Pulsa dibulatkan ke atas, Topup/Tagihan ditambah markup tetap).
    *   **Manual:** Input field khusus bagi reseller untuk mengetikkan harga jual khusus secara manual. Kalkulator akan memecah profit bagi hasil secara langsung.

### F3. Manajemen Pelanggan (Daftar Nama)
*   Menyimpan data pelanggan (Nama, Nomor HP/ID, Catatan).
*   Menghitung otomatis histori jumlah transaksi dan total volume belanja per pelanggan.

### F4. Katalog Harga Markup
*   Menampilkan katalog seluruh produk beserta kode produk, harga modal, penjelasan komisi bagi hasil, nominal pembulatan, dan harga jual akhir.
*   Panel **Aturan Markup Profit Global** untuk memodifikasi profit default koperasi/reseller secara global.

### F5. Laporan Laba Terpisah (Dokumen Terpisah)
*   Penyaringan data transaksi berdasarkan rentang tanggal.
*   Tabulasi Laporan terpisah:
    *   **Laporan Laba Saya (Reseller):** Rekaman transaksi yang menghasilkan profit reseller.
    *   **Laporan Laba Koperasi:** Rekaman transaksi yang menghasilkan bagi hasil koperasi.
*   Fungsi cetak langsung menggunakan printer/simpan PDF dengan styling ramah cetak.
*   Fungsi ekspor ke spreadsheet (.CSV).

---

## 4. Logika Perhitungan & Bagi Hasil Finansial
Aturan pembagian keuntungan dikunci secara otomatis saat transaksi disimpan berdasarkan rumus matematika berikut:

### Kategori 1: Pulsa Seluler
*   **Harga Jual Dasar:** Harga Modal + Komisi Reseller + Komisi Koperasi
*   **Aturan Bagi Hasil Pokok:** Koperasi = Rp 1.000 | Reseller = Rp 1.000
*   **Pembulatan Harga Jual Akhir:** Harga jual dasar dibulatkan ke atas menuju ribuan bulat terdekat (kelipatan Rp 1.000).
*   **Bonus Pembulatan:** Selisih pembulatan dialokasikan ke kas reseller.
*   **Rumus:**
    $$\text{Harga Jual Akhir} = \text{Math.ceil}((\text{Harga Modal} + \text{Rp 2.000}) / 1000) \times 1000$$
    $$\text{Laba Koperasi} = \text{Rp 1.000}$$
    $$\text{Laba Reseller} = \text{Rp 1.000} + (\text{Harga Jual Akhir} - \text{Harga Modal} - \text{Rp 2.000})$$

### Kategori 2: Topup E-Wallet & Game
*   **Aturan Bagi Hasil Pokok:** Koperasi = Rp 0 | Reseller = Rp 3.000
*   **Pembulatan Harga Jual Akhir:** Dibotolkan ke atas menuju ribuan bulat terdekat (kelipatan Rp 1.000).
*   **Rumus:**
    $$\text{Harga Jual Akhir} = \text{Math.ceil}((\text{Harga Modal} + \text{Rp 3.000}) / 1000) \times 1000$$
    $$\text{Laba Koperasi} = \text{Rp 0}$$
    $$\text{Laba Reseller} = \text{Rp 3.000} + (\text{Harga Jual Akhir} - \text{Harga Modal} - \text{Rp 3.000})$$

### Kategori 3: Pembayaran Tagihan (PLN Bulanan, PDAM, dll)
*   *Catatan:* Tagihan tidak menggunakan pembulatan kelipatan Rp 1.000 untuk mencegah selisih bayar nominal tagihan riil pelanggan.
*   **Aturan Bagi Hasil Pokok:** Koperasi = Rp 0 | Reseller = Rp 3.000
*   **Rumus:**
    $$\text{Harga Jual Akhir} = \text{Harga Tagihan (Modal)} + \text{Rp 3.000}$$
    $$\text{Laba Koperasi} = \text{Rp 0}$$
    $$\text{Laba Reseller} = \text{Rp 3.000}$$

---

## 5. Skema Relasi Database Lokal & Cloud (Supabase)
Sistem dapat menyimpan data secara lokal pada `localStorage` browser dan mensinkronisasikannya ke server cloud PostgreSQL melalui API Supabase dengan skema berikut:

### Tabel 1: `konter_customers`
```sql
CREATE TABLE konter_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabel 2: `konter_transactions`
```sql
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
```
