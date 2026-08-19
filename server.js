const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || "pojok_sensus";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DOC_SECRET = process.env.DOC_SECRET || "pojok_sensus_document_secret_change_me";

const UPLOAD_DIR = path.join(__dirname, "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      return cb(new Error("Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP."));
    }
    cb(null, true);
  },
});

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

function jsonResponse(res, success, message, data = {}, status = success ? 200 : 400) {
  return res.status(status).json({ success, message, ...data });
}

function postString(value) {
  return String(value ?? "").trim();
}

function validNim(nim) {
  return /^[0-9]{8,20}$/.test(nim);
}

function safeKey(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "_");
}

function saveUploadedFile(file, nim, fieldName) {
  if (!file) return null;

  const extMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const ext = extMap[file.mimetype];
  if (!ext) throw new Error(`Format ${fieldName} tidak didukung.`);

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const monthDir = path.join(UPLOAD_DIR, year, month);

  fs.mkdirSync(monthDir, { recursive: true });

  const filename = `${safeKey(nim)}_${fieldName}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const target = path.join(monthDir, filename);

  fs.writeFileSync(target, file.buffer);
  return `uploads/${year}/${month}/${filename}`;
}

function cleanupFile(relativePath) {
  if (!relativePath) return;
  const full = path.join(__dirname, relativePath);
  try {
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
}

function hmacToken(nim) {
  return crypto.createHmac("sha256", DOC_SECRET).update(nim).digest("hex");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ""
    ? escapeHtml(value)
    : "-";
}

/* Health check */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return jsonResponse(res, true, "Server dan database aktif.", {
      service: "pojok-sensus",
      database: "connected",
    });
  } catch (err) {
    return jsonResponse(res, false, "Server aktif tetapi database belum terhubung.", {
      error: err.message,
    }, 503);
  }
});

/* GET profile by NIM */
app.get("/api/get_profile", async (req, res) => {
  const nim = postString(req.query.nim);
  if (!nim) return jsonResponse(res, false, "NIM wajib diisi.", {}, 422);

  try {
    const [rows] = await pool.execute(
      `SELECT id_key, nim, nama, hp, angkatan, fakultas, program_studi,
              tempat_tinggal, nama_tempat, alamat, rt, rw, desa, kecamatan,
              kabupaten, kode_pos, latitude, longitude, full_address, status
       FROM respondent_profiles
       WHERE id_key = ?
       LIMIT 1`,
      [nim]
    );

    if (!rows.length) {
      return jsonResponse(res, false, "Data responden dengan NIM tersebut belum ditemukan.", {}, 404);
    }

    return jsonResponse(res, true, "Profil ditemukan.", { data: rows[0] });
  } catch (err) {
    return jsonResponse(res, false, "Profil gagal diambil.", { error: err.message }, 500);
  }
});

/* SAVE profile / stage 1–3 */
app.post("/api/save_profile", upload.none(), async (req, res) => {
  const nim = postString(req.body.nim);
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!validNim(nim)) {
    return jsonResponse(res, false, "NIM responden tidak ditemukan atau tidak valid.", {}, 422);
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return jsonResponse(res, false, "Koordinat berada di luar rentang yang valid.", {}, 422);
  }

  const data = {
    nim,
    nama: postString(req.body.nama),
    hp: postString(req.body.hp),
    angkatan: postString(req.body.angkatan),
    fakultas: postString(req.body.fakultas),
    program_studi: postString(req.body.programStudi),
    tempat_tinggal: postString(req.body.tempatTinggal),
    nama_tempat: postString(req.body.namaTempat),
    alamat: postString(req.body.alamat),
    rt: postString(req.body.rt),
    rw: postString(req.body.rw),
    desa: postString(req.body.desa),
    kecamatan: postString(req.body.kecamatan),
    kabupaten: postString(req.body.kabupaten) || "Ogan Ilir",
    kode_pos: postString(req.body.kodePos),
    latitude,
    longitude,
    full_address: postString(req.body.fullAddress),
  };

  let conn;
  try {
    conn = await pool.getConnection();
    const [existingRows] = await conn.execute(
      "SELECT id, respondent_uuid FROM respondent_profiles WHERE id_key = ? LIMIT 1",
      [nim]
    );

    let respondentId;
    let uuid;

    if (existingRows.length) {
      respondentId = Number(existingRows[0].id);
      uuid = String(existingRows[0].respondent_uuid);

      await conn.execute(
        `UPDATE respondent_profiles SET
          nim=?, nama=?, hp=?, angkatan=?, fakultas=?, program_studi=?,
          tempat_tinggal=?, nama_tempat=?, alamat=?, rt=?, rw=?, desa=?,
          kecamatan=?, kabupaten=?, kode_pos=?, latitude=?, longitude=?,
          full_address=?, status='draft'
         WHERE id_key=?`,
        [
          data.nim, data.nama, data.hp, data.angkatan, data.fakultas, data.program_studi,
          data.tempat_tinggal, data.nama_tempat, data.alamat, data.rt, data.rw, data.desa,
          data.kecamatan, data.kabupaten, data.kode_pos, data.latitude, data.longitude,
          data.full_address, nim,
        ]
      );
    } else {
      uuid = crypto.randomUUID();
      const [result] = await conn.execute(
        `INSERT INTO respondent_profiles
          (respondent_uuid,id_key,nim,nama,hp,angkatan,fakultas,program_studi,
           tempat_tinggal,nama_tempat,alamat,rt,rw,desa,kecamatan,kabupaten,
           kode_pos,latitude,longitude,full_address,status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'draft')`,
        [
          uuid, nim, data.nim, data.nama, data.hp, data.angkatan, data.fakultas, data.program_studi,
          data.tempat_tinggal, data.nama_tempat, data.alamat, data.rt, data.rw, data.desa,
          data.kecamatan, data.kabupaten, data.kode_pos, data.latitude, data.longitude,
          data.full_address,
        ]
      );
      respondentId = Number(result.insertId);
    }

    return jsonResponse(res, true, "Data tahap 1–3 berhasil disimpan berdasarkan NIM.", {
      respondent_id: respondentId,
      id_key: nim,
      nim,
      respondent_uuid: uuid,
      status: "draft",
    });
  } catch (err) {
    return jsonResponse(res, false, "Data tahap 1–3 gagal disimpan.", { error: err.message }, 500);
  } finally {
    if (conn) conn.release();
  }
});

/* SAVE questionnaire draft */
app.post("/api/save_questionnaire", upload.none(), async (req, res) => {
  const nim = postString(req.body.nim);
  const raw = postString(req.body.questionnaire);

  if (!validNim(nim)) return jsonResponse(res, false, "NIM responden tidak ditemukan atau tidak valid.", {}, 422);
  if (!raw) return jsonResponse(res, false, "Data kuesioner kosong.", {}, 422);

  let questionnaire;
  try {
    questionnaire = JSON.parse(raw);
  } catch {
    return jsonResponse(res, false, "Data kuesioner tidak dapat dibaca.", {}, 422);
  }

  try {
    const [profiles] = await pool.execute(
      "SELECT id FROM respondent_profiles WHERE id_key=? LIMIT 1",
      [nim]
    );

    if (!profiles.length) {
      return jsonResponse(res, false, "Data registrasi untuk NIM tersebut belum ditemukan.", {}, 404);
    }

    await pool.execute(
      `INSERT INTO questionnaire_responses
        (respondent_id, id_key, answers_json, status)
       VALUES (?, ?, ?, 'draft')
       ON DUPLICATE KEY UPDATE
        respondent_id=VALUES(respondent_id),
        answers_json=VALUES(answers_json),
        status=IF(status='submitted','submitted','draft'),
        updated_at=CURRENT_TIMESTAMP`,
      [Number(profiles[0].id), nim, JSON.stringify(questionnaire)]
    );

    return jsonResponse(res, true, "Jawaban tersimpan otomatis.", {
      nim,
      saved_at: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse(res, false, "Jawaban gagal disimpan otomatis.", { error: err.message }, 500);
  }
});

/* GET questionnaire draft */
app.get("/api/get_questionnaire", async (req, res) => {
  const nim = postString(req.query.nim);
  if (!validNim(nim)) return jsonResponse(res, false, "NIM responden tidak valid.", {}, 422);

  try {
    const [rows] = await pool.execute(
      `SELECT answers_json, status, updated_at
       FROM questionnaire_responses
       WHERE id_key=? LIMIT 1`,
      [nim]
    );

    if (!rows.length) {
      return jsonResponse(res, false, "Draft kuesioner belum ditemukan.", {}, 404);
    }

    let answers = {};
    try { answers = JSON.parse(rows[0].answers_json || "{}"); } catch (_) {}

    return jsonResponse(res, true, "Draft kuesioner ditemukan.", {
      data: {
        answers,
        status: rows[0].status,
        updated_at: rows[0].updated_at,
      },
    });
  } catch (err) {
    return jsonResponse(res, false, "Draft kuesioner gagal diambil.", { error: err.message }, 500);
  }
});

/* Final submit */
app.post(
  "/api/submit",
  upload.fields([
    { name: "fotoDepan", maxCount: 1 },
    { name: "fotoRuangTamu", maxCount: 1 },
  ]),
  async (req, res) => {
    const nim = postString(req.body.nim);
    const raw = postString(req.body.questionnaire);

    if (!validNim(nim)) {
      return jsonResponse(res, false, "NIM responden tidak ditemukan atau tidak valid.", {}, 422);
    }
    if (!raw) {
      return jsonResponse(res, false, "Jawaban kuesioner wajib diisi.", {}, 422);
    }

    let questionnaire;
    try {
      questionnaire = JSON.parse(raw);
    } catch {
      return jsonResponse(res, false, "Jawaban kuesioner tidak dapat dibaca.", {}, 422);
    }

    const files = req.files || {};
    let fotoDepanPath = null;
    let fotoRuangPath = null;

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [respondents] = await conn.execute(
        `SELECT id, id_key, respondent_uuid, nama
         FROM respondent_profiles
         WHERE id_key=? LIMIT 1`,
        [nim]
      );

      if (!respondents.length) {
        await conn.rollback();
        return jsonResponse(res, false, "Data tahap 1–3 untuk NIM tersebut tidak ditemukan.", {}, 404);
      }

      fotoDepanPath = saveUploadedFile(files.fotoDepan?.[0], nim, "fotoDepan");
      fotoRuangPath = saveUploadedFile(files.fotoRuangTamu?.[0], nim, "fotoRuangTamu");

      await conn.execute(
        `INSERT INTO questionnaire_responses
          (respondent_id,id_key,answers_json,foto_depan_path,foto_ruang_tamu_path,status,submitted_at)
         VALUES (?,?,?,?,?,'submitted',NOW())
         ON DUPLICATE KEY UPDATE
          respondent_id=VALUES(respondent_id),
          answers_json=VALUES(answers_json),
          foto_depan_path=COALESCE(VALUES(foto_depan_path),foto_depan_path),
          foto_ruang_tamu_path=COALESCE(VALUES(foto_ruang_tamu_path),foto_ruang_tamu_path),
          status='submitted',
          submitted_at=NOW()`,
        [
          Number(respondents[0].id),
          nim,
          JSON.stringify(questionnaire),
          fotoDepanPath,
          fotoRuangPath,
        ]
      );

      await conn.execute(
        "UPDATE respondent_profiles SET status='completed' WHERE id_key=?",
        [nim]
      );

      const [submissionRows] = await conn.execute(
        `SELECT q.id, q.submitted_at,
                r.nim, r.nama, r.angkatan, r.fakultas, r.program_studi,
                r.tempat_tinggal, r.nama_tempat, r.alamat, r.rt, r.rw,
                r.desa, r.kecamatan, r.kabupaten, r.kode_pos
         FROM questionnaire_responses q
         INNER JOIN respondent_profiles r ON r.id=q.respondent_id
         WHERE q.id_key=? LIMIT 1`,
        [nim]
      );

      if (!submissionRows.length) throw new Error("Data submission tidak ditemukan setelah penyimpanan.");

      await conn.commit();

      const token = hmacToken(nim);
      const documentUrl = `/api/submission_document?nim=${encodeURIComponent(nim)}&token=${encodeURIComponent(token)}`;

      return jsonResponse(res, true, "Kuesioner berhasil disimpan berdasarkan NIM.", {
        id_key: nim,
        nim,
        respondent_id: Number(respondents[0].id),
        questionnaire_id: Number(submissionRows[0].id),
        submission_id: nim,
        submitted_at: submissionRows[0].submitted_at,
        profile: submissionRows[0],
        document_url: documentUrl,
      });
    } catch (err) {
      if (conn) {
        try { await conn.rollback(); } catch (_) {}
      }
      cleanupFile(fotoDepanPath);
      cleanupFile(fotoRuangPath);

      return jsonResponse(res, false, "Kuesioner gagal disimpan.", { error: err.message }, 500);
    } finally {
      if (conn) conn.release();
    }
  }
);

/* Submission proof */
app.get("/api/submission_document", async (req, res) => {
  const nim = postString(req.query.nim);
  const token = postString(req.query.token);

  if (!validNim(nim) || !token) {
    return res.status(400).send("Dokumen tidak dapat dibuka.");
  }

  const expected = hmacToken(nim);
  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);
  if (expectedBuffer.length !== tokenBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, tokenBuffer)) {
    return res.status(403).send("Akses dokumen tidak valid.");
  }

  try {
    const [rows] = await pool.execute(
      `SELECT r.nim, r.nama, r.angkatan, r.fakultas, r.program_studi,
              r.tempat_tinggal, r.nama_tempat, r.alamat, r.rt, r.rw, r.desa,
              r.kecamatan, r.kabupaten, r.kode_pos, q.submitted_at
       FROM questionnaire_responses q
       INNER JOIN respondent_profiles r ON r.id=q.respondent_id
       WHERE q.id_key=? AND q.status='submitted'
       LIMIT 1`,
      [nim]
    );

    if (!rows.length) return res.status(404).send("Data pengiriman untuk NIM tersebut tidak ditemukan.");

    const data = rows[0];
    const submitted = new Date(data.submitted_at);
    const tanggal = submitted.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const waktu = submitted.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " WIB";

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Bukti_Pengisian_Pojok_Sensus_${safeKey(nim)}.html"`
    );

    return res.send(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bukti Pengisian Pojok Sensus - ${escapeHtml(data.nim)}</title>
<style>
@page{size:A4;margin:18mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#222;background:#f3f6f8;line-height:1.5}.page{width:min(900px,calc(100% - 32px));margin:32px auto;background:#fff;padding:42px 48px;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,.06)}.header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #f97316;padding-bottom:20px;margin-bottom:28px}.brand-small{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666}h1{margin:5px 0 0;font-size:25px}.badge{display:inline-block;padding:7px 11px;border-radius:999px;background:#fff0e6;color:#c2410c;font-weight:700;font-size:12px;white-space:nowrap}.success{text-align:center;margin:20px 0 30px}.success-mark{width:48px;height:48px;line-height:48px;border-radius:50%;margin:0 auto 12px;background:#16a34a;color:#fff;font-size:25px;font-weight:700}.success h2{margin:0 0 6px;font-size:22px}.success p{margin:0;color:#555}.section-title{margin:28px 0 12px;font-size:15px;font-weight:700;padding-bottom:7px;border-bottom:1px solid #ddd}table{width:100%;border-collapse:collapse}td{padding:9px 8px;border-bottom:1px solid #eee;vertical-align:top}td:first-child{width:34%;color:#555}td:last-child{font-weight:600}.submitted{margin-top:24px;padding:16px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px}.submitted strong{display:block;margin-bottom:4px}.souvenir-note{margin:16px auto 0;max-width:760px;padding:12px 16px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;color:#7c2d12;text-align:center;font-size:12px;line-height:1.5}.souvenir-note strong{display:block}.souvenir-note span{display:block;margin-top:4px;font-style:italic}.footer{margin-top:30px;font-size:11px;color:#777;text-align:center}.actions{display:flex;justify-content:center;gap:10px;margin:24px auto 0}button{border:0;border-radius:8px;padding:11px 18px;font-weight:700;cursor:pointer;background:#f97316;color:#fff}button.secondary{background:#374151}@media(max-width:600px){.page{width:100%;margin:0;padding:24px 18px}.header{flex-direction:column;gap:12px}td:first-child{width:38%}.actions{flex-direction:column}button{width:100%}}@media print{body{background:#fff}.page{width:100%;margin:0;padding:0;border:0;box-shadow:none}.actions{display:none}}
</style>
</head>
<body>
<main class="page">
<header class="header">
<div><div class="brand-small">Badan Pusat Statistik Kabupaten Ogan Ilir</div><h1>Pojok Sensus</h1></div>
<span class="badge">BUKTI PENGISIAN</span>
</header>
<section class="success">
<div class="success-mark">✓</div>
<h2>Data Berhasil Dicatat</h2>
<p>Selamat kamu sudah berhasil mengisi kuesioner Pojok Sensus. Terima kasih atas partisipasinya🤗🙏</p>
</section>
<div class="section-title">Data Registrasi Awal</div>
<table>
<tr><td>Nama</td><td>${displayValue(data.nama)}</td></tr>
<tr><td>NIM</td><td>${displayValue(data.nim)}</td></tr>
<tr><td>Angkatan</td><td>${displayValue(data.angkatan)}</td></tr>
<tr><td>Fakultas</td><td>${displayValue(data.fakultas)}</td></tr>
<tr><td>Program Studi</td><td>${displayValue(data.program_studi)}</td></tr>
<tr><td>Tempat Tinggal</td><td>${displayValue(data.tempat_tinggal)}</td></tr>
<tr><td>Nama Tempat Tinggal</td><td>${displayValue(data.nama_tempat)}</td></tr>
<tr><td>Alamat</td><td>${displayValue(data.alamat)}</td></tr>
<tr><td>RT / RW</td><td>${displayValue(data.rt)} / ${displayValue(data.rw)}</td></tr>
<tr><td>Desa / Kelurahan</td><td>${displayValue(data.desa)}</td></tr>
<tr><td>Kecamatan</td><td>${displayValue(data.kecamatan)}</td></tr>
<tr><td>Kabupaten / Kota</td><td>${displayValue(data.kabupaten)}</td></tr>
<tr><td>Kode Pos</td><td>${displayValue(data.kode_pos)}</td></tr>
</table>
<div class="section-title">Waktu Pengiriman</div>
<div class="submitted"><strong>Tanggal</strong>${escapeHtml(tanggal)}<br><strong style="margin-top:8px">Waktu</strong>${escapeHtml(waktu)}</div>
<div class="actions"><button onclick="window.print()">Cetak / Simpan PDF</button><button class="secondary" onclick="window.location.href='/'">Kembali ke Halaman Awal</button></div>
<div class="souvenir-note"><strong>Bukti dokumentasi pengisian kuesioner ini silahkan dibawa untuk ditukar dengan souvenir menarik dari BPS Ogan Ilir</strong><span>*Syarat dan Ketentuan berlaku</span></div>
<div class="footer">Dokumen ini merupakan bukti bahwa Pengisian Pojok Sensus kamu telah berhasil dikirimkan.</div>
</main>
</body></html>`);
  } catch (err) {
    return res.status(500).send("Dokumen tidak dapat dibuat.");
  }
});

/* Serve uploaded files and the web app. */
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(__dirname, {
  extensions: ["html"],
  index: "index.html",
}));

/* Generic error handler */
app.use((err, req, res, next) => {
  console.error(err);
  const message = err instanceof multer.MulterError
    ? (err.code === "LIMIT_FILE_SIZE" ? "Ukuran foto maksimal 5 MB." : err.message)
    : (err.message || "Terjadi kesalahan pada server.");
  return jsonResponse(res, false, message, {}, 400);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Pojok Sensus berjalan pada port ${PORT}`);
});
