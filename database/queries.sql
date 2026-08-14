USE pojok_sensus;

-- 1. Data yang tersimpan setelah tahap 1-3 (belum mengisi kuesioner)
SELECT *
FROM respondent_profiles
ORDER BY created_at DESC;

-- 2. Hasil kuesioner saja
SELECT *
FROM questionnaire_responses
ORDER BY submitted_at DESC;

-- 3. Data lengkap responden + kuesioner menggunakan JOIN
SELECT
    r.id AS respondent_id,
    r.nim,
    r.nama,
    r.fakultas,
    r.program_studi,
    r.tempat_tinggal,
    r.kecamatan,
    r.latitude,
    r.longitude,
    q.id AS questionnaire_id,
    q.answers_json,
    q.foto_depan_path,
    q.foto_ruang_tamu_path,
    q.submitted_at
FROM respondent_profiles r
LEFT JOIN questionnaire_responses q
    ON q.respondent_id = r.id
ORDER BY r.created_at DESC;

-- 4. Cara paling praktis: gunakan VIEW hasil JOIN
SELECT *
FROM v_data_sensus_lengkap
ORDER BY respondent_created_at DESC;

-- 5. Hanya responden yang sudah selesai kuesioner
SELECT *
FROM v_data_sensus_lengkap
WHERE questionnaire_id IS NOT NULL
ORDER BY questionnaire_submitted_at DESC;
