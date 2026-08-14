# Pojok Sensus — MySQL V5

## Arsitektur key
- `respondent_profiles.id_key` = NIM mahasiswa.
- `respondent_profiles.nim` juga UNIQUE.
- `questionnaire_responses.id_key` = NIM dan UNIQUE.
- JOIN final memakai `id_key`, sehingga jawaban tidak tertukar antar mahasiswa.

## Alur
1. Tahap 1–3 dikirim ke `api/save_profile.php` berdasarkan NIM.
2. Jika NIM belum ada: INSERT profil baru.
3. Jika NIM sudah ada: UPDATE profil mahasiswa tersebut.
4. Saat masuk kuesioner, `api/get_profile.php?nim=...` mengambil profil dari database.
5. Saat submit kuesioner, backend mencari profil berdasarkan NIM dan melakukan UPSERT hanya untuk NIM tersebut.
6. Tombol `Isi Data Lain` menghapus localStorage agar draft mahasiswa sebelumnya tidak ikut terbawa.

## Upgrade database yang sudah ada
Jika database V4 sudah terisi, import `database/migration_v5.sql` melalui phpMyAdmin.
**Sebelum menambahkan UNIQUE NIM, pastikan query pengecekan duplikat menghasilkan 0 baris.**

Jika database masih kosong, gunakan `database/schema_v5.sql`.

## Update v6 – Autosave Kuesioner & Format Rupiah

Setelah update kode ini, jalankan `database/migration_v6.sql` pada database `pojok_sensus`.

Perubahan utama:
- Nama pada kuesioner diambil otomatis dari data registrasi berdasarkan NIM dan dibuat read-only.
- Jawaban kuesioner disimpan otomatis ke LocalStorage dan juga di-backup ke MySQL melalui `api/save_questionnaire.php`.
- Draft kuesioner dapat dimuat kembali melalui `api/get_questionnaire.php`.
- Field nominal pada Blok II Usaha menggunakan format `Rp 1.000.000` dan maksimal Rp1.000.000 per field input.
- Field total otomatis tetap dapat menghasilkan nilai di atas Rp1.000.000.
