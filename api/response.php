<?php
declare(strict_types=1);

function jsonResponse(bool $success, string $message, array $extra = [], int $status = 200): never {
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(array_merge(["success" => $success, "message" => $message], $extra), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
