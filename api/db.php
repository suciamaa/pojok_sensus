<?php
declare(strict_types=1);

/*
 * Native PHP + MySQL database bootstrap.
 *
 * This file intentionally performs a small, idempotent compatibility migration
 * so an existing Pojok Sensus database does NOT need to be dropped/re-imported.
 * It only creates missing tables/columns/indexes that the PHP API requires.
 */

$config = require __DIR__ . "/config.php";
$dsn = sprintf(
    "mysql:host=%s;port=%s;dbname=%s;charset=%s",
    $config["host"], $config["port"], $config["name"], $config["charset"]
);

try {
    $pdo = new PDO($dsn, $config["user"], $config["pass"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    throw new RuntimeException("Koneksi database gagal: " . $e->getMessage(), 0, $e);
}

/** Return true when a table exists in the configured database. */
function dbTableExists(PDO $pdo, string $table): bool {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?"
    );
    $stmt->execute([$table]);
    return (int)$stmt->fetchColumn() > 0;
}

/** Return true when a column exists. */
function dbColumnExists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?"
    );
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

/** Return true when an index with this name exists. */
function dbIndexExists(PDO $pdo, string $table, string $index): bool {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?"
    );
    $stmt->execute([$table, $index]);
    return (int)$stmt->fetchColumn() > 0;
}

function dbAddColumn(PDO $pdo, string $table, string $column, string $definition): void {
    if (!dbColumnExists($pdo, $table, $column)) {
        $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
    }
}

function dbEnsureSchema(PDO $pdo): void {
    // New installation: create the complete tables.
    if (!dbTableExists($pdo, "respondent_profiles")) {
        $pdo->exec(<<<'SQL'
CREATE TABLE respondent_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    respondent_uuid CHAR(36) NOT NULL UNIQUE,
    id_key VARCHAR(30) NULL,
    nim VARCHAR(30) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    hp VARCHAR(30) NULL,
    angkatan VARCHAR(20) NULL,
    fakultas VARCHAR(150) NOT NULL,
    program_studi VARCHAR(150) NOT NULL,
    tempat_tinggal VARCHAR(100) NOT NULL,
    nama_tempat VARCHAR(150) NULL,
    provinsi VARCHAR(120) NULL DEFAULT 'Sumatera Selatan',
    alamat VARCHAR(255) NULL,
    rt VARCHAR(10) NULL,
    rw VARCHAR(10) NULL,
    desa VARCHAR(120) NULL,
    sls VARCHAR(255) NULL,
    kecamatan VARCHAR(120) NULL,
    kabupaten VARCHAR(120) NULL DEFAULT 'Ogan Ilir',
    kode_pos VARCHAR(10) NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    full_address VARCHAR(500) NULL,
    status ENUM('draft','completed') NOT NULL DEFAULT 'draft',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kecamatan (kecamatan),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    } else {
        // Existing database: add only fields that the PHP backend needs.
        dbAddColumn($pdo, "respondent_profiles", "id_key", "VARCHAR(30) NULL AFTER respondent_uuid");
        dbAddColumn($pdo, "respondent_profiles", "provinsi", "VARCHAR(120) NULL DEFAULT 'Sumatera Selatan' AFTER nama_tempat");
        dbAddColumn($pdo, "respondent_profiles", "sls", "VARCHAR(255) NULL AFTER desa");

        // Older installations may have the old status enum without draft.
        try {
            $pdo->exec("ALTER TABLE respondent_profiles MODIFY COLUMN status ENUM('draft','completed') NOT NULL DEFAULT 'draft'");
        } catch (Throwable $ignored) {
            // Leave an unusual legacy schema untouched; the application can still report its SQL error.
        }

        // Backfill the business key from the already-existing NIM.
        $pdo->exec("UPDATE respondent_profiles SET id_key = nim WHERE (id_key IS NULL OR id_key = '') AND nim IS NOT NULL AND nim <> ''");
        $pdo->exec("UPDATE respondent_profiles SET provinsi = 'Sumatera Selatan' WHERE provinsi IS NULL OR provinsi = ''");
        $pdo->exec("UPDATE respondent_profiles SET kabupaten = 'Ogan Ilir' WHERE kabupaten IS NULL OR kabupaten = ''");
    }

    if (!dbTableExists($pdo, "questionnaire_responses")) {
        $pdo->exec(<<<'SQL'
CREATE TABLE questionnaire_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    respondent_id BIGINT UNSIGNED NOT NULL,
    id_key VARCHAR(30) NULL,
    answers_json LONGTEXT NOT NULL,
    foto_depan_path VARCHAR(255) NULL,
    foto_ruang_tamu_path VARCHAR(255) NULL,
    status ENUM('draft','submitted','failed') NOT NULL DEFAULT 'draft',
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_questionnaire_respondent (respondent_id),
    INDEX idx_questionnaire_submitted_at (submitted_at),
    CONSTRAINT fk_questionnaire_respondent FOREIGN KEY (respondent_id) REFERENCES respondent_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    } else {
        dbAddColumn($pdo, "questionnaire_responses", "id_key", "VARCHAR(30) NULL AFTER respondent_id");
        dbAddColumn($pdo, "questionnaire_responses", "foto_depan_path", "VARCHAR(255) NULL");
        dbAddColumn($pdo, "questionnaire_responses", "foto_ruang_tamu_path", "VARCHAR(255) NULL");
        try {
            $pdo->exec("ALTER TABLE questionnaire_responses MODIFY COLUMN status ENUM('draft','submitted','failed') NOT NULL DEFAULT 'draft'");
        } catch (Throwable $ignored) {}

        // Populate id_key from the trusted respondent relation.
        if (dbColumnExists($pdo, "respondent_profiles", "id_key")) {
            $pdo->exec(
                "UPDATE questionnaire_responses q INNER JOIN respondent_profiles r ON r.id = q.respondent_id " .
                "SET q.id_key = r.id_key WHERE (q.id_key IS NULL OR q.id_key = '')"
            );
        }
    }

    // Non-destructive indexes. Do NOT force UNIQUE indexes if legacy data has duplicates;
    // that would make a harmless deployment fail and potentially lock out existing data.
    if (!dbIndexExists($pdo, "respondent_profiles", "idx_id_key")) {
        try { $pdo->exec("CREATE INDEX idx_id_key ON respondent_profiles (id_key)"); } catch (Throwable $ignored) {}
    }
    if (!dbIndexExists($pdo, "questionnaire_responses", "idx_questionnaire_id_key")) {
        try { $pdo->exec("CREATE INDEX idx_questionnaire_id_key ON questionnaire_responses (id_key)"); } catch (Throwable $ignored) {}
    }

    // Reporting view is safe to recreate and does not delete any data.
    if (dbTableExists($pdo, "respondent_profiles") && dbTableExists($pdo, "questionnaire_responses")) {
        try {
            $pdo->exec(<<<'SQL'
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
LEFT JOIN questionnaire_responses q ON q.id_key = r.id_key
SQL);
        } catch (Throwable $ignored) {}
    }
}

// Run once per PHP request. All operations above are idempotent and preserve existing rows.
try {
    dbEnsureSchema($pdo);
} catch (Throwable $e) {
    throw new RuntimeException("Inisialisasi struktur database gagal: " . $e->getMessage(), 0, $e);
}
