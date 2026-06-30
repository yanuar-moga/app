# SIPANDA - Panduan Deployment Sistem

Sistem Informasi Panduan dan Diagnostik Siswa dirancang menggunakan arsitektur **PWA Modern UI 2026** terkoneksi secara cloud menuju engine eksternal **Google Apps Script** dan **Google Drive Storage**.

## Langkah Persiapan Database (Google Sheets)
Buatlah sebuah Spreadsheet baru dengan ID `1bjy5x2MgD92uEDs8z-DyDRg6puKk8od8RSf5y4L70lo` yang memuat lembar kerja (Sheets) berikut dengan baris pertamanya berisi header persis seperti di bawah ini:

1. **Config**: Kolom: `Variabel`, `Value`
2. **User**: Kolom: `Username`, `PIN`, `Role`, `Aktif` (Isi default baris 2: `admin`, `admin`, `ADMIN`, `YA`)
3. **Siswa**: Kolom: `No Absen`, `Kelas`, `Nama Lengkap`, `Nama Panggilan`, `Jenis Kelamin`, `Tempat Lahir`, `Tanggal Lahir`, `Alamat Lengkap`, `No WA Siswa`, `No WA Orang Tua`, `Hobi`, `Cita-cita`, `NIS`, `NISN`, `Pelajaran Disukai`, `Pelajaran Tidak Disukai`, `Ekskul`, `Kegiatan yang Memotivasi`, `Cara Belajar`, `Nama Ayah`, `Pekerjaan Ayah`, `Pendidikan Ayah`, `Nama Ibu`, `Pekerjaan Ibu`, `Pendidikan Ibu`, `Yang Sering Dibicarakan dengan Orang Tua`, `Harapan Orang Tua`, `Punya KIP`, `Yatim/Piatu`, `Link Pas Foto`, `Link KK`, `Link Akta`
4. **Diagnostik**: Kolom: `Timestamp`, `Username`, `Gaya Belajar`, `Kepribadian`, `Kesimpulan`
5. **Chat**: Kolom: `Timestamp`, `Username`, `Pesan`, `Anonim`, `Status`
6. **Mood**: Kolom: `Timestamp`, `Username`, `Mood`
7. **Prestasi**: Kolom: `Timestamp`, `Username`, `Nama Prestasi`, `Tingkat`, `Keterangan`, `Link Foto`
8. **Pelanggaran**: Kolom: `Timestamp`, `Username`, `Pelanggaran`, `Poin`, `Keterangan`
9. **Catatan**: Kolom: `Timestamp`, `Username`, `Catatan Wali`
10. **Log Aktivitas**: Kolom: `Timestamp`, `Username`, `Aksi`, `Status`

## Penerbitan Backend Engine (Google Apps Script)
1. Buka [script.google.com](https://script.google.com).
2. Buat project baru dan paste kode dari file `Code.gs`.
3. Klik tombol **Deploy** -> **New Deployment**.
4. Pilih jenis deployment **Web App**.
5. Ubah akses kontrol **Execute as:** `Me` dan **Who has access:** `Anyone`.
6. Salin URL Web App yang dihasilkan lalu tempelkan ke variabel `GAS_API_URL` pada file `app.js`.

## Penerbitan Frontend (GitHub Pages)
1. Buat repositori baru di GitHub dengan opsi publik.
2. Unggah file `index.html`, `app.js`, `manifest.json`, dan `sw.js` ke dalam repositori tersebut.
3. Masuk ke tab **Settings** -> **Pages** di dalam repositori Anda.
4. Pilih branch `main` / `root` sebagai sumber penerbitan lalu tekan **Save**.
5. Aplikasi SIPANDA Anda sekarang sudah aktif dan dapat diakses secara publik melalui smartphone!
