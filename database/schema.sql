CREATE DATABASE IF NOT EXISTS pojok_sensus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pojok_sensus;

/* =========================================================
   1. DATA RESPONDEN / TAHAP 1-3
   Data akademik + tempat tinggal disimpan terlebih dahulu.
   ========================================================= */
CREATE TABLE IF NOT EXISTS respondent_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    respondent_uuid CHAR(36) NOT NULL UNIQUE,
    nim VARCHAR(30) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    hp VARCHAR(30) NULL,
    angkatan VARCHAR(20) NULL,
    fakultas VARCHAR(150) NOT NULL,
    program_studi VARCHAR(150) NOT NULL,
    tempat_tinggal VARCHAR(100) NOT NULL,
    nama_tempat VARCHAR(150) NULL,
    alamat VARCHAR(255) NULL,
    rt VARCHAR(10) NULL,
    rw VARCHAR(10) NULL,
    desa VARCHAR(120) NULL,
    kecamatan VARCHAR(120) NULL,
    kabupaten VARCHAR(120) NULL DEFAULT 'Ogan Ilir',
    kode_pos VARCHAR(10) NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    full_address VARCHAR(500) NULL,
    status ENUM('draft','completed') NOT NULL DEFAULT 'draft',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nim (nim),
    INDEX idx_kecamatan (kecamatan),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   2. HASIL KUESIONER
   Satu responden dapat memiliki satu hasil kuesioner.
   Jawaban disimpan JSON agar struktur pertanyaan fleksibel.
   ========================================================= */
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    respondent_id BIGINT UNSIGNED NOT NULL,
    answers_json LONGTEXT NOT NULL,
    foto_depan_path VARCHAR(255) NULL,
    foto_ruang_tamu_path VARCHAR(255) NULL,
    status ENUM('submitted','failed') NOT NULL DEFAULT 'submitted',
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_questionnaire_respondent (respondent_id),
    INDEX idx_questionnaire_submitted_at (submitted_at),
    CONSTRAINT fk_questionnaire_respondent
        FOREIGN KEY (respondent_id) REFERENCES respondent_profiles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   3. VIEW DATA LENGKAP
   BUKAN tabel duplikat. Data diri + kuesioner digabung dengan JOIN.
   ========================================================= */
CREATE OR REPLACE VIEW v_data_sensus_lengkap AS
SELECT
    r.id AS respondent_id,
    r.respondent_uuid,
    r.nim,
    r.nama,
    r.hp,
    r.angkatan,
    r.fakultas,
    r.program_studi,
    r.tempat_tinggal,
    r.nama_tempat,
    r.alamat,
    r.rt,
    r.rw,
    r.desa,
    r.kecamatan,
    r.kabupaten,
    r.kode_pos,
    r.latitude,
    r.longitude,
    r.full_address,
    r.status AS respondent_status,
    r.created_at AS respondent_created_at,
    r.updated_at AS respondent_updated_at,
    q.id AS questionnaire_id,
    q.answers_json AS questionnaire_answers,
    q.foto_depan_path,
    q.foto_ruang_tamu_path,
    q.status AS questionnaire_status,
    q.submitted_at AS questionnaire_submitted_at
FROM respondent_profiles r
LEFT JOIN questionnaire_responses q
    ON q.respondent_id = r.id;
