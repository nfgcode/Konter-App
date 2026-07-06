# Dokumen Finansial: Penghasilan Koperasi
**Konter-TrackApp v1.0**

Dokumen ini mencatat format, aturan perhitungan, dan akumulasi laba bersih milik Koperasi dari transaksi bagi hasil penjualan pulsa seluler di ruko/konter koperasi.

## 1. Aturan Perhitungan Keuntungan Koperasi
Bagi hasil koperasi dihitung secara otomatis dan eksklusif untuk kategori penjualan Pulsa dengan ketentuan berikut:

*   **Kategori Pulsa Seluler:**
    *   **Komisi Pokok Koperasi:** Flat **Rp 1.000** per transaksi penjualan pulsa.
    *   **Keuntungan Tambahan / Kas:** Rp 0 (kecuali disepakati pembagian bonus pembulatan di masa depan).
    *   **Rumus:**
        $$\text{Laba Koperasi} = \text{Jumlah Transaksi Pulsa} \times \text{Rp 1.000}$$
*   **Kategori Lainnya (Topup Game/E-Wallet & Bayar Tagihan):**
    *   **Bagi Hasil Koperasi:** Rp 0 per transaksi (seluruhnya merupakan hak operasional reseller untuk menutup biaya admin, kecuali dikonfigurasi lain pada menu peraturan).

---

## 2. Format Pencatatan Log Transaksi Koperasi
Log transaksi yang berkontribusi kepada pendapatan koperasi dicatat secara transparan dengan format sebagai berikut:

| Tanggal & Waktu | Pelanggan | Produk | No. Tujuan / ID | Harga Jual (Rp) | Harga Modal (Rp) | Kategori | Laba Koperasi (Rp) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *Contoh* | Budi Santoso | Telkomsel 10.000 | 081234567890 | 13.000 | 10.214 | Pulsa | 1.000 |
| *Contoh* | Siti Aminah | Indosat 25.000 | 085678901234 | 28.000 | 25.527 | Pulsa | 1.000 |

---

## 3. Cara Mengunduh Laporan Laba Koperasi
1.  Buka dashboard di browser pada `http://localhost:8000`.
2.  Masuk ke menu **Laporan Laba** di sidebar kiri.
3.  Pilih tab **Laporan Penghasilan Koperasi**.
4.  Tentukan filter rentang tanggal laporan.
5.  Klik tombol **Ekspor CSV** untuk mengunduh berkas spreadsheet `.csv` laporan laba bersih koperasi terpisah, atau klik **Cetak Laporan** untuk mencetak fisik/menjadikan PDF untuk arsip koperasi.
