<?php
declare(strict_types=1);

$config = require __DIR__ . "/config.php";
$dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=%s", $config["host"], $config["port"], $config["name"], $config["charset"]);

try {
    $pdo = new PDO($dsn, $config["user"], $config["pass"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    throw new RuntimeException("Koneksi database gagal: " . $e->getMessage(), 0, $e);
}
