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

$required = ["nim", "nama", "fakultas", "programStudi", "tempatTinggal", "latitude", "longitude"];
foreach ($required as $key) {
    if (postString($key) === "") jsonResponse(false, "Data {$key} wajib diisi.", [], 422);
}

$nim = postString("nim");
if (!preg_match('/^[0-9]{8,20}$/', $nim)) jsonResponse(false, "NIM tidak valid.", [], 422);

if (!preg_match('/^-?\d+(?:\.\d+)?$/', postString("latitude")) ||
    !preg_match('/^-?\d+(?:\.\d+)?$/', postString("longitude"))) {
    jsonResponse(false, "Koordinat lokasi tidak valid.", [], 422);
}

$latitude = (float)postString("latitude");
$longitude = (float)postString("longitude");
if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
    jsonResponse(false, "Koordinat berada di luar rentang yang valid.", [], 422);
}

try {
    $data = [
        ":id_key" => $nim,
        ":nim" => $nim,
        ":nama" => postString("nama"),
        ":hp" => postString("hp"),
        ":angkatan" => postString("angkatan"),
        ":fakultas" => postString("fakultas"),
        ":prodi" => postString("programStudi"),
        ":tinggal" => postString("tempatTinggal"),
        ":nama_tempat" => postString("namaTempat"),
        ":provinsi" => postString("provinsi") ?: "Sumatera Selatan",
        ":alamat" => postString("alamat"),
        ":rt" => postString("rt"),
        ":rw" => postString("rw"),
        ":desa" => postString("desa"),
        ":sls" => postString("sls"),
        ":kecamatan" => postString("kecamatan"),
        ":kabupaten" => postString("kabupaten") ?: "Ogan Ilir",
        ":kode_pos" => postString("kodePos"),
        ":lat" => $latitude,
        ":lng" => $longitude,
        ":full_address" => postString("fullAddress")
    ];

    // NIM/id_key adalah kunci bisnis. Ambil satu baris terbaru jika ada data legacy ganda.
    $find = $pdo->prepare("SELECT id, respondent_uuid FROM respondent_profiles WHERE nim = :nim OR id_key = :id_key ORDER BY id DESC LIMIT 1");
    $find->execute([":nim" => $nim, ":id_key" => $nim]);
    $existing = $find->fetch();

    if ($existing) {
        $respondentId = (int)$existing["id"];
        $uuid = (string)$existing["respondent_uuid"];
        if ($uuid === "") {
            $uuid = sprintf("%s-%s-%s-%s-%s", bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
        }
        $sql = "UPDATE respondent_profiles SET
                    respondent_uuid=:uuid, id_key=:id_key, nim=:nim, nama=:nama, hp=:hp, angkatan=:angkatan,
                    fakultas=:fakultas, program_studi=:prodi, tempat_tinggal=:tinggal, nama_tempat=:nama_tempat,
                    provinsi=:provinsi, alamat=:alamat, rt=:rt, rw=:rw, desa=:desa, sls=:sls,
                    kecamatan=:kecamatan, kabupaten=:kabupaten, kode_pos=:kode_pos,
                    latitude=:lat, longitude=:lng, full_address=:full_address, status='draft'
                WHERE id=:id";
        $data[":uuid"] = $uuid;
        $data[":id"] = $respondentId;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);
    } else {
        $uuid = sprintf("%s-%s-%s-%s-%s", bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
        $data[":uuid"] = $uuid;
        $sql = "INSERT INTO respondent_profiles
                (respondent_uuid,id_key,nim,nama,hp,angkatan,fakultas,program_studi,
                 tempat_tinggal,nama_tempat,provinsi,alamat,rt,rw,desa,sls,kecamatan,kabupaten,
                 kode_pos,latitude,longitude,full_address,status)
                VALUES
                (:uuid,:id_key,:nim,:nama,:hp,:angkatan,:fakultas,:prodi,
                 :tinggal,:nama_tempat,:provinsi,:alamat,:rt,:rw,:desa,:sls,:kecamatan,:kabupaten,
                 :kode_pos,:lat,:lng,:full_address,'draft')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);
        $respondentId = (int)$pdo->lastInsertId();
    }

    jsonResponse(true, "Data tahap 1–3 berhasil disimpan berdasarkan NIM.", [
        "respondent_id" => $respondentId,
        "id_key" => $nim,
        "nim" => $nim,
        "respondent_uuid" => $uuid,
        "status" => "draft"
    ]);
} catch (Throwable $e) {
    // Return a useful diagnostic code without exposing SQL/credential details to users.
    error_log("Pojok Sensus save_profile: " . $e->getMessage());
    jsonResponse(false, "Data tahap 1–3 gagal disimpan. Periksa koneksi/struktur database MySQL.", [
        "error_code" => "PROFILE_DB_SAVE_FAILED"
    ], 500);
}
