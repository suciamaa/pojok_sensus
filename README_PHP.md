# Pojok Sensus — Native PHP + MySQL

Backend project ini sepenuhnya **Native PHP + MySQL (PDO)**. Node.js/Express/npm tidak diperlukan.

## Penting untuk database lama

**Tidak perlu menghapus atau import ulang database lama hanya karena mengganti backend ke PHP.**

Setiap endpoint PHP memuat `api/db.php`. File tersebut melakukan **compatibility migration yang idempotent** saat koneksi database berhasil. Migration hanya:

- membuat tabel yang belum ada;
- menambahkan kolom yang memang dibutuhkan backend PHP tetapi belum ada pada database lama;
- mengisi `id_key` dari NIM untuk data lama;
- mengisi default provinsi/kabupaten bila kosong;
- menambahkan index non-destruktif bila belum ada;
- memperbarui view pelaporan bila memungkinkan.

Migration **tidak DROP TABLE, tidak TRUNCATE, dan tidak menghapus data responden/kuesioner**.

Karena itu, setelah mengganti file project, database lama dapat langsung dipakai selama user MySQL memiliki izin `ALTER` untuk compatibility migration.

## Jika membuat database baru

Untuk instalasi database kosong, `database/schema.sql` tetap dapat di-import satu kali. Setelah itu backend PHP akan melakukan pengecekan kompatibilitas secara otomatis.

## Konfigurasi Hostinger

Edit `api/config.php` jika environment variable belum digunakan:

- `DB_HOST` — host MySQL
- `DB_PORT` — biasanya `3306`
- `DB_NAME` — nama database
- `DB_USER` — username MySQL
- `DB_PASS` — password MySQL
- `DOC_SECRET` — secret untuk dokumen bukti submission

## Alur

```text
Frontend HTML/CSS/JavaScript
          |
          | fetch/AJAX
          v
     Native PHP API
          |
          | PDO
          v
       MySQL
```

JavaScript frontend tetap dipakai untuk conditional logic, validasi, dynamic form, draft/localStorage, navigasi, perhitungan, dan interaksi pengguna.

## Endpoint utama

- `api/health.php` — cek koneksi PHP → MySQL sekaligus compatibility migration.
- `api/save_profile.php` — menyimpan tahap registrasi 1–3.
- `api/get_profile.php` — mengambil profil berdasarkan NIM.
- `api/save_questionnaire.php` — menyimpan draft jawaban.
- `api/submit.php` — menyimpan submission final + foto.
- `api/submission_document.php` — dokumen bukti submission.

## Troubleshooting registrasi

Jika frontend menampilkan **“Data registrasi 1–3 gagal disimpan”**, buka:

`/api/health.php`

Jika health berhasil, coba registrasi lagi. Jika masih gagal, periksa `error_log` PHP/hosting. Endpoint `save_profile.php` tidak lagi mengirim detail SQL/credential ke browser; detail teknis dicatat ke error log server.

## Keamanan

- PDO prepared statements digunakan untuk query dengan input pengguna.
- Password database tidak ditaruh di JavaScript/frontend.
- File upload divalidasi berdasarkan MIME dan ukuran.
- `uploads/` memiliki aturan agar file PHP tidak dieksekusi.
