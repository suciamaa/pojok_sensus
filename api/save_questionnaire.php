<?php
declare(strict_types=1);

require __DIR__ . "/response.php";
require __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Metode request tidak diizinkan.", [], 405);
}

function postString(string $key): string {
    return trim((string)($_POST[$key] ?? ""));
}

$nim = postString("nim");
$raw = postString("questionnaire");

if ($nim === "" || !preg_match('/^[0-9]{8,20}$/', $nim)) {
    jsonResponse(false, "NIM responden tidak ditemukan atau tidak valid.", [], 422);
}

if ($raw === "") {
    jsonResponse(false, "Data kuesioner kosong.", [], 422);
}

try {
    $questionnaire = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($questionnaire)) {
        throw new RuntimeException("Format jawaban kuesioner tidak valid.");
    }

    $check = $pdo->prepare("SELECT id FROM respondent_profiles WHERE id_key=:id_key LIMIT 1");
    $check->execute([":id_key" => $nim]);
    $respondentId = $check->fetchColumn();

    if (!$respondentId) {
        jsonResponse(false, "Data registrasi untuk NIM tersebut belum ditemukan.", [], 404);
    }

    $json = json_encode($questionnaire, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

    $sql = "INSERT INTO questionnaire_responses
                (respondent_id, id_key, answers_json, status)
            VALUES
                (:respondent_id, :id_key, :answers_json, 'draft')
            ON DUPLICATE KEY UPDATE
                respondent_id = VALUES(respondent_id),
                answers_json = VALUES(answers_json),
                status = IF(status = 'submitted', 'submitted', 'draft'),
                updated_at = CURRENT_TIMESTAMP";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":respondent_id" => (int)$respondentId,
        ":id_key" => $nim,
        ":answers_json" => $json
    ]);

    jsonResponse(true, "Jawaban tersimpan otomatis.", [
        "nim" => $nim,
        "saved_at" => date(DATE_ATOM)
    ]);
} catch (JsonException $e) {
    jsonResponse(false, "Data kuesioner tidak dapat dibaca.", [], 422);
} catch (Throwable $e) {
    jsonResponse(false, "Jawaban gagal disimpan otomatis.", ["error" => $e->getMessage()], 500);
}
