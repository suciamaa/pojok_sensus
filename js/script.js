/* Google Maps loader bridge: safe even if the async API finishes before DOMContentLoaded. */
window.__googleMapsLoaded = false;
window.initGoogleMaps = function () {
    window.__googleMapsLoaded = true;
    window.dispatchEvent(new Event("googlemapsready"));
};

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // AMBIL ELEMENT HTML
    // =========================================

    const fFakultas = document.getElementById("fFakultas");
    const fProdi = document.getElementById("fProdi");


    // =========================================
    // DATA PROGRAM STUDI
    // =========================================

    const prodiData = {

        ekonomi: [
            "Akuntansi (D3)",
            "Akuntansi (S1)",
            "Ekonomi (S2)",
            "Ekonomi Pembangunan (S1)",
            "Manajemen (S1)",
            "Manajemen (S2)",
            "Sekretari (D3)"
        ],

        hukum: [
            "Ilmu Hukum (S1)",
            "Ilmu Hukum (S2)",
            "Kenotariatan (S2)"
        ],

        teknik: [
            "Arsitektur (S1)",
            "Teknik Elektro (S1)",
            "Teknik Geologi (S1)",
            "Teknik Kimia (S1)",
            "Teknik Kimia (S2)",
            "Teknik Mesin (S1)",
            "Teknik Mesin (S2)",
            "Teknik Pertambangan (S1)",
            "Teknik Pertambangan (S2)",
            "Teknik Sipil (S1)",
            "Teknik Sipil (S2)"
        ],

        kedokteran: [
            "Ilmu Biomedik (S2)",
            "Kedokteran (S1)",
            "Kedokteran Gigi (S1)",
            "Keperawatan (S1)"
        ],

        pertanian: [
            "Agribisnis (S1)",
            "Agribisnis (S2)",
            "Agronomi (S1)",
            "Botani (S2)",
            "Budidaya Perairan (S1)",
            "Ilmu Tanah (S1)",
            "Peternakan (S1)",
            "Proteksi Tanaman (S1)",
            "Teknik Pertanian (S1)",
            "Teknologi Hasil Perikanan (S1)",
            "Teknologi Hasil Pertanian (S1)",
            "Teknologi Industri Pertanian (S2)",
            "Teknologi Pertanian (S1)"
        ],

        fkip: [
            "Bimbingan dan Konseling (S1)",
            "Pendidikan Anak Usia Dini (S1)",
            "Pendidikan Bahasa dan Sastra Indonesia (S1)",
            "Pendidikan Bahasa Inggris (S1)",
            "Pendidikan Biologi (S1)",
            "Pendidikan Dasar Pembelajaran Blended (S1)",
            "Pendidikan Ekonomi (S1)",
            "Pendidikan Fisika (S1)",
            "Pendidikan Fisika (S2)",
            "Pendidikan Guru Sekolah Dasar (S1)",
            "Pendidikan Jasmani, Kesehatan dan Rekreasi (S1)",
            "Pendidikan Kimia (S1)",
            "Pendidikan Linguistik (S2)",
            "Pendidikan Matematika (S1)",
            "Pendidikan Matematika (S2)",
            "Pendidikan Nonformal (S1)",
            "Pendidikan Olahraga (S2)",
            "Pendidikan Pancasila dan Kewarganegaraan (S1)",
            "Pendidikan Sejarah (S1)",
            "Pendidikan Teknik Mesin (S1)",
            "Teknologi Pendidikan (S2)"
        ],

        isip: [
            "Administrasi Publik (S2)",
            "Hubungan Internasional (S1)",
            "Ilmu Administrasi Negara (S1)",
            "Ilmu Komunikasi (S1)",
            "Sosiologi (S1)",
            "Sosiologi (S2)"
        ],

        mipa: [
            "Biologi (S1)",
            "Biologi (S2)",
            "Farmasi (S1)",
            "Fisika (S1)",
            "Fisika (S2)",
            "Ilmu Kelautan (S1)",
            "Kimia (S1)",
            "Kimia (S2)",
            "Matematika (S1)"
        ],

        ilkom: [
            "Informatika (S1)",
            "Informatika (S2)",
            "Komputerisasi Akuntansi (D3)",
            "Manajemen Informatika (D3)",
            "Sistem Informasi (S1)",
            "Sistem Komputer (S1)",
            "Teknik Komputer (D3)"
        ],

        fkm: [
            "Ilmu Gizi (S1)",
            "Ilmu Kesehatan Masyarakat (S2)",
            "Kesehatan Lingkungan (S1)",
            "Kesehatan Masyarakat (S1)"
        ]
    };


    // =========================================
    // FAKULTAS → PROGRAM STUDI
    // =========================================

    fFakultas.addEventListener("change", function () {

        const fakultas = fFakultas.value;

        // Kosongkan prodi
        fProdi.innerHTML = "";

        // Belum memilih fakultas
        if (fakultas === "") {

            fProdi.disabled = true;

            const option = document.createElement("option");

            option.value = "";
            option.textContent = "Pilih fakultas terlebih dahulu";

            fProdi.appendChild(option);

            return;
        }


        // Aktifkan prodi
        fProdi.disabled = false;


        // Option awal
        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Pilih program studi";

        fProdi.appendChild(defaultOption);


        // Ambil data prodi
        const daftarProdi = prodiData[fakultas];


        // Masukkan prodi
        daftarProdi.forEach(function (prodi) {

            const option = document.createElement("option");

            option.value = prodi;
            option.textContent = prodi;

            fProdi.appendChild(option);

        });

    });


    /* =========================================================
       DATA WILAYAH
    ========================================================= */

    const kecamatanData = [

        {
            nama: "Indralaya (Kampus Utama)",
            lat: -3.1867,
            lng: 104.6420,
            petugas: "Rini Aprianti"
        },

        {
            nama: "Kemuning",
            lat: -2.9860,
            lng: 104.7480,
            petugas: "Bayu Saputra"
        },

        {
            nama: "Ilir Barat I",
            lat: -2.9700,
            lng: 104.7300,
            petugas: "Nadia Putri"
        },

        {
            nama: "Sukarami",
            lat: -2.9350,
            lng: 104.7250,
            petugas: "M. Fadli Ramadhan"
        },

        {
            nama: "Bukit Kecil",
            lat: -2.9850,
            lng: 104.7550,
            petugas: "Sarah Amelia"
        },

        {
            nama: "Alang-Alang Lebar",
            lat: -2.9300,
            lng: 104.6950,
            petugas: "Dimas Prasetyo"
        }

    ];


    /* =========================================================
       ELEMENT HTML
    ========================================================= */

    const fNim = document.getElementById("fNim");
    const fAngkatan = document.getElementById("fAngkatan");
    const fNama = document.getElementById("fNama");
    const fHp = document.getElementById("fHp");

    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");
    const backToWelcomeBtn = document.getElementById("backToWelcomeBtn");
    const nextLocationBtn = document.getElementById("nextLocationBtn");
    const submitBtn = document.getElementById("submitQuestionnaireBtn");
    const resetBtn = document.getElementById("resetBtn");

    const stepAcademic = document.getElementById("stepAcademic");
    const stepLocation = document.getElementById("stepLocation");

    const stepQuestionnaire =
    document.getElementById("stepQuestionnaire");

    const questionBackBtn =
    document.getElementById("questionBackBtn");

    const nextQuestionBtn =
    document.getElementById("nextQuestionBtn");

    const progress1 = document.getElementById("progress1");
    const progress2 = document.getElementById("progress2");
    const progress3 = document.getElementById("progress3");
    const progress4 = document.getElementById("progress4");

    const confirmBox = document.getElementById("confirmBox");


    /* =========================================================
       CEK ELEMENT
       Supaya mudah mengetahui kalau ID HTML salah
    ========================================================= */

    if (!fFakultas) {
        console.error("ERROR: id='fFakultas' tidak ditemukan.");
        return;
    }

    if (!fProdi) {
        console.error("ERROR: id='fProdi' tidak ditemukan.");
        return;
    }


    /* =========================================================
       STATE
    ========================================================= */

    let mapPick = null;
    let pickMarker = null;
    let mapInitialized = false;

    let selectedResidence = null;
    let selectedLatLng = null;

    /* =========================================================
       PROGRESS / TAHAPAN FORMULIR
       1 = Pernyataan, 2 = Data Diri,
       3 = Tempat Tinggal, 4 = Kuesioner.
    ========================================================= */

    const progressItems = [
        progress1,
        progress2,
        progress3,
        progress4
    ];

    function syncProgress(currentStep) {
        progressItems.forEach(function (item, index) {
            if (!item) return;

            const stepNumber = index + 1;
            item.classList.remove("active", "completed");

            if (stepNumber < currentStep) {
                item.classList.add("completed");
            } else if (stepNumber === currentStep) {
                item.classList.add("active");
            }
        });
    }


    /* =========================================================
       FAKULTAS → PROGRAM STUDI
    ========================================================= */

    fFakultas.addEventListener("change", function () {

        const faculty = this.value;

        console.log("Fakultas dipilih:", faculty);

        /* Reset program studi */

        fProdi.innerHTML = "";

        fProdi.classList.remove(
            "valid",
            "invalid"
        );


        /* Jika belum memilih fakultas */

        if (!faculty) {

            fProdi.disabled = true;

            const option = document.createElement("option");

            option.value = "";
            option.textContent = "Pilih fakultas terlebih dahulu";

            fProdi.appendChild(option);

            return;
        }


        /* Aktifkan dropdown prodi */

        fProdi.disabled = false;


        /* Pilihan awal */

        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Pilih program studi";

        fProdi.appendChild(defaultOption);


        /* Ambil data prodi */

        const daftarProdi = prodiData[faculty] || [];


        console.log(
            "Jumlah program studi:",
            daftarProdi.length
        );


        /* Masukkan program studi */

        daftarProdi
            .slice()
            .sort((a, b) =>
                a.localeCompare(
                    b,
                    "id",
                    {
                        sensitivity: "base"
                    }
                )
            )
            .forEach(function (program) {

                const option =
                    document.createElement("option");

                option.value = program;
                option.textContent = program;

                fProdi.appendChild(option);

            });

    });


    /* =========================================================
       INPUT NIM
    ========================================================= */

    if (fNim) {

        fNim.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9]/g,
                        ""
                    );

            }
        );

    }


    /* =========================================================
       INPUT NOMOR HP
    ========================================================= */

    if (fHp) {

        fHp.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9]/g,
                        ""
                    );

            }
        );

    }


    /* =========================================================
       INPUT NAMA
    ========================================================= */

    if (fNama) {

        fNama.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^a-zA-ZÀ-ÿ\s]/g,
                        ""
                    );

            }
        );

    }


   
    /* =========================================================
       VALIDATION HELPER
    ========================================================= */

    function setFieldState(
        element,
        isValid
    ) {

        if (!element) return;

        element.classList.remove(
            "valid",
            "invalid"
        );

        element.classList.add(
            isValid
                ? "valid"
                : "invalid"
        );

    }


    function showError(
        id,
        show
    ) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.classList.toggle(
            "show",
            show
        );

    }


    /* =========================================================
       VALIDATE FORM 1
    ========================================================= */

    function validateStep1() {

        let valid = true;


        /* NIM */

        if (fNim) {

            const nim =
                fNim.value.trim();

            const nimValid =
                /^[0-9]{8,15}$/.test(nim);

            setFieldState(
                fNim,
                nimValid
            );

            showError(
                "errNim",
                !nimValid
            );

            if (!nimValid) {
                valid = false;
            }

        }


        /* ANGKATAN */

        if (fAngkatan) {

            const angkatanValid =
                fAngkatan.value !== "";

            setFieldState(
                fAngkatan,
                angkatanValid
            );

            showError(
                "errAngkatan",
                !angkatanValid
            );

            if (!angkatanValid) {
                valid = false;
            }

        }


        /* NAMA */

        if (fNama) {

            const nama =
                fNama.value.trim();

            const namaValid =
                /^[a-zA-ZÀ-ÿ\s]{3,60}$/.test(nama);

            setFieldState(
                fNama,
                namaValid
            );

            showError(
                "errNama",
                !namaValid
            );

            if (!namaValid) {
                valid = false;
            }

        }

       
        /* HP */

        if (fHp) {

            const hp =
                fHp.value.trim();

            const hpValid =
                /^08[0-9]{8,11}$/.test(hp);

            setFieldState(
                fHp,
                hpValid
            );

            showError(
                "errHp",
                !hpValid
            );

            if (!hpValid) {
                valid = false;
            }

        }


        /* FAKULTAS */

        const fakultasValid =
            fFakultas.value !== "";

        setFieldState(
            fFakultas,
            fakultasValid
        );

        showError(
            "errFakultas",
            !fakultasValid
        );

        if (!fakultasValid) {
            valid = false;
        }


        /* PROGRAM STUDI */

        const prodiValid =
            fProdi.value !== "";

        setFieldState(
            fProdi,
            prodiValid
        );

        showError(
            "errProdi",
            !prodiValid
        );

        if (!prodiValid) {
            valid = false;
        }


        return valid;

    }


    /* =========================================================
       FORM 1 → FORM 2
    ========================================================= */

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            function () {

                const valid =
                    validateStep1();


                if (!valid) {

                    const firstInvalid =
                        document.querySelector(
                            ".invalid"
                        );

                    if (firstInvalid) {

                        firstInvalid.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        firstInvalid.focus();

                    }

                    return;

                }


                stepAcademic.classList.add(
                    "hidden"
                );

                stepLocation.classList.remove(
                    "hidden"
                );


                syncProgress(3);


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================================================
       FORM 2 → FORM 1
    ========================================================= */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                stepLocation.classList.add(
                    "hidden"
                );

                stepAcademic.classList.remove(
                    "hidden"
                );


                syncProgress(2);


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================================================
       FORM 2 → HALAMAN DEPAN
    ========================================================= */

    if (backToWelcomeBtn) {
        backToWelcomeBtn.addEventListener("click", function () {
            stepAcademic.classList.add("hidden");
            stepLocation.classList.add("hidden");
            stepQuestionnaire.classList.add("hidden");
            confirmBox?.classList.add("hidden");

            document.querySelectorAll(".app-content").forEach(function (element) {
                element.classList.add("hidden");
            });

            const welcomePage = document.getElementById("welcomePage");
            welcomePage?.classList.remove("hidden");

            syncProgress(1);
            document.querySelectorAll("[id^=welcomeProgress]").forEach(function (item) {
                item.classList.remove("active", "completed");
            });
            document.getElementById("welcomeProgress1")?.classList.add("active");

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }


    /* =========================================================
       PILIH TEMPAT TINGGAL
    ========================================================= */

    document
        .querySelectorAll(".residence-option")
        .forEach(function (option) {

            option.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".residence-option"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    this.classList.add(
                        "selected"
                    );


                    selectedResidence =
                        this.dataset.value;


                    showError(
                        "errResidence",
                        false
                    );


                    showMap();

                    checkSubmitEnabled();

                }
            );

        });
/* =========================================================
   LOCATION / MAP SYSTEM — LAZY LEAFLET + OPENSTREETMAP
   =========================================================
   Peta hanya dimuat ketika halaman Tempat Tinggal dibuka.
   Jadi halaman awal dan Data Akademik tidak perlu menunggu
   library peta.
========================================================= */

const currentLocationBtn = document.getElementById("currentLocationBtn");
const addressSuggestions = document.getElementById("addressSuggestions");
const selectedLocationName = document.getElementById("selectedLocationName");
const selectedFullAddress = document.getElementById("selectedFullAddress");
const coordDesa = document.getElementById("coordDesa");
const coordKec = document.getElementById("coordKec");
const coordKabupaten = document.getElementById("coordKabupaten");
const coordKodePos = document.getElementById("coordKodePos");
const selectedCoordinates = document.getElementById("selectedCoordinates");
const geoStatusText = document.getElementById("geoStatusText");
const geoDot = document.getElementById("geoDot");
const mapInstruction = document.getElementById("mapInstruction");
const locationConfirmed = document.getElementById("locationConfirmed");
const errAddressSearch = document.getElementById("errAddressSearch");
const fNamaTempat = document.getElementById("fNamaTempat");
const fAlamat = document.getElementById("fAlamat");
const fRt = document.getElementById("fRt");
const fRw = document.getElementById("fRw");
const fDesa = document.getElementById("fDesa");
const fKecamatan = document.getElementById("fKecamatan");
const fKabupaten = document.getElementById("fKabupaten");
const fKodePos = document.getElementById("fKodePos");
const questionError = document.getElementById("questionError");

const OGAN_ILIR_CENTER = { lat: -3.2647, lng: 104.6535 };
const OGAN_ILIR_BOUNDS = {
    north: -2.75,
    south: -3.75,
    east: 105.20,
    west: 104.15
};

let leafletLoader = null;
let locationValid = false;
let selectedLocation = null;
let locationRequestId = 0;
let addressGeocodeRequestId = 0;
let addressGeocodeTimer = null;
let addressSuggestTimer = null;
let suppressAddressGeocode = false;
const ADDRESS_GEOCODE_DELAY = 1000;
const ADDRESS_SUGGEST_DELAY = 600;

/* Tidak ada tombol submit di halaman lokasi, tetapi fungsi ini
   dipertahankan agar alur lama tetap aman. */
function checkSubmitEnabled() {}

function setGeoStatus(message, type = "normal") {
    if (geoStatusText) geoStatusText.textContent = message;
    if (geoDot) {
        geoDot.classList.remove("success", "error", "loading");
        if (type === "success") geoDot.classList.add("success");
        if (type === "error") geoDot.classList.add("error");
        if (type === "loading") geoDot.classList.add("loading");
    }
}

function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoader) return leafletLoader;

    leafletLoader = new Promise((resolve, reject) => {
        if (!document.getElementById("leaflet-lazy-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-lazy-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet tidak tersedia."));
        script.onerror = () => reject(new Error("Library peta gagal dimuat."));
        document.head.appendChild(script);
    });

    return leafletLoader;
}

