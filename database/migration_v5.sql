USE pojok_sensus;

-- Jalankan cek ini terlebih dahulu. Jika hasilnya > 1 pada suatu NIM,
-- rapikan data duplikat sebelum menambahkan UNIQUE KEY.
SELECT nim, COUNT(*) AS jumlah
FROM respondent_profiles
GROUP BY nim
HAVING COUNT(*) > 1;

-- Tambahkan key bisnis berbasis NIM.
ALTER TABLE respondent_profiles ADD COLUMN id_key VARCHAR(30) NULL AFTER respondent_uuid;
UPDATE respondent_profiles SET id_key = nim WHERE id_key IS NULL OR id_key = '';
ALTER TABLE respondent_profiles MODIFY id_key VARCHAR(30) NOT NULL;
ALTER TABLE respondent_profiles ADD UNIQUE KEY uq_profile_id_key (id_key);
ALTER TABLE respondent_profiles ADD UNIQUE KEY uq_profile_nim (nim);

-- Tambahkan id_key NIM pada hasil kuesioner dan isi dari profil lama.
ALTER TABLE questionnaire_responses ADD COLUMN id_key VARCHAR(30) NULL AFTER respondent_id;
UPDATE questionnaire_responses q
JOIN respondent_profiles r ON r.id = q.respondent_id
SET q.id_key = r.id_key
WHERE q.id_key IS NULL OR q.id_key = '';
ALTER TABLE questionnaire_responses MODIFY id_key VARCHAR(30) NOT NULL;
ALTER TABLE questionnaire_responses ADD UNIQUE KEY uq_questionnaire_id_key (id_key);

-- View final: JOIN berdasarkan id_key/NIM, bukan state browser.
CREATE OR REPLACE VIEW v_data_sensus_lengkap AS
SELECT
    r.id AS respondent_id, r.id_key, r.respondent_uuid, r.nim, r.nama, r.hp, r.angkatan,
    r.fakultas, r.program_studi, r.tempat_tinggal, r.nama_tempat, r.alamat, r.rt, r.rw,
    r.desa, r.kecamatan, r.kabupaten, r.kode_pos, r.latitude, r.longitude, r.full_address,
    r.status AS respondent_status, r.created_at AS respondent_created_at, r.updated_at AS respondent_updated_at,
    q.id AS questionnaire_id, q.answers_json AS questionnaire_answers, q.foto_depan_path,
    q.foto_ruang_tamu_path, q.status AS questionnaire_status, q.submitted_at AS questionnaire_submitted_at
FROM respondent_profiles r
LEFT JOIN questionnaire_responses q ON q.id_key = r.id_key;
