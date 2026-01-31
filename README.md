# ☕ Kafein Quran

Kafein Quran adalah aplikasi web Al-Quran modern dengan estetika premium yang dirancang untuk memberikan pengalaman membaca yang khusyuk dan intuitif. Aplikasi ini mendukung pemilihan versi Mushaf antara Standar Kemenag RI dan Uthmani (Madinah).

---

## ✨ Fitur Utama

### 🕌 Ibadah & Zakat
- **Kalkulator Zakat Komprehensif** (Baru!):
  - Hitung berbagai jenis zakat: **Zakat Maal, Fitrah, Penghasilan, Emas/Perak, Perdagangan, dan Pertanian**.
  - Dilengkapi fitur **Harga Pasar Terkini** yang dapat dikonfigurasi secara manual untuk akurasi perhitungan.
  - Opsi komoditas lengkap untuk Zakat Fitrah dan Pertanian serta perhitungan nisab otomatis.
- **Jadwal Shalat Global**:
  - Waktu sholat akurat mencakup seluruh dunia menggunakan koordinat GPS atau deteksi IP.
  - Pencarian kota internasional terintegrasi dengan data **Nominatim (OpenStreetMap)**.
  - Hitung mundur ke waktu shalat berikutnya dengan penyesuaian zona waktu otomatis.
- **Dzikir & Tasbih Digital**:
  - Penghitung dzikir interaktif dengan desain minimalis.

### 📖 Membaca Al-Quran
- **Opsi Versi Mushaf**:
  - 🇮🇩 **Versi Kemenag RI**: Menggunakan teks Al-Quran standar Indonesia (Kemenag).
  - 🇸🇦 **Versi Uthmani (Madinah)**: Teks Al-Quran gaya Madinah (Rasm Utsmani).
- **Audio Murattal Interaktif**:
  - Pilihan Qari ternama: **Mishary Rashid al-Afasy**, **Ali Hudhaify**, **Mahmoud al-Husary**.
  - Kontrol audio yang lancar dengan fitur **Auto-play** dan **Repeat Mode**.
- **Mode Menghafal (Memorization Mode)**:
  - Sembunyikan/tampilkan teks ayat secara instan untuk melatih hafalan.
  - Dilengkapi dengan *floating toggle* untuk akses cepat saat membaca.
- **Navigasi Juz & Ayat yang Cepat**:
  - Pindah antar Juz atau lompat ke ayat tertentu secara instan tanpa memuat ulang halaman.
- **Pilihan Font Arab Premium**:
  - **LPMQ Isep Misbah** (Kemenag), **Amiri**, **Uthmanic Hafs**, & **Uthman Taha Naskh**.

### 🔍 Fitur Cerdas & UX
- **Pencarian Canggih & Super Cepat** (Ditingkatkan):
  - Algoritma pencarian lokal yang dioptimalkan dengan *in-memory caching*.
  - Mendukung pencarian multi-kata (*intersection search*) dan penghapusan diakritik Arab (*diacritic removal*).
  - Fitur *highlighting* pada kata kunci dan *infinite scroll* pada hasil pencarian.
- **Berbagi Ayat (Share Ayah)**:
  - Bagikan cuplikan ayat favorit dengan desain premium.
  - **Kustomisasi Tampilan**: Pilih untuk menampilkan atau menyembunyikan Terjemahan, Tafsir, dan Catatan pada gambar pratinjau.
- **Pengalaman Pengguna (UX) Premium**:
  - **Animasi Loading modern** untuk transisi antar halaman yang halus.
  - **Ukuran Font Adaptif** dan **Tema Dinamis** (Dark/Light Mode).
  - Otomatis mengingat lokasi terakhir dibaca (**Last Read**).
  - **Tafsir Kemenag RI** terintegrasi dan **Bookmark dengan Catatan**.

---

## 📡 Sumber Data

Aplikasi ini menggunakan sumber data terbuka yang tepercaya untuk memastikan akurasi:

1.  **[Al-Quran JSON Indonesia (Kemenag)](https://github.com/ianoit/Al-Quran-JSON-Indonesia-Kemenag)**: Sumber utama untuk Teks Al-Quran versi Kemenag RI.
2.  **[Quran JSON (Risan)](https://github.com/risan/quran-json)**: Sumber data untuk Teks Al-Quran versi Uthmani, Terjemahan Indonesia, dan Metadata Surah.
3.  **[Aladhan API](https://aladhan.com/prayer-times-api)**: API utama untuk data jadwal shalat dan astronomi Islam di seluruh dunia.
4.  **[EveryAyah.com](https://everyayah.com/)**: Database audio murattal per ayat berkualitas tinggi.
5.  **[Nominatim OSM](https://nominatim.org/)**: Layanan pencarian lokasi (geocoding) dunia yang digunakan untuk fitur jadwal shalat.
6.  **[Quran.com API v4](https://api.quran.com/docs)**: Referensi untuk struktur data Juz dan Page.

---

## 🛠️ Tech Stack

Kafein Quran dikembangkan menggunakan teknologi modern untuk performa maksimal:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Library**: [Howler.js](https://howlerjs.com/)

---

## 🚀 Panduan Pengembang

### ⚙️ Prasyarat
- **Node.js**: v18.0.0 atau lebih tinggi
- **npm** atau **yarn**

### 📦 Instalasi

1.  **Clone Repositori**:
    ```bash
    git clone https://github.com/muhiqsimui/kafein-quran.git
    cd kafein-quran
    ```

2.  **Instal Dependensi**:
    ```bash
    npm install
    ```

3.  **Jalankan Lingkungan Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka `http://localhost:3000` di browser Anda.

4.  **Build untuk Produksi**:
    ```bash
    npm run build
    npm run start
    ```

## 📄 Lisensi

Proyek ini dilisensikan di bawah **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**.

---
Dikembangkan dengan ❤️ untuk mempermudah umat Islam berinteraksi dengan Al-Quran secara digital.
