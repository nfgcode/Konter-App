# Dokumen Finansial: Penghasilan Reseller (Saya)
**Konter-TrackApp v1.0**

Dokumen ini mencatat format, aturan perhitungan, dan akumulasi laba bersih milik Reseller (Anda) dari transaksi konter. Aturan bagi hasil mengunci nilai-nilai berikut secara permanen pada saat transaksi dilakukan.

## 1. Aturan Perhitungan Keuntungan Reseller
Setiap transaksi dikategorikan berdasarkan produk dan memiliki perhitungan profit bagi hasil sebagai berikut:

*   **Kategori Pulsa Seluler:**
    *   **Komisi Pokok:** Rp 1.000 per transaksi.
    *   **Bonus Pembulatan:** Selisih antara harga jual (setelah dibulatkan ke ribuan terdekat) dengan harga modal distributor dan komisi dasar.
    *   **Rumus:**
        $$\text{Laba Saya} = \text{Rp 1.000} + (\text{Harga Jual} - \text{Harga Modal} - \text{Rp 2.000})$$
*   **Kategori Lainnya (Topup Game/E-Wallet & Bayar Tagihan):**
    *   **Komisi Pokok:** Rp 3.000 per transaksi (seluruhnya hak reseller, koperasi Rp 0).
    *   **Bonus Pembulatan (Hanya Topup):** Selisih pembulatan ribuan ke atas.
    *   **Rumus:**
        $$\text{Laba Saya} = \text{Rp 3.000} + (\text{Harga Jual} - \text{Harga Modal} - \text{Rp 3.000})$$

---

## 2. Format Pencatatan Log Transaksi Reseller
Data berikut direkam secara real-time dan disimpan pada database lokal (`localStorage`) aplikasi:

| Tanggal & Waktu | Pelanggan | Produk | No. Tujuan / ID | Harga Jual (Rp) | Komisi Pokok (Rp) | Bonus Pembulatan (Rp) | Subtotal Laba Saya (Rp) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *Contoh* | Budi Santoso | Telkomsel 10.000 | 081234567890 | 13.000 | 1.000 | 786 | 1.786 |
| *Contoh* | Anisa Fitri | Gopay 50.000 | 087712345678 | 55.000 | 3.000 | 1.120 | 4.120 |

---

## 3. Cara Mengunduh Laporan Laba Reseller
1.  Buka dashboard di browser pada `http://localhost:8000`.
2.  Masuk ke menu **Laporan Laba** di sidebar kiri.
3.  Pilih tab **Laporan Penghasilan Saya (Reseller)**.
4.  Tentukan filter rentang tanggal laporan.
5.  Klik tombol **Ekspor CSV** untuk mengunduh file spreadsheet `.csv` terpisah, atau klik **Cetak Laporan** untuk mencetak ke kertas/PDF.
