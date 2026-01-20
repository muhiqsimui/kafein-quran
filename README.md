# 🌙 Lumina Quran

Lumina Quran adalah aplikasi web Al-Quran modern dengan estetika premium yang dirancang untuk memberikan pengalaman membaca yang khusyuk dan intuitif. Aplikasi ini mendukung pemilihan versi Mushaf antara Standar Kemenag RI dan Uthmani (Madinah).

---

## ✨ Fitur Utama

- **Opsi Versi Mushaf**:
  - 🇮🇩 **Versi Kemenag RI**: Menggunakan teks Al-Quran standar Indonesia (Kemenag) yang familiar bagi pengguna di Indonesia (Default).
  - 🇸🇦 **Versi Uthmani (Madinah)**: Teks Al-Quran gaya Madinah (Rasm Utsmani) untuk pembaca internasional.
- **Jadwal Shalat Global** (Baru!):
  - Waktu sholat akurat mencakup seluruh dunia menggunakan koordinat GPS atau deteksi IP.
  - Pencarian kota internasional terintegrasi dengan data **Nominatim (OpenStreetMap)**.
  - Hitung mundur ke waktu sholat berikutnya dengan penyesuaian zona waktu otomatis.
- **Dzikir & Tasbih Digital** (Baru!):
  - Penghitung dzikir interaktif dengan desain minimalis.
  - Mode getar (vibrate) dan siklus target untuk membantu khusyuk berdzikir.
- **Pilihan Font Arab Premium**:
  - **LPMQ Isep Misbah** (Standar Kemenag RI).
  - **Amiri** (Naskh Style).
  - **Uthmanic Hafs** & **Uthman Taha Naskh**.
- **Audio Murattal Interaktif**:
  - Pilihan Qari ternama: **Mishary Rashid al-Afasy**, **Ali Hudhaify**, **Mahmoud al-Husary**.
  - Kontrol audio yang lancar dengan fitur **Auto-play** dan **Repeat Mode**.
- **Mode Navigasi Lengkap**:
  - **Menu "Baca Al-Quran"** yang terkonsolidasi untuk akses cepat:
    - Baca per **Surah**, per **Ayat**, per **Juz**, dan per **Halaman** (Mushaf view).
- **Fitur Pendukung**:
  - **Tafsir Kemenag RI** terintegrasi untuk setiap ayat.
  - **Pencarian Canggih** berdasarkan arti (Terjemahan) maupun teks Arab.
  - **Bookmark & Last Read**: Simpan ayat favorit dan otomatis ingat lokasi terakhir dibaca.
  - **Ukuran Font Adaptif**: Atur ukuran font Arab dan terjemahan sesuai kenyamanan mata.
  - **Tema Dinamis**: Dukungan Dark Mode, Light Mode, dan Sinkronisasi Sistem.

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

Lumina Quran dikembangkan menggunakan teknologi modern untuk performa maksimal:

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
    git clone https://github.com/muhiqsimui/lumina-quran.git
    cd lumina-quran
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

Proyek ini dilisensikan di bawah **[Lisensi MIT](LICENSE)**.

---
Dikembangkan dengan ❤️ untuk mempermudah umat Islam berinteraksi dengan Al-Quran secara digital.
