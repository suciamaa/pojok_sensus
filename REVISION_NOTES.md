# Catatan Revisi Lanjutan — Struktur Identitas Usaha/Perusahaan

- Struktur usaha 3–9 sekarang diperlakukan sebagai satu dataset per usaha.
- Nomor utama dinamis: usaha 1 = 3, usaha 2 = 4, usaha 3 = 5, dst.
- Subbagian setiap usaha di-reset menjadi a–g.
- Pertanyaan dalam subbagian menggunakan format a.1, b.1, c.1, dst.
- Field HTML, name, dan key internal setiap usaha dibuat unik berdasarkan nomor usaha.
- Dynamic rendering mempertahankan data usaha yang masih aktif ketika jumlah usaha berubah.
- Lokasi usaha menggunakan dropdown/select dan disinkronkan ke textbox jawaban lokasi.
- Conditional NIB, alasan NIB, koperasi, internet, serta cabang data 2025/2026 diproses per usaha.
- Total pengeluaran dan pendapatan usaha dihitung per dataset usaha.
- Conditional logic identifikasi usaha dan jumlah usaha tetap dipertahankan.


## Revisi periode e/f/g — 14 Agustus 2026
- Jika Tahun mulai beroperasi secara komersial <= 2025, tampilkan cabang e/f/g Tahun 2025.
- Jika Tahun mulai beroperasi secara komersial = 2026, tampilkan cabang e/f/g Selama Satu Bulan Terakhir.
- Judul g mengikuti periode: 31 Desember 2025 untuk cabang 2025 dan akhir bulan yang lalu untuk cabang 2026.
- Isi sub-pertanyaan, pilihan jawaban, dan conditional logic e/f/g tidak diubah.
- Logic periodisasi pada `questionnaire.js` membatasi cabang bulanan hanya untuk tahun 2026.