function isInsideOganIlir(lat, lng) {
    return (
        lat >= OGAN_ILIR_BOUNDS.south &&
        lat <= OGAN_ILIR_BOUNDS.north &&
        lng >= OGAN_ILIR_BOUNDS.west &&
        lng <= OGAN_ILIR_BOUNDS.east
    );
}

function showMap() {
    const geoSection = document.getElementById("geoSection");
    if (!geoSection) return;

    geoSection.classList.add("show");
    setGeoStatus("Pilih titik lokasi tempat tinggal pada peta.", "loading");
    mapInstruction.innerHTML = "Isi jalan, desa/kelurahan, dan kecamatan di atas. Pin akan otomatis muncul di peta.";

    loadLeaflet()
        .then(() => initializeMap())
        .catch(error => {
            console.error(error);
            setGeoStatus("Peta gagal dimuat.", "error");
            showLocationError("Peta gagal dimuat. Periksa koneksi internet lalu coba lagi.");
        });
}

function initializeMap() {
    if (!window.L) return;
    if (mapInitialized && mapPick) {
        setTimeout(() => mapPick.invalidateSize(), 100);
        return;
    }

    mapPick = L.map("mapPick", {
        center: [OGAN_ILIR_CENTER.lat, OGAN_ILIR_CENTER.lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapPick);

    mapPick.on("click", event => {
        chooseMapPoint(event.latlng.lat, event.latlng.lng, "manual");
    });

    mapInitialized = true;
    setGeoStatus("Pilih salah satu cara untuk menentukan lokasi tempat tinggal.");
    mapInstruction.innerHTML = "Pilih titik pada peta atau tentukan lokasi melalui salah satu opsi di atas. Setelah pin berhasil dipilih, isi detail alamat secara manual.";
    setTimeout(() => mapPick.invalidateSize(), 150);
}

function scheduleAddressGeocode() {
    if (suppressAddressGeocode) return;
    clearTimeout(addressGeocodeTimer);
    addressGeocodeTimer = setTimeout(() => syncPinFromAddress(), ADDRESS_GEOCODE_DELAY);
}

function scheduleAddressSuggest() {
    clearTimeout(addressSuggestTimer);
    addressSuggestTimer = setTimeout(() => fetchAddressSuggestions(), ADDRESS_SUGGEST_DELAY);
}

function canGeocodeFromFields() {
    const alamat = fAlamat?.value.trim() || "";
    const desa = fDesa?.value.trim() || "";
    const kecamatan = fKecamatan?.value.trim() || "";
    return alamat.length >= 5 && (desa.length >= 2 || kecamatan.length >= 2);
}

function buildAddressQuery() {
    return [
        fAlamat?.value.trim(),
        fRt?.value.trim() ? `RT ${fRt.value.trim()}` : "",
        fRw?.value.trim() ? `RW ${fRw.value.trim()}` : "",
        fDesa?.value.trim(),
        fKecamatan?.value.trim(),
        fKabupaten?.value.trim() || "Ogan Ilir",
        "Sumatera Selatan",
        "Indonesia"
    ].filter(Boolean).join(", ");
}

function buildSuggestQuery() {
    const parts = [
        fAlamat?.value.trim(),
        fKecamatan?.value.trim(),
        fKabupaten?.value.trim() || "Ogan Ilir",
        "Sumatera Selatan",
        "Indonesia"
    ].filter(Boolean);
    return parts.join(", ");
}

function updateLocationDetailFromForm(lat, lng) {
    // IMPORTANT:
    // The summary card is a mirror of the MANUAL FORM.
    // Nominatim/search results are never used to populate these fields.
    const nama = fNamaTempat?.value.trim() || "";
    const alamat = fAlamat?.value.trim() || "";
    const rt = fRt?.value.trim() || "";
    const rw = fRw?.value.trim() || "";
    const desa = fDesa?.value.trim() || "";
    const kecamatan = fKecamatan?.value.trim() || "";
    const kabupaten = fKabupaten?.value.trim() || "Ogan Ilir";
    const kodePos = fKodePos?.value.trim() || "";

    selectedLocationName.textContent = nama || "Belum diisi";

    // Build the displayed full address ONLY from values typed into the form.
    const addressParts = [];
    if (alamat) addressParts.push(alamat);

    const rtRw = [
        rt ? `RT ${rt}` : "",
        rw ? `RW ${rw}` : ""
    ].filter(Boolean).join(" / ");
    if (rtRw) addressParts.push(rtRw);

    if (desa) addressParts.push(desa);
    if (kecamatan) addressParts.push(kecamatan);
    if (kabupaten) addressParts.push(kabupaten);
    if (kodePos) addressParts.push(kodePos);

    const displayAddress = addressParts.length
        ? addressParts.join(", ")
        : "Belum diisi";

    // Alamat menjadi link Google Maps yang dibentuk dinamis dari
    // koordinat geotag aktual. Tidak ada koordinat statis/hard-code.
    const numericLat = Number(lat);
    const numericLng = Number(lng);

    if (
        selectedFullAddress &&
        Number.isFinite(numericLat) &&
        Number.isFinite(numericLng)
    ) {
        const mapsUrl =
            `https://www.google.com/maps?q=${encodeURIComponent(
                `${numericLat},${numericLng}`
            )}`;

        selectedFullAddress.innerHTML =
            `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="google-maps-address-link">${escapeHtml(displayAddress)}</a>`;
    } else if (selectedFullAddress) {
        selectedFullAddress.textContent = displayAddress;
    }

    coordDesa.textContent = desa || "—";
    coordKec.textContent = kecamatan || "—";
    coordKabupaten.textContent = kabupaten || "—";
    coordKodePos.textContent = kodePos || "—";

    // ONLY this value comes from the geotag/search/GPS.
    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
        selectedCoordinates.textContent =
            `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
    }
}

function hideAddressSuggestions() {
    if (!addressSuggestions) return;
    addressSuggestions.innerHTML = "";
    addressSuggestions.classList.remove("show");
}

function renderAddressSuggestions(results) {
    if (!addressSuggestions) return;
    addressSuggestions.innerHTML = "";

    if (!results.length) {
        hideAddressSuggestions();
        return;
    }

    results.forEach(result => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "location-result-item";
        button.innerHTML = `<strong>${escapeHtml(result.name || result.address?.road || "Alamat")}</strong><span>${escapeHtml(result.display_name || "")}</span>`;
        button.addEventListener("click", () => applyAddressSuggestion(result));
        addressSuggestions.appendChild(button);
    });

    addressSuggestions.classList.add("show");
}

function applyAddressSuggestion(result) {
    suppressAddressGeocode = true;
    hideAddressSuggestions();

    const address = result?.address || {};
    const road = getAddressComponent(address, ["road", "pedestrian", "footway"]);
    const houseNumber = address.house_number || "";
    if (road || houseNumber) {
        fAlamat.value = [road, houseNumber].filter(Boolean).join(" ");
    }

    const village = getAddressComponent(address, ["village", "suburb", "town", "municipality"]);
    if (village) fDesa.value = village;

    const district = getAddressComponent(address, ["county", "city_district", "district"]);
    if (district) fKecamatan.value = district;

    fKabupaten.value = "Ogan Ilir";
    if (address.postcode) fKodePos.value = address.postcode;

    suppressAddressGeocode = false;
    placePinFromGeocode(Number(result.lat), Number(result.lon), result);
}

async function fetchAddressSuggestions() {
    const query = buildSuggestQuery();
    if (!fAlamat?.value.trim() || fAlamat.value.trim().length < 3) {
        hideAddressSuggestions();
        return;
    }

    try {
        const params = new URLSearchParams({
            format: "jsonv2",
            addressdetails: "1",
            limit: "5",
            countrycodes: "id",
            q: query
        });

        const results = await nominatimFetch(`https://nominatim.openstreetmap.org/search?${params}`);
        const filtered = results.filter(isOganIlirResult);
        renderAddressSuggestions(filtered);
    } catch (error) {
        console.error(error);
        hideAddressSuggestions();
    }
}

async function syncPinFromAddress() {
    if (!canGeocodeFromFields()) return;

    if (!mapPick) {
        try {
            await loadLeaflet();
            initializeMap();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const requestId = ++addressGeocodeRequestId;
    clearLocationError();
    setGeoStatus("Menyesuaikan pin ke alamat...", "loading");

    try {
        const params = new URLSearchParams({
            format: "jsonv2",
            addressdetails: "1",
            limit: "5",
            countrycodes: "id",
            q: buildAddressQuery()
        });

        const results = await nominatimFetch(`https://nominatim.openstreetmap.org/search?${params}`);
        if (requestId !== addressGeocodeRequestId) return;

        const filtered = results.filter(isOganIlirResult);
        if (!filtered.length) {
            locationValid = false;
            selectedLatLng = null;
            setGeoStatus("Alamat belum ditemukan. Periksa isian atau geser pin manual.", "error");
            return;
        }

        const best = filtered[0];
        placePinFromGeocode(Number(best.lat), Number(best.lon), best);
    } catch (error) {
        console.error(error);
        if (requestId === addressGeocodeRequestId) {
            setGeoStatus("Gagal menyesuaikan pin. Coba lagi.", "error");
        }
    }
}

function placePinFromGeocode(lat, lng, result) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

    if (!isInsideOganIlir(lat, lng)) {
        locationValid = false;
        selectedLatLng = null;
        removeMarker();
        showLocationError("Alamat berada di luar wilayah Kabupaten Ogan Ilir.");
        return false;
    }

    placeMarker(lat, lng);
    selectedLatLng = { lat, lng };
    locationValid = true;
    selectedLocation = result;
    updateLocationDetailFromForm(lat, lng);
    locationConfirmed?.classList.add("show");
    setGeoStatus("Pin sudah disesuaikan ke alamat. Geser jika perlu.", "success");
    mapInstruction.innerHTML = "Pin sudah ditandai sesuai alamat. <strong>Geser pin</strong> jika posisi belum tepat.";
    return true;
}

function onAddressFieldInput(field) {
    // Address fields are manual-only after geotagging.
    // They do not move or overwrite the geotag coordinate.
    return;
}

currentLocationBtn?.addEventListener("click", getCurrentLocation);

async function nominatimFetch(url) {
    const response = await fetch(url, {
        headers: { "Accept-Language": "id" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

function showLocationError(message) {
    if (!errAddressSearch) return;
    errAddressSearch.textContent = message;
    errAddressSearch.classList.add("show");
    setGeoStatus(message, "error");
}

function clearLocationError() {
    if (errAddressSearch) {
        errAddressSearch.textContent = "";
        errAddressSearch.classList.remove("show");
    }
}

function showAddressError(message) {
    showLocationError(message);
}

function isOganIlirResult(result) {
    const text = `${result.display_name || ""} ${JSON.stringify(result.address || {})}`.toLowerCase();
    return text.includes("ogan ilir") || text.includes("oganilir");
}

async function geocodeAddress() {
    await syncPinFromAddress();
}

function getAddressComponent(address, keys) {
    for (const key of keys) {
        if (address?.[key]) return address[key];
    }
    return "";
}

function applyReverseAddress(result, options = {}) {
    const { overwrite = true } = options;
    const address = result?.address || {};
    const road = getAddressComponent(address, ["road", "pedestrian", "footway"]);
    const houseNumber = address.house_number || "";
    const village = getAddressComponent(address, ["village", "suburb", "town", "municipality"]);
    const district = getAddressComponent(address, ["county", "city_district", "district"]);
    const postcode = address.postcode || "";

    suppressAddressGeocode = true;
    if (overwrite || !(fAlamat?.value.trim())) {
        if (road || houseNumber) fAlamat.value = [road, houseNumber].filter(Boolean).join(" ");
    }
    if (overwrite || !(fDesa?.value.trim())) {
        if (village) fDesa.value = village;
    }
    if (overwrite || !(fKecamatan?.value.trim())) {
        if (district) fKecamatan.value = district;
    }
    fKabupaten.value = "Ogan Ilir";
    if (overwrite || !(fKodePos?.value.trim())) {
        if (postcode) fKodePos.value = postcode;
    }
    suppressAddressGeocode = false;

    selectedLocation = result;
    selectedLocationName.textContent = fNamaTempat?.value.trim() || result.name || "Lokasi terpilih";
    selectedFullAddress.textContent = buildAddressQuery() || result.display_name || "—";
    coordDesa.textContent = fDesa.value.trim() || "—";
    coordKec.textContent = fKecamatan.value.trim() || "—";
    coordKabupaten.textContent = "Ogan Ilir";
    coordKodePos.textContent = fKodePos.value.trim() || "—";
    selectedCoordinates.textContent = `${Number(result.lat).toFixed(6)}, ${Number(result.lon).toFixed(6)}`;

    locationConfirmed?.classList.add("show");
}

async function chooseMapPoint(lat, lng, source = "manual", geocodeResult = null) {
    clearLocationError();

    const point = {
        lat: Number(lat),
        lng: Number(lng)
    };

    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
        showLocationError("Koordinat lokasi tidak valid.");
        return false;
    }

    // Keep the existing Ogan Ilir restriction.
    if (!isInsideOganIlir(point.lat, point.lng)) {
        locationValid = false;
        selectedLatLng = null;
        removeMarker();
        showLocationError("Titik yang dipilih berada di luar wilayah Kabupaten Ogan Ilir.");
        return false;
    }

    const requestId = ++locationRequestId;

    locationValid = false;
    selectedLatLng = null;

    placeMarker(point.lat, point.lng);
    setGeoStatus("Memeriksa titik lokasi...", "loading");

    try {
        // For both GPS and search, verify the coordinate belongs to Ogan Ilir.
        const result = geocodeResult || await reverseGeocode(point.lat, point.lng);

        if (requestId !== locationRequestId) return false;

        if (!result || !isOganIlirResult(result)) {
            locationValid = false;
            selectedLatLng = null;
            removeMarker();
            showLocationError("Titik tidak dapat diverifikasi sebagai wilayah Kabupaten Ogan Ilir.");
            return false;
        }

        // IMPORTANT:
        // Do NOT call applyReverseAddress().
        // The geotag only establishes the coordinate.
        // The user must enter all address details manually.
        selectedLatLng = point;
        locationValid = true;

        if (selectedCoordinates) {
            selectedCoordinates.textContent =
                `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
        }

        const detail = document.getElementById("locationAfterTag");
        if (detail) detail.classList.remove("hidden");

        const statusId = source === "search"
            ? "searchLocationStatus"
            : "gpsFirstStatus";

        const status = document.getElementById(statusId);
        if (status) {
            status.textContent =
                "✓ Titik berhasil ditentukan. Silakan isi detail alamat secara manual.";
        }

        setGeoStatus("Titik lokasi berhasil dipilih.", "success");
        mapInstruction.innerHTML =
            "Pin sudah ditandai sebagai geotag. Isi semua detail alamat secara manual.";

        locationConfirmed?.classList.add("show");

        return true;
    } catch (error) {
        console.error(error);
        locationValid = false;
        selectedLatLng = null;
        removeMarker();
        showLocationError("Titik lokasi tidak dapat diverifikasi. Coba lagi.");
        return false;
    }
}

async function reverseGeocode(lat, lng) {
    const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        lat: String(lat),
        lon: String(lng),
        zoom: "18"
    });
    return nominatimFetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
}

function placeMarker(lat, lng) {
    if (!mapPick || !window.L) return;
    if (pickMarker) pickMarker.setLatLng([lat, lng]);
    else {
        pickMarker = L.marker([lat, lng], { draggable: true }).addTo(mapPick);
        pickMarker.on("dragend", event => {
            const position = event.target.getLatLng();
            chooseMapPoint(position.lat, position.lng, "drag");
        });
    }
    mapPick.setView([lat, lng], Math.max(mapPick.getZoom(), 16));
}

function removeMarker() {
    if (pickMarker && mapPick) {
        mapPick.removeLayer(pickMarker);
    }
    pickMarker = null;
}

function resetLocationDetail() {
    document.getElementById("locationAfterTag")?.classList.add("hidden");
    document.getElementById("gpsFirstStatus")?.replaceChildren();
    document.getElementById("searchLocationStatus")?.replaceChildren();

    selectedLocationName.textContent = "Belum dipilih";
    selectedFullAddress.textContent = "—";
    coordDesa.textContent = "—";
    coordKec.textContent = "—";
    coordKabupaten.textContent = "—";
    coordKodePos.textContent = "—";
    selectedCoordinates.textContent = "—";
    locationConfirmed?.classList.remove("show");
}


function switchLocationMode(mode) {
    console.log("[Pojok Sensus] switchLocationMode:", mode);
    const gps = mode === "gps";

    document.getElementById("modeGpsBtn")?.classList.toggle("active", gps);
    document.getElementById("modeSearchBtn")?.classList.toggle("active", !gps);

    document.getElementById("gpsModePanel")?.classList.toggle("hidden", !gps);
    document.getElementById("searchModePanel")?.classList.toggle("hidden", gps);

    document.getElementById("locationAfterTag")?.classList.add("hidden");

    const status = document.getElementById(gps ? "gpsFirstStatus" : "searchLocationStatus");
    if (status) {
        status.textContent = "";
    }

    setGeoStatus(
        gps ? "Gunakan GPS perangkat untuk menentukan titik."
            : "Cari nama daerah atau jalan untuk menentukan titik.",
        "normal"
    );
}

async function searchLocationByName() {
    const input = document.getElementById("locationSearchInput");
    const status = document.getElementById("searchLocationStatus");
    const resultsBox = document.getElementById("locationSearchResults");
    const rawQuery = (input?.value || "").trim();

    if (!rawQuery) {
        if (status) status.textContent = "Masukkan nama daerah atau nama jalan.";
        input?.focus();
        return;
    }

    try {
        await loadLeaflet();
        initializeMap();

        if (status) status.textContent = `Mencari "${rawQuery}"...`;
        if (resultsBox) resultsBox.innerHTML = "";
        clearLocationError();

        // IMPORTANT: keep the original Pojok Sensus search engine:
        // Leaflet + OpenStreetMap + Nominatim. The free-text search is sent
        // to Nominatim FIRST, then we add Ogan Ilir context as fallbacks.
        // This prevents generic roads/areas such as "Jalan Nusantara" from
        // disappearing simply because Nominatim does not understand the
        // appended administrative text.
        const queryCandidates = [
            rawQuery,
            `${rawQuery}, Ogan Ilir, Sumatera Selatan, Indonesia`,
            `${rawQuery}, Indralaya, Ogan Ilir, Sumatera Selatan, Indonesia`,
            `${rawQuery}, Sumatera Selatan, Indonesia`
        ];

        const allResults = [];
        const seen = new Set();

        for (const q of queryCandidates) {
            const params = new URLSearchParams({
                format: "jsonv2",
                addressdetails: "1",
                limit: "10",
                countrycodes: "id",
                q
            });

            // Bias toward Ogan Ilir without making the search bounded.
            params.set(
                "viewbox",
                `${OGAN_ILIR_BOUNDS.west},${OGAN_ILIR_BOUNDS.north},${OGAN_ILIR_BOUNDS.east},${OGAN_ILIR_BOUNDS.south}`
            );
            params.set("dedupe", "1");

            const results = await nominatimFetch(
                `https://nominatim.openstreetmap.org/search?${params}`
            );

            if (!Array.isArray(results)) continue;

            for (const result of results) {
                const key = `${result.lat}|${result.lon}|${result.display_name || ""}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    allResults.push(result);
                }
            }

            // Once the first search has returned an Ogan Ilir result, prefer
            // those results and avoid unnecessary Nominatim requests.
            if (allResults.some(isSearchResultInOganIlir)) break;
        }

        if (!allResults.length) {
            if (status) {
                status.textContent =
                    `"${rawQuery}" tidak ditemukan. Coba nama jalan + kecamatan, misalnya "Jalan Nusantara, Indralaya".`;
            }
            return;
        }

        // Put Ogan Ilir matches first, but keep other Nominatim results as a
        // fallback so the user can actually see what OpenStreetMap found.
        const rankedResults = [...allResults].sort((a, b) => {
            const aLocal = isSearchResultInOganIlir(a) ? 0 : 1;
            const bLocal = isSearchResultInOganIlir(b) ? 0 : 1;
            return aLocal - bLocal;
        });

        if (status) {
            status.textContent =
                `Ditemukan ${rankedResults.length} hasil. Pilih lokasi yang paling sesuai.`;
        }

        rankedResults.slice(0, 8).forEach(result => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "location-search-result";

            const isLocal = isSearchResultInOganIlir(result);
            const title =
                result.name ||
                result.address?.road ||
                result.address?.pedestrian ||
                result.address?.village ||
                "Lokasi";

            button.innerHTML =
                `<strong>${escapeHtml(title)}</strong>` +
                `<small>${escapeHtml(result.display_name || "")}</small>` +
                (isLocal ? `<em>✓ Dalam area Ogan Ilir</em>` : `<em>Hasil OpenStreetMap</em>`);

            button.addEventListener("click", async () => {
                const lat = Number(result.lat);
                const lng = Number(result.lon);

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                    if (status) status.textContent = "Koordinat hasil pencarian tidak valid.";
                    return;
                }

                // Keep the original Ogan Ilir geotag validation in chooseMapPoint.
                // A non-local fallback is displayed so search never looks broken,
                // but it will be rejected if it is outside the census area.
                const ok = await chooseMapPoint(lat, lng, "search", result);

                if (ok) {
                    mapPick.setView([lat, lng], 17);
                    if (status) {
                        status.textContent =
                            "✓ Lokasi berhasil ditandai. Isi detail alamat secara manual.";
                    }
                    if (resultsBox) resultsBox.innerHTML = "";
                }
            });

            resultsBox?.appendChild(button);
        });
    } catch (error) {
        console.error("Search location error:", error);
        if (status) {
            status.textContent =
                "Gagal menghubungi OpenStreetMap/Nominatim. Pastikan internet aktif lalu coba lagi.";
        }
    }
}

function isSearchResultInOganIlir(result) {
    if (!result) return false;

    const lat = Number(result.lat);
    const lon = Number(result.lon);

    // Primary check: original Pojok Sensus bounding box.
    const insideBounds = Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        isInsideOganIlir(lat, lon);

    if (insideBounds) return true;

    // Secondary check: preserve the original textual Ogan Ilir validation.
    return isOganIlirResult(result);
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showLocationError("Browser tidak mendukung fitur lokasi.");
        return;
    }

    if (!mapPick) initializeMap();
    if (!mapPick) return;

    hideAddressSuggestions();

    currentLocationBtn.disabled = true;

    const status = document.getElementById("gpsFirstStatus");
    if (status) status.textContent = "Mengambil lokasi perangkat...";

    setGeoStatus("Mengambil lokasi perangkat...", "loading");

    navigator.geolocation.getCurrentPosition(
        async position => {
            const lat = Number(position.coords.latitude);
            const lng = Number(position.coords.longitude);
            const accuracy = Number(position.coords.accuracy || 0);

            mapPick.setView([lat, lng], 17);

            const success = await chooseMapPoint(lat, lng, "gps");

            currentLocationBtn.disabled = false;

            if (success) {
                currentLocationBtn.querySelector(".method-content strong").textContent =
                    "✓ Lokasi Sudah Diambil";

                if (status) {
                    status.textContent =
                        `✓ GPS berhasil — akurasi ±${Math.round(accuracy)} m. Isi detail alamat di bawah.`;
                }
            } else {
                currentLocationBtn.querySelector(".method-content strong").textContent =
                    "Gunakan Lokasi Saya";
            }
        },
        error => {
            currentLocationBtn.disabled = false;

            let message = "Lokasi perangkat tidak dapat diperoleh.";

            if (error.code === error.PERMISSION_DENIED) {
                message = "Izin lokasi ditolak. Izinkan akses lokasi browser lalu coba lagi.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message = "Lokasi perangkat tidak tersedia.";
            } else if (error.code === error.TIMEOUT) {
                message = "Pengambilan GPS terlalu lama. Coba lagi.";
            }

            const status = document.getElementById("gpsFirstStatus");
            if (status) status.textContent = "⚠️ " + message;

            showLocationError(message);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }
    );
}

function validateLocationStep() {
    let valid = true;

    if (!selectedResidence) {
        showError("errResidence", true);
        valid = false;
    } else {
        showError("errResidence", false);
    }

    const fields = [
        [fNamaTempat, "errNamaTempat", value => value.length >= 2],
        [fAlamat, "errAlamat", value => value.length >= 5],

        // RT dan RW TIDAK WAJIB
        // Kalau kosong = valid
        // Kalau diisi = harus 1–3 digit
        [fRt, "errRt", value => value === "" || /^\d{1,3}$/.test(value)],
        [fRw, "errRw", value => value === "" || /^\d{1,3}$/.test(value)],

        [fDesa, "errDesa", value => value.length >= 2],
        [fKecamatan, "errKecamatan", value => value.length >= 2],
        [fKodePos, "errKodePos", value => value === "" || /^\d{5}$/.test(value)]
    ];

    fields.forEach(([field, errorId, test]) => {
        if (!field) return;

        const value = field.value.trim();
        const fieldValid = test(value);

        setFieldState(field, fieldValid);
        showError(errorId, !fieldValid);

        if (!fieldValid) {
            valid = false;
        }
    });

    const kabupatenValid =
        (fKabupaten?.value || "").trim().toLowerCase() === "ogan ilir";

    setFieldState(fKabupaten, kabupatenValid);

    if (!kabupatenValid) {
        valid = false;
    }

    if (!selectedLatLng || !locationValid) {
        showLocationError(
            "Pilih dan verifikasi titik lokasi tempat tinggal terlebih dahulu."
        );
        valid = false;
    }

    return valid;
}

[fAlamat, fDesa, fKecamatan, fRt, fRw, fKodePos].forEach(field => {
    field?.addEventListener("input", () => {
        // Keep the existing geotag fixed. Typing the manual address
        // must NOT move or replace the selected GPS/search coordinate.
        onAddressFieldInput(field);

        if (selectedLatLng) {
            updateLocationDetailFromForm(selectedLatLng.lat, selectedLatLng.lng);
        }
    });

    field?.addEventListener("change", () => {
        if (selectedLatLng) {
            updateLocationDetailFromForm(selectedLatLng.lat, selectedLatLng.lng);
        }
    });
});

fNamaTempat?.addEventListener("input", () => {
    if (selectedLatLng) {
        updateLocationDetailFromForm(selectedLatLng.lat, selectedLatLng.lng);
    }
});

document.addEventListener("click", event => {
    if (!addressSuggestions?.contains(event.target) && event.target !== fAlamat) {
        hideAddressSuggestions();
    }
});

// =========================================================
// SIMPAN TAHAP 1–3 KE DATABASE SEBELUM MASUK KUESIONER
// =========================================================
async function saveProfileBeforeQuestionnaire() {
    if (!selectedLatLng) throw new Error("Lokasi belum dipilih.");

    const main = {
        nim: fNim?.value?.trim() || "",
        nama: fNama?.value?.trim() || "",
        hp: fHp?.value?.trim() || "",
        angkatan: fAngkatan?.value || "",
        fakultas: fFakultas?.selectedOptions?.[0]?.textContent?.trim() || "",
        programStudi: fProdi?.selectedOptions?.[0]?.textContent?.trim() || fProdi?.value || "",
        tempatTinggal: selectedResidence || "",
        namaTempat: fNamaTempat?.value?.trim() || "",
        alamat: fAlamat?.value?.trim() || "",
        rt: fRt?.value?.trim() || "",
        rw: fRw?.value?.trim() || "",
        desa: fDesa?.value?.trim() || "",
        kecamatan: fKecamatan?.value?.trim() || "",
        kabupaten: "Ogan Ilir",
        kodePos: fKodePos?.value?.trim() || "",
        latitude: selectedLatLng.lat,
        longitude: selectedLatLng.lng,
        fullAddress: selectedFullAddress?.textContent?.trim() || ""
    };

    const draft = (() => {
        try { return JSON.parse(localStorage.getItem("sensusEkonomiMahasiswaDraft")) || {}; }
        catch { return {}; }
    })();

    const fd = new FormData();
    Object.entries(main).forEach(([key, value]) => fd.append(key, value ?? ""));

    const response = await fetch("api/save_profile.php", { method: "POST", body: fd });
    const result = await response.json().catch(() => ({ success: false, message: "Respons server tidak valid." }));
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Data tahap 1–3 gagal disimpan.");
    }

    draft.respondentId = result.respondent_id;
    draft.respondentUuid = result.respondent_uuid;
    draft.profile = main;
    draft.profileSavedAt = new Date().toISOString();
    draft.profileStatus = result.status || "draft";
    try { localStorage.setItem("sensusEkonomiMahasiswaDraft", JSON.stringify(draft)); } catch {}

    return result;
}

// FORM 2 → FORM 3. Data tahap 1–3 masuk MySQL terlebih dahulu.
if (nextLocationBtn) {
    nextLocationBtn.addEventListener("click", async function () {
        if (selectedLatLng && locationValid) {
            updateLocationDetailFromForm(selectedLatLng.lat, selectedLatLng.lng);
        }

        if (!validateLocationStep()) {
            const firstInvalid = document.querySelector("#stepLocation .invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
                firstInvalid.focus();
            }
            return;
        }

        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = "Menyimpan data…";

        try {
            await saveProfileBeforeQuestionnaire();
            stepLocation.classList.add("hidden");
            stepQuestionnaire.classList.remove("hidden");
            // Pastikan isi kuesioner langsung tampil, dimulai dari tahap 1.
            window.openQuestionnaire?.();
            syncProgress(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error(error);
            alert(error.message || "Data tahap 1–3 gagal disimpan.");
        } finally {
            this.disabled = false;
            this.innerHTML = originalText;
        }
    });
}

// FORM 3 → FORM 2.
if (questionBackBtn) {
    questionBackBtn.addEventListener("click", function () {
        stepQuestionnaire.classList.add("hidden");
        stepLocation.classList.remove("hidden");
        syncProgress(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// SUBMIT FORM.
if (submitBtn) {
    submitBtn.addEventListener("click", function () {
        const selectedQuestion = document.querySelector('input[name="q1"]:checked');
        if (!selectedQuestion) {
            questionError?.classList.add("show");
            document.querySelector('.answer-option')?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        questionError?.classList.remove("show");

        if (!validateLocationStep()) {
            stepQuestionnaire.classList.add("hidden");
            stepLocation.classList.remove("hidden");
            syncProgress(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const kecamatan = { nama: fKecamatan.value.trim(), petugas: "—" };
        const entry = {
            nim: fNim.value.trim(),
            nama: fNama.value.trim(),
            hp: fHp.value.trim(),
            angkatan: fAngkatan.value,
            fakultas: fFakultas.options[fFakultas.selectedIndex].text,
            programStudi: fProdi.value,
            tempatTinggal: selectedResidence,
            namaTempat: fNamaTempat?.value.trim() || "",
            alamat: fAlamat?.value.trim() || "",
            rt: fRt?.value.trim() || "",
            rw: fRw?.value.trim() || "",
            desa: fDesa?.value.trim() || "",
            kecamatan: fKecamatan?.value.trim() || kecamatan.nama,
            kabupaten: "Ogan Ilir",
            kodePos: fKodePos?.value.trim() || "",
            petugas: kecamatan.petugas,
            latitude: selectedLatLng.lat,
            longitude: selectedLatLng.lng,
            fullAddress: selectedFullAddress?.textContent || ""
        };

        showConfirmation(entry);
    });
}

function showConfirmation(entry) {
    stepLocation.classList.add("hidden");
    stepQuestionnaire.classList.add("hidden");
    document.querySelector(".progress-container")?.classList.add("hidden");
    confirmBox?.classList.remove("hidden");

    const detail = document.getElementById("confirmDetail");
    if (detail) {
        detail.innerHTML = `
            <div class="confirmation-row"><span>Nama</span><span>${escapeHtml(entry.nama)}</span></div>
            <div class="confirmation-row"><span>NIM</span><span>${escapeHtml(entry.nim)}</span></div>
            <div class="confirmation-row"><span>Angkatan</span><span>${escapeHtml(entry.angkatan)}</span></div>
            <div class="confirmation-row"><span>Fakultas</span><span>${escapeHtml(entry.fakultas)}</span></div>
            <div class="confirmation-row"><span>Program Studi</span><span>${escapeHtml(entry.programStudi)}</span></div>
            <div class="confirmation-row"><span>Tempat Tinggal</span><span>${escapeHtml(entry.tempatTinggal)}</span></div>
            <div class="confirmation-row"><span>Nama Tempat</span><span>${escapeHtml(entry.namaTempat || "—")}</span></div>
            <div class="confirmation-row"><span>Alamat</span><span>${escapeHtml(entry.fullAddress || entry.alamat || "—")}</span></div>
            <div class="confirmation-row"><span>Desa / Kelurahan</span><span>${escapeHtml(entry.desa || "—")}</span></div>
            <div class="confirmation-row"><span>Kecamatan</span><span>${escapeHtml(entry.kecamatan || "—")}</span></div>
            <div class="confirmation-row"><span>Kabupaten</span><span>Ogan Ilir</span></div>
            <div class="confirmation-row"><span>Koordinat</span><span>${entry.latitude.toFixed(6)}, ${entry.longitude.toFixed(6)}</span></div>
        `;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (resetBtn) {
    resetBtn.addEventListener("click", function () {
        // Mulai responden baru: buang draft, id_key, dan jawaban responden sebelumnya.
        try { localStorage.removeItem("sensusEkonomiMahasiswaDraft"); } catch {}

        [fNim, fAngkatan, fNama, fHp, fNamaTempat, fAlamat, fRt, fRw, fDesa, fKecamatan, fKodePos].forEach(field => {
            if (field) field.value = "";
        });
        if (fKabupaten) fKabupaten.value = "Ogan Ilir";
        fFakultas.value = "";
        fProdi.innerHTML = '<option value="">Pilih fakultas terlebih dahulu</option>';
        fProdi.disabled = true;

        document.querySelectorAll("input, select").forEach(element => element.classList.remove("valid", "invalid"));
        document.querySelectorAll(".err-msg, .error-message").forEach(error => error.classList.remove("show"));
        document.querySelectorAll(".residence-option").forEach(option => option.classList.remove("selected"));
        document.querySelectorAll('input[name="q1"]').forEach(input => input.checked = false);
        questionError?.classList.remove("show");

        selectedResidence = null;
        selectedLatLng = null;
        selectedLocation = null;
        locationValid = false;
        clearTimeout(addressGeocodeTimer);
        clearTimeout(addressSuggestTimer);
        removeMarker();
        resetLocationDetail();
        hideAddressSuggestions();

        document.getElementById("geoSection")?.classList.remove("show");
        geoStatusText.textContent = "Pilih titik lokasi tempat tinggal pada peta.";

        confirmBox?.classList.add("hidden");
        document.querySelector(".progress-container")?.classList.remove("hidden");
        stepQuestionnaire.classList.add("hidden");
        stepLocation.classList.add("hidden");
        stepAcademic.classList.remove("hidden");
        progress1?.classList.add("active");
        progress1?.classList.remove("completed");
        progress2?.classList.remove("active", "completed");
        progress3?.classList.remove("active", "completed");
        progress4?.classList.remove("active", "completed");
        syncProgress(2);
        checkSubmitEnabled();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

console.log("Website survei berhasil dimuat dengan sistem alamat + pin.");

    // Expose location handlers globally for the inline HTML buttons.
    window.switchLocationMode = switchLocationMode;
    window.searchLocationByName = searchLocationByName;
    window.getCurrentLocation = getCurrentLocation;

});


/* =========================================================
   HALAMAN DEPAN / PERNYATAAN KESEDIAAN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const welcomePage = document.getElementById("welcomePage");
    const startFormBtn = document.getElementById("startFormBtn");
    const consentYes = document.getElementById("consentYes");
    const consentError = document.getElementById("consentError");
    const appContent = document.querySelectorAll(".app-content");

    if (!welcomePage || !startFormBtn || !consentYes) {
        return;
    }

    appContent.forEach(function (element) {
        element.classList.add("hidden");
    });

    function setWelcomeProgress() {
        document.querySelectorAll("[id^=welcomeProgress]").forEach(function (item) {
            item.classList.remove("active", "completed");
        });
        document.getElementById("welcomeProgress1")?.classList.add("active");
    }

    function setFormProgressToStep2() {
        const progressItems = [
            document.getElementById("progress1"),
            document.getElementById("progress2"),
            document.getElementById("progress3"),
            document.getElementById("progress4")
        ];

        progressItems.forEach(function (item, index) {
            if (!item) return;
            item.classList.remove("active", "completed");
            if (index === 0) item.classList.add("completed");
            if (index === 1) item.classList.add("active");
        });
    }

    function updateStartButton() {
        startFormBtn.disabled = !consentYes.checked;
        consentError?.classList.remove("show");
    }

    consentYes.addEventListener("change", updateStartButton);

    startFormBtn.addEventListener("click", function () {
        if (!consentYes.checked) {
            consentError?.classList.add("show");
            return;
        }

        welcomePage.classList.add("hidden");

        appContent.forEach(function (element) {
            element.classList.remove("hidden");
        });

        document.getElementById("stepAcademic")?.classList.remove("hidden");
        document.getElementById("stepLocation")?.classList.add("hidden");
        document.getElementById("stepQuestionnaire")?.classList.add("hidden");
        document.getElementById("confirmBox")?.classList.add("hidden");
        document.querySelector(".progress-container")?.classList.remove("hidden");

        setFormProgressToStep2();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    setWelcomeProgress();
    updateStartButton();
});


document.addEventListener("click", function (event) {
    const searchButton = event.target.closest?.("#locationSearchBtn");
    if (searchButton && typeof window.searchLocationByName === "function") {
        event.preventDefault();
        window.searchLocationByName();
    }
});
