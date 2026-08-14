<?php
declare(strict_types=1);
require __DIR__ . "/response.php";
require __DIR__ . "/db.php";

$nim = trim((string)($_GET["nim"] ?? ""));
if ($nim === "" || !preg_match('/^[0-9]{8,20}$/', $nim)) {
    jsonResponse(false, "NIM tidak valid.", [], 422);
}

try {
    $stmt = $pdo->prepare("SELECT id, answers_json, status, updated_at FROM questionnaire_responses WHERE id_key=:id_key LIMIT 1");
    $stmt->execute([":id_key" => $nim]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse(true, "Belum ada draft kuesioner.", ["data" => null]);
    }

    $answers = json_decode((string)$row["answers_json"], true);
    if (!is_array($answers)) $answers = [];

    jsonResponse(true, "Draft kuesioner ditemukan.", [
        "data" => [
            "id" => (int)$row["id"],
            "answers" => $answers,
            "status" => $row["status"],
            "updated_at" => $row["updated_at"]
        ]
    ]);
} catch (Throwable $e) {
    jsonResponse(false, "Draft kuesioner gagal diambil.", ["error" => $e->getMessage()], 500);
}
