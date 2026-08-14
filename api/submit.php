<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Jakarta');

require __DIR__ . "/response.php";
$config = require __DIR__ . "/config.php";
require __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Metode request tidak diizinkan.", [], 405);
}

function postString(string $key): string { return trim((string)($_POST[$key] ?? "")); }

function saveUpload(string $key, string $idKey, array $config): ?string {
    if (!isset($_FILES[$key]) || $_FILES[$key]["error"] === UPLOAD_ERR_NO_FILE) return null;
    $file = $_FILES[$key];
    if ($file["error"] !== UPLOAD_ERR_OK) throw new RuntimeException("Upload {$key} gagal.");
    if ($file["size"] > $config["max_file_size"]) throw new RuntimeException("Ukuran {$key} melebihi 5 MB.");
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file["tmp_name"]);
    $allowed = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
    if (!isset($allowed[$mime])) throw new RuntimeException("Format {$key} tidak didukung. Gunakan JPG, PNG, atau WEBP.");
    $safeKey = preg_replace('/[^A-Za-z0-9_-]/', '_', $idKey);
    $monthDir = date("Y/m");
    $targetDir = rtrim($config["upload_dir"], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $monthDir;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true)) throw new RuntimeException("Folder upload tidak dapat dibuat.");
    $filename = $safeKey . "_" . $key . "_" . bin2hex(random_bytes(4)) . "." . $allowed[$mime];
    $target = $targetDir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file["tmp_name"], $target)) throw new RuntimeException("File {$key} tidak dapat disimpan.");
    return "uploads/" . str_replace(DIRECTORY_SEPARATOR, "/", $monthDir) . "/" . $filename;
}

$nim = postString("nim");
if ($nim === "" || !preg_match('/^[0-9]{8,20}$/', $nim)) {
    jsonResponse(false, "NIM responden tidak ditemukan atau tidak valid.", [], 422);
}
if (postString("questionnaire") === "") {
    jsonResponse(false, "Jawaban kuesioner wajib diisi.", [], 422);
}

try {
    // Pastikan waktu penyimpanan selalu menggunakan WIB.
    try { $pdo->exec("SET time_zone = '+07:00'"); } catch (Throwable $ignored) {}

    // Cari profil HANYA berdasarkan NIM. respondent_id dari browser tidak dipercaya.
    $check = $pdo->prepare("SELECT id, id_key, respondent_uuid, nama FROM respondent_profiles WHERE id_key=:id_key LIMIT 1");
    $check->execute([":id_key" => $nim]);
    $respondent = $check->fetch();
    if (!$respondent) jsonResponse(false, "Data tahap 1–3 untuk NIM tersebut tidak ditemukan.", [], 404);

    $questionnaire = json_decode(postString("questionnaire"), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($questionnaire)) throw new RuntimeException("Format jawaban kuesioner tidak valid.");

    $fotoDepan = saveUpload("fotoDepan", $nim, $config);
    $fotoRuang = saveUpload("fotoRuangTamu", $nim, $config);

    $pdo->beginTransaction();

    $sql = "INSERT INTO questionnaire_responses
                (respondent_id, id_key, answers_json, foto_depan_path, foto_ruang_tamu_path, status, submitted_at)
            VALUES
                (:respondent_id, :id_key, :answers_json, :foto_depan, :foto_ruang, 'submitted', NOW())
            ON DUPLICATE KEY UPDATE
                respondent_id = VALUES(respondent_id),
                answers_json = VALUES(answers_json),
                foto_depan_path = COALESCE(VALUES(foto_depan_path), foto_depan_path),
                foto_ruang_tamu_path = COALESCE(VALUES(foto_ruang_tamu_path), foto_ruang_tamu_path),
                status = 'submitted',
                submitted_at = NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":respondent_id" => (int)$respondent["id"],
        ":id_key" => $nim,
        ":answers_json" => json_encode($questionnaire, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ":foto_depan" => $fotoDepan,
        ":foto_ruang" => $fotoRuang
    ]);

    $update = $pdo->prepare("UPDATE respondent_profiles SET status='completed' WHERE id_key=:id_key");
    $update->execute([":id_key" => $nim]);

    // Ambil data registrasi awal + timestamp submission dari database.
    $q = $pdo->prepare("SELECT q.id, q.submitted_at,
                               r.nim, r.nama, r.angkatan, r.fakultas, r.program_studi,
                               r.tempat_tinggal, r.nama_tempat, r.alamat, r.rt, r.rw,
                               r.desa, r.kecamatan, r.kabupaten, r.kode_pos
                        FROM questionnaire_responses q
                        INNER JOIN respondent_profiles r ON r.id = q.respondent_id
                        WHERE q.id_key=:id_key LIMIT 1");
    $q->execute([":id_key" => $nim]);
    $submission = $q->fetch(PDO::FETCH_ASSOC);
    if (!$submission) throw new RuntimeException("Data submission tidak ditemukan setelah penyimpanan.");

    $pdo->commit();

    $documentToken = hash_hmac("sha256", $nim, (string)$config["document_secret"]);
    $documentUrl = "api/submission_document.php?nim=" . rawurlencode($nim) . "&token=" . rawurlencode($documentToken);

    jsonResponse(true, "Kuesioner berhasil disimpan berdasarkan NIM.", [
        "id_key" => $nim,
        "nim" => $nim,
        "respondent_id" => (int)$respondent["id"],
        "questionnaire_id" => (int)$submission["id"],
        "submission_id" => $nim,
        "submitted_at" => $submission["submitted_at"],
        "profile" => $submission,
        "document_url" => $documentUrl
    ]);
} catch (JsonException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(false, "Jawaban kuesioner tidak dapat dibaca.", [], 422);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(false, "Kuesioner gagal disimpan.", ["error" => $e->getMessage()], 500);
}
