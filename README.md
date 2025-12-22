# 🌙 Lumina Quran

Lumina Quran adalah aplikasi web Al-Quran modern yang mengedepankan estetika premium, performa tinggi, dan akurasi teks. Dibangun dengan teknologi web terbaru untuk memberikan pengalaman membaca dan mendengarkan Al-Quran yang khusyuk dan intuitif.

---

## ✨ Fitur Utama

- **Mushaf Digital Otentik**: Menggunakan font **LPMQ Isep Misbah** dan **KFGQPC Uthmanic Naskh** untuk tampilan teks Rasm Utsmani yang jernih dan sesuai standar Mushaf Madinah.
- **Tiga Mode Membaca**:
  - 📖 **Baca per Surah**: Navigasi daftar 114 surah dengan informasi lengkap.
  - 📍 **Baca per Ayat**: Tampilan fokus satu ayat untuk tadabbur yang mendalam.
  - 📄 **Baca per Halaman**: Tampilan replika Mushaf fisik (604 halaman) dengan layout rata kanan-kiri (justified).
- **Audio Murattal Berkualitas**: Recitation oleh **Syaikh Ali Al-Hudhaify** (Imam Masjid Nabawi) dengan kualitas 128kbps yang jernih, diputar secara verse-by-verse.
- **Pencarian Canggih**: Sistem pencarian ayat berdasarkan kata kunci dalam Terjemahan Indonesia maupun Teks Arab secara instan.
- **Tafsir & Markah**: Dilengkapi dengan **Tafsir Kemenag RI** dan fitur **Bookmark** untuk menyimpan kemajuan bacaan Anda.

---

## 📡 Sumber Data & API

Aplikasi ini mengintegrasikan beberapa sumber data terpercaya untuk memastikan reliabilitas:

1.  **[Quran.com API v4](https://api.quran.com/docs)**: Digunakan untuk manajemen data surah, informasi juz, dan mesin pencarian ayat.
2.  **[Rioastamal Quran JSON](https://github.com/rioastamal/quran-json)**: Sumber utama untuk teks ayat (Utsmani) dan Tafsir Kemenag guna memastikan akurasi karakter dan kecepatan loading.
3.  **[QuranicAudio Mirrors](https://quranicaudio.com/)**: Penyedia file audio MP3 murattal per ayat yang stabil dan jernih.

---

## 🛠️ Tech Stack & Dependensi

Lumina Quran dikembangkan menggunakan teknologi terkini (berdasarkan `package.json`):

### Core Framework
- **Next.js**: `16.1.1` (App Router)
- **React**: `19.2.3`
- **TypeScript**: `^5`

### State & Data Management
- **TanStack Query (React Query)**: `^5.90.12`
- **Zustand**: `^5.0.9` (Client-side state & persistence)

### UI & Styling
- **Tailwind CSS**: `^4.0.0`
- **Lucide React**: `^0.562.0` (Icons)
- **Next Themes**: `^0.4.6` (Dark/Light mode support)

### Media Handling
- **Howler.js**: `^2.2.4` (Advanced audio playback control)

---

## 🚀 Panduan Pengembang

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal:

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

Proyek ini dilisensikan di bawah **[Lisensi MIT](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk tujuan kebaikan.

---
Dikembangkan dengan ❤️ untuk kemudahan akses Al-Quran secara digital.
