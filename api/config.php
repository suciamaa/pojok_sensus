<?php
return [
    "host" => getenv("DB_HOST") ?: "127.0.0.1",
    "port" => getenv("DB_PORT") ?: "3306",
    "name" => getenv("DB_NAME") ?: "pojok_sensus",
    "user" => getenv("DB_USER") ?: "root",
    "pass" => getenv("DB_PASS") ?: "",
    "charset" => "utf8mb4",
    "upload_dir" => dirname(__DIR__) . DIRECTORY_SEPARATOR . "uploads",
    "max_file_size" => 5 * 1024 * 1024,
    // Token untuk membuka dokumen bukti pengisian setelah Form 3 berhasil dikirim.
    "document_secret" => getenv("DOC_SECRET") ?: "pojok_sensus_document_secret_change_me",
];
