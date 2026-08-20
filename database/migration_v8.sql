USE pojok_sensus;

-- Blok 03 now stores the canonical province and SLS values.
ALTER TABLE respondent_profiles
    ADD COLUMN provinsi VARCHAR(120) NULL AFTER nama_tempat,
    ADD COLUMN sls VARCHAR(255) NULL AFTER desa;

-- Keep the fixed regional defaults explicit for existing rows.
UPDATE respondent_profiles
SET provinsi = COALESCE(NULLIF(provinsi, ''), 'Sumatera Selatan'),
    kabupaten = COALESCE(NULLIF(kabupaten, ''), 'Ogan Ilir')
WHERE provinsi IS NULL OR provinsi = '' OR kabupaten IS NULL OR kabupaten = '';


-- Refresh the reporting view so the new address fields are available.
CREATE OR REPLACE VIEW v_data_sensus_lengkap AS
SELECT
    r.id AS respondent_id, r.id_key, r.respondent_uuid, r.nim, r.nama, r.hp, r.angkatan,
    r.fakultas, r.program_studi, r.tempat_tinggal, r.nama_tempat, r.provinsi,
    r.alamat, r.rt, r.rw, r.desa, r.sls, r.kecamatan, r.kabupaten, r.kode_pos,
    r.latitude, r.longitude, r.full_address,
    r.status AS respondent_status, r.created_at AS respondent_created_at, r.updated_at AS respondent_updated_at,
    q.id AS questionnaire_id, q.answers_json AS questionnaire_answers, q.foto_depan_path,
    q.foto_ruang_tamu_path, q.status AS questionnaire_status, q.submitted_at AS questionnaire_submitted_at
FROM respondent_profiles r
LEFT JOIN questionnaire_responses q ON q.id_key = r.id_key;
