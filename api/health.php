<?php
declare(strict_types=1);
require __DIR__ . "/response.php";
require __DIR__ . "/db.php";
try {
    $pdo->query("SELECT 1");
    jsonResponse(true, "Koneksi ke database berhasil.");
} catch (Throwable $e) {
    jsonResponse(false, "Koneksi database gagal.", ["error" => $e->getMessage()], 500);
}
