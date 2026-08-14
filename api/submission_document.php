<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Jakarta');

$config = require __DIR__ . "/config.php";
require __DIR__ . "/db.php";

$nim = trim((string)($_GET["nim"] ?? ""));
$token = trim((string)($_GET["token"] ?? ""));

if ($nim === "" || $token === "" || !preg_match('/^[0-9]{8,20}$/', $nim)) {
    http_response_code(400);
    exit("Dokumen tidak dapat dibuka.");
}

$secret = (string)($config["document_secret"] ?? "");
$expectedToken = hash_hmac("sha256", $nim, $secret);
if ($secret === "" || !hash_equals($expectedToken, $token)) {
    http_response_code(403);
    exit("Akses dokumen tidak valid.");
}

try {
    $stmt = $pdo->prepare(""
        . "SELECT r.nim, r.nama, r.angkatan, r.fakultas, r.program_studi, "
        . "r.tempat_tinggal, r.nama_tempat, r.alamat, r.rt, r.rw, r.desa, "
        . "r.kecamatan, r.kabupaten, r.kode_pos, q.submitted_at "
        . "FROM questionnaire_responses q "
        . "INNER JOIN respondent_profiles r ON r.id = q.respondent_id "
        . "WHERE q.id_key = :nim AND q.status = 'submitted' LIMIT 1"
    );
    $stmt->execute([":nim" => $nim]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        http_response_code(404);
        exit("Data pengiriman untuk NIM tersebut tidak ditemukan.");
    }

    $submittedAt = new DateTime((string)$data["submitted_at"]);
    $submittedAt->setTimezone(new DateTimeZone("Asia/Jakarta"));
    $tanggal = $submittedAt->format("d-m-Y");
    $waktu = $submittedAt->format("H:i:s") . " WIB";

    $e = static fn($value): string => htmlspecialchars((string)($value ?? ""), ENT_QUOTES, "UTF-8");
    $value = static fn($value): string => ($value !== null && trim((string)$value) !== "") ? $e($value) : "-";

    $filename = "Bukti_Pengisian_Pojok_Sensus_" . preg_replace('/[^0-9A-Za-z_-]/', '_', $nim) . ".html";
    header("Content-Type: text/html; charset=utf-8");
    header("Content-Disposition: inline; filename=\"{$filename}\"");
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bukti Pengisian Pojok Sensus - <?= $e($data['nim']) ?></title>
<style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #222;
        background: #f3f6f8;
        line-height: 1.5;
    }
    .page {
        width: min(900px, calc(100% - 32px));
        margin: 32px auto;
        background: #fff;
        padding: 42px 48px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 10px 30px rgba(0,0,0,.06);
    }
    .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        border-bottom: 3px solid #f97316;
        padding-bottom: 20px;
        margin-bottom: 28px;
    }
    .brand-small { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #666; }
    h1 { margin: 5px 0 0; font-size: 25px; }
    .badge { display: inline-block; padding: 7px 11px; border-radius: 999px; background: #fff0e6; color: #c2410c; font-weight: 700; font-size: 12px; white-space: nowrap; }
    .success { text-align: center; margin: 20px 0 30px; }
    .success-mark { width: 48px; height: 48px; line-height: 48px; border-radius: 50%; margin: 0 auto 12px; background: #16a34a; color: #fff; font-size: 25px; font-weight: 700; }
    .success h2 { margin: 0 0 6px; font-size: 22px; }
    .success p { margin: 0; color: #555; }
    .section-title { margin: 28px 0 12px; font-size: 15px; font-weight: 700; padding-bottom: 7px; border-bottom: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 9px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    td:first-child { width: 34%; color: #555; }
    td:last-child { font-weight: 600; }
    .submitted { margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; }
    .submitted strong { display: block; margin-bottom: 4px; }
    .souvenir-note {
        margin: 16px auto 0;
        max-width: 760px;
        padding: 12px 16px;
        border: 1px solid #fed7aa;
        border-radius: 10px;
        background: #fff7ed;
        color: #7c2d12;
        text-align: center;
        font-size: 12px;
        line-height: 1.5;
    }
    .souvenir-note strong {
        display: block;
    }
    .souvenir-note span {
        display: block;
        margin-top: 4px;
        font-style: italic;
    }
    .footer { margin-top: 30px; font-size: 11px; color: #777; text-align: center; }
    .actions { display: flex; justify-content: center; gap: 10px; margin: 24px auto 0; }
    button { border: 0; border-radius: 8px; padding: 11px 18px; font-weight: 700; cursor: pointer; background: #f97316; color: #fff; }
    button.secondary { background: #374151; }
    @media print {
        body { background: #fff; }
        .page { width: 100%; margin: 0; padding: 0; border: 0; box-shadow: none; }
        .actions { display: none; }
    }
</style>
</head>
<body>
<main class="page">
    <header class="header">
        <div>
            <div class="brand-small">Badan Pusat Statistik Kabupaten Ogan Ilir</div>
            <h1>Pojok Sensus</h1>
        </div>
        <span class="badge">BUKTI PENGISIAN</span>
    </header>

    <section class="success">
        <div class="success-mark">✓</div>
        <h2>Data Berhasil Dicatat</h2>
        <p>Selamat kamu sudah berhasil mengisi sensus untuk mahasiswa Universitas Sriwijaya yang berdomisili di Indralaya</p>
    </section>

    <div class="section-title">Data Registrasi Awal</div>
    <table>
        <tr><td>Nama</td><td><?= $value($data['nama']) ?></td></tr>
        <tr><td>NIM</td><td><?= $value($data['nim']) ?></td></tr>
        <tr><td>Angkatan</td><td><?= $value($data['angkatan']) ?></td></tr>
        <tr><td>Fakultas</td><td><?= $value($data['fakultas']) ?></td></tr>
        <tr><td>Program Studi</td><td><?= $value($data['program_studi']) ?></td></tr>
        <tr><td>Tempat Tinggal</td><td><?= $value($data['tempat_tinggal']) ?></td></tr>
        <tr><td>Nama Tempat Tinggal</td><td><?= $value($data['nama_tempat']) ?></td></tr>
        <tr><td>Alamat</td><td><?= $value($data['alamat']) ?></td></tr>
        <tr><td>RT / RW</td><td><?= $value($data['rt']) ?> / <?= $value($data['rw']) ?></td></tr>
        <tr><td>Desa / Kelurahan</td><td><?= $value($data['desa']) ?></td></tr>
        <tr><td>Kecamatan</td><td><?= $value($data['kecamatan']) ?></td></tr>
        <tr><td>Kabupaten / Kota</td><td><?= $value($data['kabupaten']) ?></td></tr>
        <tr><td>Kode Pos</td><td><?= $value($data['kode_pos']) ?></td></tr>
    </table>

    <div class="section-title">Waktu Pengiriman</div>
    <div class="submitted">
        <strong>Tanggal</strong>
        <?= $e($tanggal) ?>
        <br>
        <strong style="margin-top:8px">Waktu</strong>
        <?= $e($waktu) ?>
    </div>

    <div class="actions">
        <button onclick="window.print()">Cetak / Simpan PDF</button>
        <button class="secondary" onclick="window.location.href='../index.html'">Kembali ke Halaman Awal</button>
    </div>

    <div class="souvenir-note">
        <strong>Bukti dokumentasi pengisian kuesioner ini silahkan dibawa untuk ditukar dengan souvenir menarik dari BPS Ogan Ilir</strong>
        <span>*Syarat dan Ketentuan berlaku</span>
    </div>

    <div class="footer">Dokumen ini merupakan bukti bahwa Form 3 Pojok Sensus telah berhasil dikirimkan.</div>
</main>
</body>
</html>
<?php
} catch (Throwable $e) {
    http_response_code(500);
    exit("Dokumen tidak dapat dibuat.");
}
