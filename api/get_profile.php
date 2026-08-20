<?php
declare(strict_types=1);
require __DIR__ . "/response.php";
require __DIR__ . "/db.php";

$nim = trim((string)($_GET["nim"] ?? ""));
if ($nim === "") jsonResponse(false, "NIM wajib diisi.", [], 422);

try {
    $stmt = $pdo->prepare("SELECT id_key, nim, nama, hp, angkatan, fakultas, program_studi, tempat_tinggal, nama_tempat, provinsi, alamat, rt, rw, desa, sls, kecamatan, kabupaten, kode_pos, latitude, longitude, full_address, status FROM respondent_profiles WHERE id_key=:id_key LIMIT 1");
    $stmt->execute([":id_key" => $nim]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(false, "Data responden dengan NIM tersebut belum ditemukan.", [], 404);
    jsonResponse(true, "Profil ditemukan.", ["data" => $row]);
} catch (Throwable $e) {
    jsonResponse(false, "Profil gagal diambil.", ["error" => $e->getMessage()], 500);
}
