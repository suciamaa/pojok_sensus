document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================================
    // STORAGE
    // =========================================================

    const BASE_STORAGE_KEY = "sensusEkonomiMahasiswaDraft";

    // NIM yang sedang aktif mengisi kuesioner
    let activeNIM = "";

    function getCurrentNIM() {
        const nim =
            activeNIM ||
            document.getElementById("fNim")?.value?.trim() ||
            document.getElementById("nim")?.value?.trim() ||
            "";

        return String(nim).trim();
    }

    function getStorageKey(nim = getCurrentNIM()) {
        const cleanNim = String(nim || "").trim();

        // Jangan pernah menggunakan storage global.
        // Draft harus selalu berdasarkan NIM.
        if (!cleanNim) {
            return null;
        }

        return `${BASE_STORAGE_KEY}_${cleanNim}`;
    }

    // =========================================================
    // ELEMENT
    // =========================================================

    const form = document.getElementById("form3");

    if (!form) return;

    // =========================================================
    // BIRTH DATE MAXIMUM / VALIDATION
    // =========================================================

    function getTodayDateString() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function setupBirthDateValidation() {
        const birthDate = document.getElementById("tanggalLahir");
        const error = document.getElementById("tanggalLahirError");
        if (!birthDate) return;

        const validateBirthDate = () => {
            const todayString = getTodayDateString();
            birthDate.max = todayString;
            const invalid = !!birthDate.value && birthDate.value > todayString;
            birthDate.setCustomValidity(invalid ? "Tanggal lahir tidak boleh melebihi tanggal hari ini." : "");
            birthDate.classList.toggle("invalid", invalid);
            birthDate.setAttribute("aria-invalid", invalid ? "true" : "false");
            if (error) error.classList.toggle("show", invalid);
            return !invalid;
        };

        validateBirthDate();
        birthDate.addEventListener("input", validateBirthDate);
        birthDate.addEventListener("change", validateBirthDate);
    }

    const steps = [
        ...form.querySelectorAll(".questionnaire-step")
    ];

    const progressItems = [
        ...document.querySelectorAll(
            "#stepQuestionnaire .questionnaire-progress-container [data-progress]"
        )
    ];

    const saveStatus =
        document.getElementById("saveStatus");

    let currentStep = 0;
    let saveTimer = null;
    let serverSaveTimer = null;
    let restoring = false;


    // =========================================================
    // READ DRAFT
    // =========================================================

    const readDraft = (nim = getCurrentNIM()) => {
        try {
            const key = getStorageKey(nim);

            // Kalau NIM belum diketahui,
            // jangan baca localStorage apa pun.
            if (!key) {
                return {};
            }

            const raw = localStorage.getItem(key);

            if (!raw) {
                return {};
            }

            const draft = JSON.parse(raw);

            return draft && typeof draft === "object"
                ? draft
                : {};

        } catch (e) {
            console.warn(
                "Draft tidak dapat dibaca:",
                e
            );

            return {};
        }
    };


    // =========================================================
    // WRITE DRAFT
    // =========================================================

    const writeDraft = (
        draft,
        message = "✓ Data tersimpan otomatis",
        nim = null
    ) => {

        try {

            const targetNim = String(
                nim ||
                activeNIM ||
                draft?.id_key ||
                draft?.profile?.nim ||
                getCurrentNIM() ||
                ""
            ).trim();

            if (!targetNim) {

                console.warn(
                    "NIM tidak ditemukan. Draft tidak disimpan."
                );

                return;
            }

            const key = getStorageKey(targetNim);

            if (!key) {
                console.warn(
                    "Storage key tidak valid."
                );

                return;
            }

            draft.updatedAt =
                new Date().toISOString();

            localStorage.setItem(
                key,
                JSON.stringify(draft)
            );

            if (saveStatus) {
                saveStatus.textContent =
                    message;
            }

            console.log(
                `Draft disimpan untuk NIM ${targetNim}:`,
                key
            );

        } catch (e) {

            console.warn(
                "Draft tidak dapat disimpan:",
                e
            );

            if (saveStatus) {
                saveStatus.textContent =
                    "⚠ Draft gagal disimpan";
            }
        }
    };


    // =========================================================
    // SCHEDULE SAVE
    // =========================================================

    // Kuesioner TIDAK autosave.
    // Draft hanya digunakan untuk data registrasi pada script.js.
    const scheduleSave = () => {};
    const scheduleServerSave = () => {};

    async function saveQuestionnaireToServer() {
        return;
    }


    // =========================================================
    // COLLECT FORM DATA
    // =========================================================

    function collectData() {

        const data = {};

        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(el => {

            const key =
                el.name || el.id;

            if (!key) return;

            // Field yang sedang disabled adalah conditional field yang tidak aktif.
            // Jangan ikut dikirim sebagai jawaban aktif.
            if (el.disabled) return;

            // File tidak disimpan ke localStorage
            if (el.type === "file") {
                return;
            }

            // RADIO
            if (el.type === "radio") {

                if (el.checked) {
                    data[key] = el.value;
                }

                return;
            }

            // CHECKBOX
            if (el.type === "checkbox") {

                if (!Array.isArray(data[key])) {
                    data[key] = [];
                }

                if (el.checked) {
                    data[key].push(
                        el.value
                    );
                }

                return;
            }

            // INPUT / SELECT / TEXTAREA
            data[key] = el.value;
        });

        return data;
    }


    // =========================================================
    // CLEAR QUESTIONNAIRE
    // =========================================================

    function clearQuestionnaireForm() {

        restoring = true;

        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(el => {

            // FILE
            if (el.type === "file") {
                el.value = "";
                return;
            }

            // RADIO / CHECKBOX
            if (
                el.type === "radio" ||
                el.type === "checkbox"
            ) {
                el.checked = false;
                return;
            }

            // Semua field dikosongkan.
            el.value = "";
        });


        // Hapus validation error
        form.querySelectorAll(
            ".invalid, .invalid-group"
        ).forEach(el => {

            el.classList.remove(
                "invalid",
                "invalid-group"
            );

            el.removeAttribute(
                "aria-invalid"
            );
        });


        // Reset conditional fields
        [
            "document4413_2",
            "usahaContent",
            "pendapatanPekerjaanField",
            "pendapatanUsahaField",
            "totalPendapatanLainField",
            "totalPendapatanPasifField",
            "alasanTidakNIBJawabanField",
            "usahaBranchBefore2026",
            "usahaBranch2026",
            "nibField",
            "alasanTidakNIBField",
            "statusKepemilikanLainnyaField",
            "nilaiKontrakSewaField",
            "perkiraanSewaBebasSendiriField",
            "pengeluaranListrikField",
            "keluhanKesehatanLainnyaField",
            "kkLainContainer",
            "jumlahMeteranField",
            "dayaListrikField",
            "idPelangganPLNField",
            "noMeteranListrikField"
        ].forEach(id => {

            const el =
                document.getElementById(id);

            if (el) {
                el.classList.add("hidden");
            }
        });


        restoring = false;

        updateAll();
    }


    // =========================================================
    // SAVE DRAFT
    // =========================================================

    function saveDraft(message) {
        // Sengaja tidak menyimpan jawaban kuesioner.
        // Data registrasi tetap disimpan oleh script.js.
        return;
    }


    // =========================================================
    // SHOW STEP
    // =========================================================

    function showStep(index) {

        if (!steps.length) return;

        currentStep = Math.max(
            0,
            Math.min(
                Number(index) || 0,
                steps.length - 1
            )
        );


        steps.forEach(
            (step, i) => {

                const isCurrent =
                    i === currentStep;

                step.classList.toggle(
                    "active",
                    isCurrent
                );

                step.classList.toggle(
                    "hidden",
                    !isCurrent
                );

                step.setAttribute(
                    "aria-hidden",
                    isCurrent
                        ? "false"
                        : "true"
                );

                step.style.display =
                    isCurrent
                        ? "block"
                        : "none";
            }
        );


        progressItems.forEach(
            (item, i) => {

                item.classList.toggle(
                    "active",
                    i === currentStep
                );

                item.classList.toggle(
                    "completed",
                    i < currentStep
                );

                item.setAttribute(
                    "aria-current",
                    i === currentStep
                        ? "step"
                        : "false"
                );
            }
        );


        saveDraft(
            "✓ Posisi dan data tersimpan"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // =========================================================
    // OPEN QUESTIONNAIRE
    // =========================================================

    window.openQuestionnaire =
        async function () {

            form.style.display = "block";

            form.classList.remove(
                "hidden"
            );


            // =================================================
            // 1. AMBIL NIM RESPONDEN BARU
            // =================================================

            const nim = String(
                document.getElementById("fNim")?.value ||
                document.getElementById("nim")?.value ||
                ""
            ).trim();


            if (!nim) {

                alert(
                    "NIM responden tidak ditemukan."
                );

                return;
            }


            // =================================================
            // 2. SET NIM AKTIF
            // =================================================

            activeNIM = nim;


            console.log(
                "================================="
            );

            console.log(
                "MEMBUKA KUESIONER"
            );

            console.log(
                "NIM AKTIF:",
                activeNIM
            );

            console.log(
                "STORAGE KEY:",
                getStorageKey(activeNIM)
            );

            console.log(
                "================================="
            );


            // =================================================
            // 3. KUESIONER SELALU DIMULAI KOSONG
            // =================================================
            // Data kuesioner TIDAK disimpan otomatis.
            // Yang disimpan sebagai draft hanya data registrasi
            // (tahap 1-3) melalui endpoint PHP /api/save_profile.

            clearQuestionnaireForm();

            // =================================================
            // 4. AMBIL PROFIL REGISTRASI DARI DATABASE
            // =================================================
            try {
                const response = await fetch(
                    `api/get_profile.php?nim=${encodeURIComponent(activeNIM)}&t=${Date.now()}`,
                    { cache: "no-store" }
                );

                const result = await response.json();

                if (!response.ok || !result.success || !result.data) {
                    throw new Error(
                        result.message ||
                        "Data responden tidak ditemukan."
                    );
                }

                console.log("Profil database:", result.data);

                // =================================================
                // 5. ISI IDENTITAS DARI DATA REGISTRASI
                // =================================================
                const namaInput = document.getElementById("qNama");
                if (namaInput) {
                    namaInput.value =
                        result.data.nama ||
                        result.data.nama_lengkap ||
                        "";
                    namaInput.readOnly = true;
                }

                const nimInput = document.getElementById("nim");
                if (nimInput) {
                    nimInput.value = result.data.nim || activeNIM || "";
                    nimInput.readOnly = true;
                }

                // Identitas dan alamat yang sudah ada di registrasi awal
                // ditampilkan otomatis pada Blok 1.
                const registrationMap = {
                    provinsi: "Sumatera Selatan",
                    kabupaten: result.data.kabupaten || "",
                    kecamatan: result.data.kecamatan || "",
                    desa: result.data.desa || "",
                    sls: result.data.rt ? `RT ${result.data.rt}` : "",
                    alamat: result.data.alamat || ""
                };

                Object.entries(registrationMap).forEach(([id, value]) => {
                    const input = document.getElementById(id);
                    if (!input) return;
                    input.value = value;
                    input.readOnly = true;
                });

                // Jangan restore draft kuesioner lama.
                // clearQuestionnaireForm() di atas sengaja membuat
                // seluruh jawaban kuesioner kosong setiap kali dibuka.
                currentStep = 0;
                showStep(0);
                updateAll();

            } catch (error) {
                restoring = false;

                console.error(
                    "Gagal mengambil profil berdasarkan NIM:",
                    error
                );

                alert(
                    error.message ||
                    "Data responden gagal dimuat."
                );
            }

        };


    // =========================================================
    // VISIBILITY
    // =========================================================

    function isVisible(el) {

        return !!el &&
            !el.closest(".hidden") &&
            !el.disabled &&
            el.offsetParent !== null;
    }


    // =========================================================
    // INVALID
    // =========================================================

    function setInvalid(
        el,
        invalid
    ) {

        if (!el) return;

        el.classList.toggle(
            "invalid",
            invalid
        );

        el.setAttribute(
            "aria-invalid",
            invalid
                ? "true"
                : "false"
        );
    }


    // =========================================================
    // VALIDATE STEP
    // =========================================================

    function validateStep(
        stepIndex
    ) {

        const step =
            steps[stepIndex];

        if (!step) return true;

        let valid = true;

        let firstInvalid = null;


        // =====================================================
        // FIELD WAJIB
        // =====================================================

        step.querySelectorAll(
            '[data-required="true"]'
        ).forEach(el => {

            if (
                el.type === "radio" ||
                el.type === "checkbox"
            ) {
                return;
            }

            if (!isVisible(el)) {
                return;
            }

            const value =
                String(
                    el.value ?? ""
                ).trim();


            const ok =
                value !== "";


            setInvalid(
                el,
                !ok
            );


            if (
                !ok &&
                !firstInvalid
            ) {
                firstInvalid = el;
            }


            valid =
                valid && ok;
        });


        // =====================================================
        // RADIO
        // =====================================================

        const radioNames =
            new Set();


        step.querySelectorAll(
            'input[type=radio][data-required="true"]'
        ).forEach(r => {

            radioNames.add(
                r.name
            );
        });


        radioNames.forEach(
            name => {

                const radios = [
                    ...step.querySelectorAll(
                        `input[type=radio][name="${CSS.escape(name)}"]`
                    )
                ].filter(
                    isVisible
                );


                if (!radios.length) {
                    return;
                }


                const ok =
                    radios.some(
                        r => r.checked
                    );


                const box =
                    radios[0].closest(
                        ".question-box"
                    ) ||
                    radios[0].parentElement;


                box?.classList.toggle(
                    "invalid-group",
                    !ok
                );


                if (
                    !ok &&
                    !firstInvalid
                ) {
                    firstInvalid =
                        box ||
                        radios[0];
                }


                valid =
                    valid && ok;
            }
        );


        // =====================================================
        // CHECKBOX DROPDOWN
        // =====================================================

        step.querySelectorAll(
            ".checkbox-dropdown"
        ).forEach(
            dropdown => {

                if (
                    !isVisible(
                        dropdown
                    )
                ) {
                    return;
                }


                const boxes = [
                    ...dropdown.querySelectorAll(
                        'input[type="checkbox"], input[type="radio"]'
                    )
                ];


                if (
                    !boxes.some(
                        b => b.checked
                    )
                ) {

                    dropdown.classList.add(
                        "invalid"
                    );


                    if (!firstInvalid) {
                        firstInvalid =
                            dropdown;
                    }


                    valid = false;

                } else {

                    dropdown.classList.remove(
                        "invalid"
                    );
                }
            }
        );


        // =====================================================
        // JUMLAH USAHA HARUS > 0 KETIKA MENJAWAB IYA
        // =====================================================

        step.querySelectorAll('input[id^="jumlahUsaha_"][data-required="true"]').forEach(el => {
            if (!isVisible(el)) return;

            const value = Number.parseInt(el.value, 10);
            const ok = Number.isInteger(value) && value > 0;

            setInvalid(el, !ok);

            if (!ok) {
                valid = false;
                if (!firstInvalid) firstInvalid = el;
            }
        });

        // =====================================================
        // NIB — MAKSIMAL DAN FORMAT 13 DIGIT
        // =====================================================

        const nibInput = step.querySelector("#nib");
        if (nibInput && isVisible(nibInput)) {
            const value = nibInput.value.trim();
            const ok = /^\d{1,13}$/.test(value);

            setInvalid(nibInput, !ok);

            if (!ok) {
                valid = false;
                if (!firstInvalid) firstInvalid = nibInput;
            }
        }

        // =====================================================
        // NIK / KK 16 DIGIT
        // =====================================================

        [
            "nik",
            "nomorKK",
            ...[
                ...step.querySelectorAll(
                    "[id^=nomorKKLain]"
                )
            ].map(
                el => el.id
            )
        ].forEach(
            id => {

                const el =
                    document.getElementById(
                        id
                    );


                if (
                    !el ||
                    !isVisible(el)
                ) {
                    return;
                }


                const ok =
                    /^\d{16}$/.test(
                        el.value.trim()
                    );


                setInvalid(
                    el,
                    !ok
                );


                if (!ok) {

                    valid = false;

                    if (!firstInvalid) {
                        firstInvalid = el;
                    }
                }
            }
        );


        // Validasi eksplisit agar tanggal lahir masa depan juga ditolak
        // ketika nilai dimasukkan secara manual.
        const birthDate = step.querySelector("#tanggalLahir");
        if (birthDate && isVisible(birthDate) && birthDate.value) {
            const invalidBirthDate = birthDate.value > getTodayDateString();
            setInvalid(birthDate, invalidBirthDate);
            birthDate.setCustomValidity(
                invalidBirthDate ? "Tanggal lahir tidak boleh melebihi tanggal hari ini." : ""
            );
            const birthError = document.getElementById("tanggalLahirError");
            if (birthError) birthError.classList.toggle("show", invalidBirthDate);
            if (invalidBirthDate && !firstInvalid) firstInvalid = birthDate;
            valid = valid && !invalidBirthDate;
        }

        if (
            !valid &&
            firstInvalid
        ) {

            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            firstInvalid.focus?.();
        }


        return valid;
    }


    // =========================================================
    // CHECKBOX DROPDOWN
    // =========================================================

    function setupCheckboxDropdowns(root = document) {

        root
            .querySelectorAll(
                ".checkbox-dropdown"
            )
            .forEach(
                dropdown => {

                    if (dropdown.dataset.dropdownInitialized === "true") return;
                    dropdown.dataset.dropdownInitialized = "true";

                    const button =
                        dropdown.querySelector(
                            ".checkbox-dropdown-btn"
                        );

                    const menu =
                        dropdown.querySelector(
                            ".checkbox-dropdown-menu"
                        );

                    const text =
                        dropdown.querySelector(
                            ".checkbox-dropdown-selected"
                        );


                    if (
                        !button ||
                        !menu
                    ) {
                        return;
                    }


                    const updateText =
                        () => {

                            const selected = [
                                ...menu.querySelectorAll(
                                    'input[type="checkbox"]:checked, input[type="radio"]:checked'
                                )
                            ].map(
                                cb => {

                                    const span =
                                        cb.closest(
                                            "label"
                                        )?.querySelector(
                                            "span"
                                        );


                                    return (
                                        span?.textContent.trim() ||
                                        cb.value
                                    );
                                }
                            );


                            if (text) {

                                text.textContent =
                                    selected.length
                                        ? selected.join(", ")
                                        : "Pilih jawaban";
                            }


                            dropdown.classList.toggle(
                                "has-value",
                                selected.length > 0
                            );
                        };


                    dropdown._updateSelectedText =
                        updateText;


                    button.addEventListener(
                        "click",
                        e => {

                            e.preventDefault();

                            e.stopPropagation();


                            document
                                .querySelectorAll(
                                    ".checkbox-dropdown-menu.show"
                                )
                                .forEach(
                                    m => {

                                        if (
                                            m !== menu
                                        ) {
                                            m.classList.remove(
                                                "show"
                                            );
                                        }
                                    }
                                );


                            menu.classList.toggle(
                                "show"
                            );
                        }
                    );


                    menu.addEventListener(
                        "click",
                        e => {
                            e.stopPropagation();
                        }
                    );


                    menu.querySelectorAll(
                        'input[type="checkbox"], input[type="radio"]'
                    ).forEach(
                        cb => {

                            cb.addEventListener(
                                "change",
                                () => {

                                    updateText();

                                    dropdown.classList.remove(
                                        "invalid"
                                    );

                                    scheduleSave();
                                }
                            );
                        }
                    );


                    updateText();
                }
            );
    }


    document.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".checkbox-dropdown-menu.show"
                )
                .forEach(
                    menu => {

                        menu.classList.remove(
                            "show"
                        );
                    }
                );
        }
    );


    // =========================================================
    // TOGGLE
    // =========================================================

    function toggle(
        id,
        show
    ) {

        const el =
            document.getElementById(
                id
            );


        if (!el) return;


        el.classList.toggle(
            "hidden",
            !show
        );


        el.querySelectorAll(
            "input, select, textarea"
        ).forEach(
            field => {

                field.disabled =
                    !show;


                if (!show) {

                    field.classList.remove(
                        "invalid"
                    );
                }
            }
        );
    }


    // =========================================================
    // SELECTED
    // =========================================================

    function selected(
        name
    ) {

        return (
            document.querySelector(
                `input[name="${CSS.escape(name)}"]:checked`
            )?.value ||
            document.querySelector(
                `select[name="${CSS.escape(name)}"]`
            )?.value ||
            ""
        );
    }


    // =========================================================
    // CURRENCY / NUMBER HELPERS
    // =========================================================

    function parseCurrency(value) {
        return Number(String(value ?? "").replace(/[^0-9]/g, "")) || 0;
    }

    function formatRupiah(value, withPrefix = true) {
        const number = Math.max(0, Math.floor(Number(value) || 0));
        const formatted = number.toLocaleString("id-ID");
        return withPrefix ? `Rp ${formatted}` : formatted;
    }

    function getNumberValue(id) {
        return parseCurrency(document.getElementById(id)?.value || "");
    }

    function normalizeCurrencyInput(input) {
        if (!input) return;

        const digits = String(input.value || "").replace(/[^0-9]/g, "");
        if (!digits) {
            input.value = "";
            return;
        }

        const max = Number.isFinite(Number(input.dataset.maxValue)) ? Number(input.dataset.maxValue) : Number.MAX_SAFE_INTEGER;
        const value = Math.min(parseInt(digits, 10) || 0, max);
        input.value = formatRupiah(value);
    }

    function setupCurrencyInputs(root = form) {
        root.querySelectorAll('input[data-currency]').forEach(input => {
            input.type = "text";
            input.inputMode = "numeric";
            input.autocomplete = "off";

            input.addEventListener("input", () => {
                normalizeCurrencyInput(input);
                updateAll();
                scheduleSave();
                scheduleServerSave();
            });

            input.addEventListener("blur", () => {
                normalizeCurrencyInput(input);
                updateAll();
                scheduleSave();
                scheduleServerSave();
            });
        });
    }

    function formatTotalInputs() {
        form.querySelectorAll('input[data-currency-total="true"]').forEach(input => {
            const value = parseCurrency(input.value);
            input.value = value > 0 ? formatRupiah(value) : "";
        });
    }

    // =========================================================
    // TOTAL PENGELUARAN BULANAN
    // =========================================================

    function hitungTotalPengeluaranBulan() {

        const upah =
            getNumberValue(
                "upahBulan"
            );


        const produksi =
            getNumberValue(
                "produksiBulan"
            );


        const pembelian =
            getNumberValue(
                "pembelianBulan"
            );


        const operasional =
            getNumberValue(
                "operasionalBulan"
            );


        const nonOperasional =
            getNumberValue(
                "nonOperasionalBulan"
            );


        const total =
            upah +
            produksi +
            pembelian +
            operasional +
            nonOperasional;


        const totalInput =
            document.getElementById(
                "totalPengeluaranBulan"
            );


        if (totalInput) {

            totalInput.value = formatRupiah(total);
        }
    }


    [
        "upahBulan",
        "produksiBulan",
        "pembelianBulan",
        "operasionalBulan",
        "nonOperasionalBulan"
    ].forEach(
        id => {

            const input =
                document.getElementById(
                    id
                );


            if (input) {

                input.addEventListener(
                    "input",
                    hitungTotalPengeluaranBulan
                );
            }
        }
    );


    // =========================================================
    // CONDITIONAL FIELDS
    // =========================================================

    // =========================================================
    // CLEAR CONDITIONAL DATA
    // =========================================================

    function clearConditionalData(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.querySelectorAll("input, select, textarea").forEach(field => {
            if (field.type === "file") {
                field.value = "";
                return;
            }

            if (field.type === "radio" || field.type === "checkbox") {
                field.checked = false;
                return;
            }

            field.value = "";
            field.classList.remove("invalid");
            field.removeAttribute("aria-invalid");
        });

        container.querySelectorAll(".invalid, .invalid-group").forEach(el => {
            el.classList.remove("invalid", "invalid-group");
            el.removeAttribute("aria-invalid");
        });

        container.querySelectorAll(".checkbox-dropdown").forEach(dropdown => {
            dropdown.classList.remove("invalid", "has-value");
            dropdown._updateSelectedText?.();
        });
    }


    // =========================================================
    // CONDITIONAL FIELDS
    // =========================================================

    // =========================================================
    // DINAMIS: JUMLAH USAHA & IDENTITAS USAHA/PERUSAHAAN
    // =========================================================

    function restructureIdentityBusinessTemplate() {
        const list = document.getElementById("identitasUsahaList");
        const template = document.getElementById("identitasUsahaTemplate");
        const usahaContent = document.getElementById("usahaContent");
        if (!list || !template || !usahaContent || template.dataset.restructured === "true") return;

        const firstHeading = template.querySelector(":scope > h4.subheading");
        const identityContent = template.querySelector(":scope > .form-grid");
        // NIB, Pengusaha/Penanggung Jawab, Pekerja, dan cabang periode e/f/g
        // berada di dalam #identitasUsahaList sebagai sibling dari template.
        // Jangan mulai dari list.nextSibling karena itu berada di luar list
        // dan menyebabkan card b-g kosong.
        // Struktur HTML saat ini menempatkan template di dalam
        // #identitasUsahaList, sedangkan grup NIB/c/d dan cabang e/f/g
        // berada sebagai child langsung #usahaContent. Jadi jangan mencari
        // sibling template; cari grup pada parent #usahaContent.
        const following = [...usahaContent.children].filter(el => el !== list);

        const byTitle = (titlePart) => following.find(el => {
            if (!el.matches?.(".question-group.usaha-section-group")) return false;
            const heading = el.querySelector(":scope > h4.subheading");
            return heading?.textContent.replace(/\s+/g, " ").includes(titlePart);
        });

        // Resolve the existing Blok D groups BEFORE moving their contents.
        // These references must exist before moveGroupContents()/splitBranch()
        // are called; otherwise the restructuring throws a ReferenceError and
        // the rest of questionnaire.js (including the Next button handlers)
        // never gets initialized.
        const nibGroup = byTitle("Nomor Induk Berusaha (NIB)");
        const personGroup = byTitle("Pengusaha/Penanggung Jawab");
        const workerGroup = byTitle("Pekerja");
        const beforeBranch = usahaContent.querySelector(
            ":scope > #usahaBranchBefore2026"
        );
        const currentBranch = usahaContent.querySelector(
            ":scope > #usahaBranch2026"
        );

        const makeCard = (letter, title) => {
            const card = document.createElement("div");
            card.className = "usaha-subsection-card";
            card.dataset.usahaSection = letter;
            const heading = document.createElement("h5");
            heading.className = "usaha-subsection-heading";
            heading.innerHTML = `<strong>${letter}.</strong> ${title}`;
            card.appendChild(heading);
            return card;
        };

        // Keep the business title as the main title of the business card.
        if (firstHeading) {
            firstHeading.innerHTML = `<strong>3.</strong> Keterangan Usaha/Perusahaan 1`;
        }

        // Rebuild the contents of the existing business card into a-g visual groups.
        const cards = {
            a: makeCard("a", "Identitas Usaha/Perusahaan"),
            b: makeCard("b", "Nomor Induk Berusaha (NIB)"),
            c: makeCard("c", "Pengusaha/Penanggung Jawab"),
            d: makeCard("d", "Pekerja"),
            e: makeCard("e", "Rincian Pengeluaran Selama Satu Bulan Terakhir"),
            f: makeCard("f", "Rincian Nilai Produksi/Penjualan/Pendapatan Selama Satu Bulan Terakhir"),
            g: makeCard("g", "Nilai aset pada akhir bulan yang lalu")
        };

        // a: keep the existing form-grid and all its fields together.
        if (identityContent) cards.a.appendChild(identityContent);

        // b/c/d: preserve their existing question-group contents, but place them inside the subsection card.
        const moveGroupContents = (group, card) => {
            if (!group) return;
            const heading = group.querySelector(":scope > h4.subheading");
            [...group.children].forEach(child => {
                if (child === heading) return;
                card.appendChild(child);
            });
        };
        moveGroupContents(nibGroup, cards.b);
        moveGroupContents(personGroup, cards.c);
        moveGroupContents(workerGroup, cards.d);

        // Split each existing year branch into e/f/g sub-branches so each visual section
        // has its own card while the original conditional behavior remains year-driven.
        const splitBranch = (branch, periodPrefix) => {
            if (!branch) return;
            const children = [...branch.children];
            let current = null;
            children.forEach(child => {
                if (child.matches?.("h4.subheading")) {
                    // Heading source masih memakai nomor lama (7., 8., 9.).
                    // Hilangkan nomor tersebut sebelum menentukan apakah ini e/f/g.
                    const text = child.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                        .replace(/^\d+\.?\s*/, "");
                    let letter = "";
                    if (/^Rincian Pengeluaran/i.test(text)) letter = "e";
                    else if (/^Rincian Nilai Produksi/i.test(text)) letter = "f";
                    if (letter) {
                        current = document.createElement("div");
                        current.className = "conditional-field usaha-period-branch";
                        current.id = `${periodPrefix}_${letter}`;
                        current.dataset.periodGroup = letter;
                        cards[letter].appendChild(current);
                        return;
                    }
                }

                // Pada source, bagian g bukan h4 terpisah. Ia berupa question-box
                // setelah petunjuk bagian f. Pindahkan question-box tersebut ke
                // card g agar g tidak ikut masuk ke card f.
                if (child.matches?.(".question-box")) {
                    const labelText = child.querySelector(":scope > label")?.textContent
                        .replace(/\s+/g, " ")
                        .trim() || "";
                    if (/^\d+\.?\s*Nilai aset selain tanah dan bangunan/i.test(labelText) ||
                        /^Nilai aset selain tanah dan bangunan/i.test(labelText)) {
                        let gBranch = cards.g.querySelector(`:scope > #${periodPrefix}_g`);
                        if (!gBranch) {
                            gBranch = document.createElement("div");
                            gBranch.className = "conditional-field usaha-period-branch";
                            gBranch.id = `${periodPrefix}_g`;
                            gBranch.dataset.periodGroup = "g";
                            cards.g.appendChild(gBranch);
                        }
                        current = gBranch;
                        current.appendChild(child);
                        return;
                    }
                }

                if (current) current.appendChild(child);
            });
            branch.remove();
        };

        splitBranch(beforeBranch, "usahaBranchBefore2026");
        splitBranch(currentBranch, "usahaBranch2026");

        // Pindahkan rincian aset dari cabang f ke cabang g agar f hanya
        // berisi f.1-f.4 dan g berisi g.1-g.2. ID/name input yang sudah
        // ada tetap dipertahankan.
        const moveAssetBoxesToG = (fromCard, assetIdPrefixes) => {
            if (!fromCard) return;
            assetIdPrefixes.forEach(assetIdPrefix => {
                fromCard.querySelectorAll(`[id^="${assetIdPrefix}"]`).forEach(input => {
                    const assetBox = input.closest(".question-box");
                    if (!assetBox) return;

                    // Keep the asset in the same period branch. For example,
                    // usahaBranch2026_f -> usahaBranch2026_g and
                    // usahaBranchBefore2026_f -> usahaBranchBefore2026_g.
                    const sourceBranch = input.closest(".usaha-period-branch");
                    let gBranch = null;
                    if (sourceBranch?.id) {
                        const gId = sourceBranch.id.replace(/_f$/, "_g");
                        gBranch = cards.g.querySelector(`#${gId}`);
                    }
                    if (!gBranch) {
                        gBranch = document.createElement("div");
                        gBranch.className = "conditional-field usaha-period-branch";
                        gBranch.id = sourceBranch?.id
                            ? sourceBranch.id.replace(/_f$/, "_g")
                            : `usahaBranchAsset_g_${assetIdPrefix}`;
                        gBranch.dataset.periodGroup = "g";
                        cards.g.appendChild(gBranch);
                    }
                    gBranch.appendChild(assetBox);
                });
            });
        };
        // The source contains one legacy duplicate for the 2025 non-land/building
        // asset field. Keep the canonical 2025 field and remove only that duplicate.
        cards.g.querySelectorAll('[id^="nilaiAsetSelainTanahBangunan"]').forEach(input => {
            input.closest(".question-box")?.remove();
        });
        moveAssetBoxesToG(cards.f, [
            "asetUsaha2025",
            "nilaiAsetSelain2025",
            "asetUsahaBulan",
            "nilaiAsetAkhirBulanLalu"
        ]);

        // Pastikan urutan pertanyaan Blok G selalu konsisten:
        // g.1 tanah dan bangunan, lalu g.2 selain tanah dan bangunan.
        // Jangan bergantung pada urutan field pada source/branch lama.
        cards.g.querySelectorAll(":scope > .usaha-period-branch").forEach(branch => {
            const boxes = [...branch.querySelectorAll(":scope > .question-box")];
            boxes.sort((a, b) => {
                const textA = a.querySelector(":scope > label")?.textContent.replace(/\s+/g, " ").trim() || "";
                const textB = b.querySelector(":scope > label")?.textContent.replace(/\s+/g, " ").trim() || "";
                const isLandA = /tanah dan bangunan/i.test(textA) && !/selain tanah dan bangunan/i.test(textA);
                const isLandB = /tanah dan bangunan/i.test(textB) && !/selain tanah dan bangunan/i.test(textB);
                if (isLandA !== isLandB) return isLandA ? -1 : 1;
                return 0;
            });
            boxes.forEach(box => branch.appendChild(box));
        });

        Object.values(cards).forEach(card => template.appendChild(card));

        // Remove the old sibling groups after their contents have been moved into the template card.
        [nibGroup, personGroup, workerGroup].forEach(group => group?.remove());

        // Convert NIB reason control to the required standard select.
        // Keep one canonical text field for the active reason so existing
        // storage/submission logic can continue to use the same answer key.
        const oldReasonField = cards.b.querySelector('[id^="alasanTidakNIBField"]');
        if (oldReasonField) {
            const oldDropdown = oldReasonField.querySelector(".checkbox-dropdown");
            if (oldDropdown) {
                const select = document.createElement("select");
                select.className = "form-select";
                select.dataset.required = "true";
                select.id = "alasanTidakNIBPilihan";
                select.name = "alasanTidakNIBPilihan";
                select.required = true;
                select.innerHTML = `
                    <option value="">Pilih alasan</option>
                    <option value="Dalam proses pembuatan NIB">Dalam proses pembuatan NIB</option>
                    <option value="Pengurusan NIB rumit">Pengurusan NIB rumit</option>
                    <option value="Tidak memerlukan NIB">Tidak memerlukan NIB</option>
                    <option value="Tidak tahu tentang NIB">Tidak tahu tentang NIB</option>
                    <option value="Lainnya">Lainnya</option>
                `;
                oldDropdown.replaceWith(select);
            }

            let lainnyaField = oldReasonField.querySelector('[id^="alasanTidakNIBLainnyaField"]');
            if (!lainnyaField) {
                lainnyaField = document.createElement("div");
                lainnyaField.className = "question-box conditional-field hidden";
                lainnyaField.id = "alasanTidakNIBLainnyaField";
                lainnyaField.innerHTML = `
                    <label for="alasanTidakNIBLainnya">Tuliskan</label>
                    <input id="alasanTidakNIBLainnya" name="alasanTidakNIBLainnya"
                           maxlength="255" placeholder="Tuliskan alasan lainnya" type="text">
                `;
                oldReasonField.appendChild(lainnyaField);
            }
        }

        // Canonical answer field: standard selections are synchronized here;
        // for "Lainnya", the manually typed value becomes the active answer.
        let reasonAnswerField = cards.b.querySelector('[id^="alasanTidakNIBJawabanField"]');
        if (!reasonAnswerField) {
            reasonAnswerField = document.createElement("div");
            reasonAnswerField.className = "question-box conditional-field hidden";
            reasonAnswerField.id = "alasanTidakNIBJawabanField";
            reasonAnswerField.innerHTML = `
                <label for="alasanTidakNIBJawaban">
                    Jawaban alasan tidak memiliki NIB
                    <span aria-label="Wajib diisi" class="required">*</span>
                </label>
                <input data-required="true" id="alasanTidakNIBJawaban"
                       name="alasanTidakNIB" maxlength="255"
                       placeholder="Alasan tidak memiliki NIB" type="text" readonly>
            `;
            oldReasonField?.appendChild(reasonAnswerField);
        }

        // b.1–b.5 are fixed semantic positions. Conditional b.2/b.3
        // are never shown together.
        const renumberNibFields = (card) => {
            const b = card.querySelector(':scope > .usaha-subsection-card[data-usaha-section="b"]');
            if (!b) return;
            const boxes = [...b.querySelectorAll(':scope > .question-box')];

            boxes.forEach(box => {
                const label = box.querySelector(':scope > label');
                if (!label) return;
                const text = label.textContent.replace(/\s+/g, ' ').trim();

                if (/Apakah memiliki Nomor Induk Berusaha/i.test(text)) {
                    label.querySelector(':scope > strong')?.remove();
                    const strong = document.createElement('strong');
                    strong.textContent = 'b.1';
                    label.insertBefore(strong, label.firstChild);
                } else if (/Tuliskan NIB/i.test(text) || /Nomor Induk Berusaha.*13/i.test(text)) {
                    label.querySelector(':scope > strong')?.remove();
                    const strong = document.createElement('strong');
                    strong.textContent = 'b.2';
                    label.insertBefore(strong, label.firstChild);
                } else if (/Apa alasan utama tidak memiliki NIB/i.test(text) || /alasan tidak memiliki NIB/i.test(text)) {
                    label.querySelector(':scope > strong')?.remove();
                    const strong = document.createElement('strong');
                    strong.textContent = 'b.3';
                    label.insertBefore(strong, label.firstChild);
                } else if (/status badan usaha/i.test(text)) {
                    label.querySelector(':scope > strong')?.remove();
                    const strong = document.createElement('strong');
                    strong.textContent = 'b.4';
                    label.insertBefore(strong, label.firstChild);
                } else if (/laporan\/catatan keuangan/i.test(text)) {
                    label.querySelector(':scope > strong')?.remove();
                    const strong = document.createElement('strong');
                    strong.textContent = 'b.5';
                    label.insertBefore(strong, label.firstChild);
                }
            });
        };

        renumberNibFields(template);

        template.dataset.restructured = "true";
        template.dataset.usahaIndex = "1";
        template.classList.add("usaha-identity-card");
        normalizeIdentityBusinessNumbering(template);
    }

    function numberDirectQuestionBoxes(container, prefix) {
        let n = 0;
        container.querySelectorAll(":scope > .question-box, :scope > .form-grid > .question-box, :scope > .conditional-field > .question-box, :scope > .conditional-field > .form-grid > .question-box").forEach(box => {
            if (box.parentElement?.closest(".question-box")) return;
            const label = box.querySelector(":scope > label");
            if (!label) return;
            const text = label.textContent.replace(/\s+/g, " ").trim();
            if (!text || /^Petunjuk:?$/i.test(text)) return;

            n += 1;
            label.querySelector(":scope > strong:first-child")?.remove();
            const strong = document.createElement("strong");
            strong.textContent = `${prefix}.${n}.`;
            label.insertBefore(strong, label.firstChild);
        });
    }

    function updateUsahaPeriodSectionTitles(card, use2025) {
        const titles = {
            e: use2025
                ? "Rincian Pengeluaran Tahun 2025"
                : "Rincian Pengeluaran Selama Satu Bulan Terakhir",
            f: use2025
                ? "Rincian Nilai Produksi/Penjualan/Pendapatan Tahun 2025"
                : "Rincian Nilai Produksi/Penjualan/Pendapatan Selama Satu Bulan Terakhir",
            g: use2025
                ? "Nilai aset pada 31 Desember 2025"
                : "Nilai aset pada akhir bulan yang lalu"
        };

        Object.entries(titles).forEach(([letter, title]) => {
            const heading = card.querySelector(
                `:scope > .usaha-subsection-card[data-usaha-section="${letter}"] > .usaha-subsection-heading`
            );
            if (heading) {
                heading.innerHTML = `<strong>${letter}.</strong> ${title}`;
            }
        });
    }

    function normalizeIdentityBusinessNumbering(card) {
        const title = card.querySelector(":scope > h4.subheading");
        if (title) {
            const index = Number(card.dataset.usahaIndex || 1);
            title.innerHTML = `<strong>${index + 2}.</strong> Keterangan Usaha/Perusahaan ${index}`;
        }

        card.querySelectorAll(":scope > .usaha-subsection-card").forEach(section => {
            const letter = section.dataset.usahaSection;
            const heading = section.querySelector(":scope > .usaha-subsection-heading");
            if (!letter || !heading) return;
            const titles = {
                a: "Identitas Usaha/Perusahaan",
                b: "Nomor Induk Berusaha (NIB)",
                c: "Pengusaha/Penanggung Jawab",
                d: "Pekerja",
                e: "Rincian Pengeluaran Selama Satu Bulan Terakhir",
                f: "Rincian Nilai Produksi/Penjualan/Pendapatan Selama Satu Bulan Terakhir",
                g: "Nilai aset pada akhir bulan yang lalu"
            };
            heading.innerHTML = `<strong>${letter}.</strong> ${titles[letter]}`;
            if (letter === "d") {
                const workerBoxes = [];
                section.querySelectorAll(":scope > .question-box, :scope > .form-grid > .question-box").forEach(box => {
                    if (!workerBoxes.includes(box)) workerBoxes.push(box);
                });
                workerBoxes.forEach((box, index) => {
                    const label = box.querySelector(":scope > label");
                    if (!label) return;
                    label.querySelector(":scope > strong:first-child")?.remove();
                    const strong = document.createElement("strong");
                    strong.textContent = `d.${index + 1}.`;
                    label.insertBefore(strong, label.firstChild);
                });
            } else if (letter === "e" || letter === "f" || letter === "g") {
                section.querySelectorAll(":scope > .usaha-period-branch").forEach(branch => {
                    numberDirectQuestionBoxes(branch, letter);
                });
            } else if (letter === "b") {
                section.querySelectorAll(":scope > .question-box").forEach(box => {
                    const label = box.querySelector(":scope > label");
                    if (!label) return;
                    const text = label.textContent.replace(/\s+/g, " ").trim();
                    let number = "";
                    if (/Apakah memiliki Nomor Induk Berusaha/i.test(text)) number = "b.1";
                    else if (/Tuliskan NIB/i.test(text)) number = "b.2";
                    else if (/Apa alasan utama tidak memiliki NIB/i.test(text) || /alasan tidak memiliki NIB/i.test(text)) number = "b.3";
                    else if (/status badan usaha/i.test(text)) number = "b.4";
                    else if (/laporan\/catatan keuangan/i.test(text)) number = "b.5";
                    if (number) {
                        label.querySelector(":scope > strong")?.remove();
                        const strong = document.createElement("strong");
                        strong.textContent = number;
                        label.insertBefore(strong, label.firstChild);
                    }
                });
            } else if (letter === "c") {
                numberPengusahaSection(section);
            } else {
                numberDirectQuestionBoxes(section, letter);
            }
        });
    }

    function numberPengusahaSection(section) {
        // Penomoran Blok C mengikuti struktur pertanyaan yang sudah ada.
        // c.10 = penggunaan internet, c.11 = tujuan penggunaan internet,
        // c.12 = teknologi digital, c.13 = produk karya, c.14 = transaksi.
        const directBoxes = [];
        section.querySelectorAll(":scope > .question-box, :scope > .form-grid > .question-box").forEach(box => {
            if (box.parentElement?.closest(".question-box")) return;
            if (!directBoxes.includes(box)) directBoxes.push(box);
        });

        const internetBox = directBoxes.find(box =>
            /menggunakan internet dalam menjalankan usaha/i.test(
                box.textContent.replace(/\s+/g, " ")
            )
        );
        const digitalBox = directBoxes.find(box =>
            /memanfaatkan teknologi digital/i.test(
                box.textContent.replace(/\s+/g, " ")
            )
        );
        const karyaBox = directBoxes.find(box =>
            /menggunakan produk karya seni, sastra, desain, teknologi atau warisan budaya/i.test(
                box.textContent.replace(/\s+/g, " ")
            )
        );
        const transaction = directBoxes.find(box =>
            /melakukan penjualan\/pembelian kepada.*bukan penduduk Indonesia/i.test(
                box.textContent.replace(/\s+/g, " ")
            )
        );

        directBoxes.forEach((box, index) => {
            const label = box.querySelector(":scope > label");
            if (!label) return;

            let number = `c.${index + 1}`;
            if (box === internetBox) number = "c.10";
            else if (box === digitalBox) number = "c.12";
            else if (box === karyaBox) number = "c.13";
            else if (box === transaction) number = "c.14";

            label.querySelector(":scope > strong")?.remove();
            const strong = document.createElement("strong");
            strong.textContent = number;
            label.insertBefore(strong, label.firstChild);
        });

        // c.11 hanya tampil jika c.10 dijawab Iya.
        const internetGroup = section.querySelector(':scope > [id^="tujuanPenggunaanInternet"]');
        if (internetGroup) {
            const internetLabel = internetGroup.querySelector(':scope > .question-box > label');
            if (internetLabel) {
                internetLabel.querySelector(':scope > strong')?.remove();
                const strong = document.createElement('strong');
                strong.textContent = 'c.11';
                internetLabel.insertBefore(strong, internetLabel.firstChild);
            }

            const tujuanRows = [...internetGroup.querySelectorAll(':scope > .question-box > .matrix-table > .matrix-row')];
            tujuanRows.forEach((row, index) => {
                const label = row.querySelector(':scope > .matrix-label');
                if (!label) return;
                label.querySelector(':scope > strong')?.remove();
                const strong = document.createElement('strong');
                strong.textContent = `c.11.${index + 1}`;
                strong.style.marginRight = '6px';
                label.insertBefore(strong, label.firstChild);
            });
        }

        // Pertanyaan turunan transaksi tetap mengikuti struktur yang sudah ada.
        if (transaction) {
            const children = [...transaction.querySelectorAll(":scope > .question-box")];
            children.forEach((child, index) => {
                const childLabel = child.querySelector(":scope > label");
                if (!childLabel) return;
                childLabel.querySelector(":scope > strong")?.remove();
                const strong = document.createElement("strong");
                strong.textContent = `c.14.${index + 1}`;
                childLabel.insertBefore(strong, childLabel.firstChild);
            });
        }
    }

    function toggleWithin(root, selector, show) {
        const el = root.querySelector(selector);
        if (!el) return;
        el.classList.toggle("hidden", !show);
        el.querySelectorAll("input, select, textarea").forEach(field => {
            field.disabled = !show;
            if (!show) {
                if (field.type === "radio" || field.type === "checkbox") field.checked = false;
                else field.value = "";
                field.classList.remove("invalid");
            }
        });
    }

    function clearWithin(root, selector) {
        const el = root.querySelector(selector);
        if (!el) return;
        el.querySelectorAll("input, select, textarea").forEach(field => {
            if (field.type === "radio" || field.type === "checkbox") field.checked = false;
            else field.value = "";
            field.classList.remove("invalid");
            field.removeAttribute("aria-invalid");
        });
        el.querySelectorAll(".checkbox-dropdown").forEach(d => { d.classList.remove("invalid", "has-value"); d._updateSelectedText?.(); });
    }

    function selectedWithin(root, baseName) {
        // Never fall back to the value of the first radio/checkbox.
        // An unchecked radio still has a value (usually "1"), which made
        // conditional fields such as b.2 appear before b.1 was answered.
        const checked = root.querySelector(`input[name^="${baseName}"]:checked`);
        if (checked) return checked.value || "";

        const field = root.querySelector(
            `select[name^="${baseName}"], textarea[name^="${baseName}"], input:not([type="radio"]):not([type="checkbox"])[name^="${baseName}"]`
        );
        return field?.value || "";
    }

    const usahaQuantityMap = [
        "identUsahaKeliling",
        "identUsahaOnline",
        "identUsahaLuarTempatTinggal",
        "identUsahaLain",
        "identPertanianTanamanPangan",
        "identPertanianHortikultura",
        "identPertanianPerkebunan",
        "identPertanianPeternakan",
        "identPertanianKehutanan",
        "identPertanianPerikanan",
        "identPertanianJasa"
    ];

    // =========================================================
    // MATRIX UI BLOK D - PERTANYAAN 2
    // Radio hanya menjadi UI. Select asli tetap menjadi sumber data
    // agar seluruh logic/conditional/validasi lama tetap digunakan.
    // =========================================================

    function setupPertanianMatrixUI() {
        const root = document.getElementById("identifikasiUsahaPertanianMatrix");
        if (!root || root.dataset.matrixInitialized === "true") return;

        root.dataset.matrixInitialized = "true";

        const syncRadios = (select) => {
            root.querySelectorAll(
                `.matrix-ui-radio[data-matrix-target="${CSS.escape(select.id)}"]`
            ).forEach(radio => {
                radio.checked = radio.value === select.value;
            });
        };

        root.querySelectorAll(".matrix-source-select").forEach(select => {
            syncRadios(select);

            select.addEventListener("change", () => {
                syncRadios(select);
            });
        });

        root.querySelectorAll(".matrix-ui-radio").forEach(radio => {
            radio.addEventListener("change", () => {
                if (!radio.checked) return;

                const target = document.getElementById(radio.dataset.matrixTarget);
                if (!target) return;

                target.value = radio.value;
                target.dispatchEvent(new Event("change", { bubbles: true }));
                syncRadios(target);
            });
        });
    }


    function setupUsahaQuantityFields() {
        usahaQuantityMap.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            const fieldId = `jumlahUsahaField_${id}`;
            const inputId = `jumlahUsaha_${id}`;
            const field = document.getElementById(fieldId);
            const input = document.getElementById(inputId);

            if (!field || !input) return;

            input.min = "1";
            input.step = "1";
            input.inputMode = "numeric";

            // Pilihan Ya/Tidak menjadi satu-satunya pemicu tampilnya jumlah.
            select.addEventListener("change", () => updateAll());
        });
    }

    function getTotalUsaha() {
        return usahaQuantityMap.reduce((total, id) => {
            const answer = document.getElementById(id)?.value || "";
            if (answer !== "ya") return total;

            const input = document.getElementById(`jumlahUsaha_${id}`);
            const value = Number.parseInt(input?.value || "0", 10);

            return total + (Number.isFinite(value) && value > 0 ? value : 0);
        }, 0);
    }

    function rewriteIdentityCardIds(card, index) {
        const suffix = index === 1 ? "" : `_${index}`;

        card.querySelectorAll("[id]").forEach(el => {
            const baseId = el.dataset.identityBaseId || el.id.replace(/_\d+$/, "");
            el.dataset.identityBaseId = baseId;
            el.id = `${baseId}${suffix}`;
        });

        card.querySelectorAll("label[for]").forEach(label => {
            const baseFor = label.dataset.identityBaseFor || label.htmlFor.replace(/_\d+$/, "");
            label.dataset.identityBaseFor = baseFor;
            label.htmlFor = `${baseFor}${suffix}`;
        });

        card.querySelectorAll("[name]").forEach(el => {
            const baseName = el.dataset.identityBaseName || el.name.replace(/_\d+$/, "");
            el.dataset.identityBaseName = baseName;
            el.name = `${baseName}${suffix}`;
        });
    }


    // =========================================================
    // BLOK D — ALAMAT USAHA PER USAHAAN
    // =========================================================

    function firstWithin(card, baseId) {
        const exact = card.querySelector(`#${CSS.escape(baseId)}`);
        if (exact) return exact;
        return card.querySelector(`[id^="${CSS.escape(baseId)}_"]`);
    }

    function checkedWithin(card, baseName) {
        return card.querySelector(
            `input[type="radio"][name^="${CSS.escape(baseName)}"]:checked`
        )?.value || "";
    }

    function residenceAddressSnapshot() {
        const kecamatanSelect = document.getElementById("fKecamatan");
        const desaSelect = document.getElementById("fDesa");
        const slsSelect = document.getElementById("fSls");

        const isOther = kecamatanSelect?.value === "Lainnya";

        return {
            provinsi: document.getElementById("fProvinsi")?.value?.trim() || "Sumatera Selatan",
            kabupaten: document.getElementById("fKabupaten")?.value?.trim() || "Ogan Ilir",
            kecamatanMode: isOther ? "lainnya" : "normal",
            kecamatan: isOther
                ? document.getElementById("kecamatanLainnya")?.value?.trim() || ""
                : kecamatanSelect?.value?.trim() || "",
            desa: isOther
                ? document.getElementById("desaLainnya")?.value?.trim() || ""
                : desaSelect?.value?.trim() || "",
            sls: isOther
                ? document.getElementById("slsLainnya")?.value?.trim() || ""
                : slsSelect?.value?.trim() || "",
            alamat: document.getElementById("fAlamat")?.value?.trim() || ""
        };
    }

    function setBusinessAddressEditable(card, editable) {
        const container = firstWithin(card, "alamatUsahaFields");
        if (!container) return;

        container.querySelectorAll("input, select, textarea").forEach(el => {
            // Readonly keeps the value included in collectData()/submission,
            // unlike disabled fields which are intentionally omitted.
            if (el.matches('[id^="usahaProvinsi"], [id^="usahaKabupaten"], [id^="usahaKecamatan"], [id^="usahaDesa"], [id^="usahaSls"], [id^="usahaAlamat"]')) {
                el.readOnly = !editable;
                el.classList.toggle("address-auto-locked", !editable);
            }

            // A select cannot be readonly, so prevent pointer interaction
            // while keeping it enabled and therefore included in submission.
            if (el.tagName === "SELECT") {
                el.classList.toggle("address-auto-locked", !editable);
                el.setAttribute("aria-readonly", editable ? "false" : "true");
                el.style.pointerEvents = editable ? "" : "none";
            }
        });
    }

    function setBusinessAddressFieldsDisabled(card, disabled) {
        const container = firstWithin(card, "alamatUsahaFields");
        if (!container) return;

        container.querySelectorAll("input, select, textarea").forEach(el => {
            el.disabled = disabled;
            if (disabled) {
                el.classList.remove("invalid", "valid", "address-auto-locked");
                el.removeAttribute("aria-invalid");
            }
        });
    }

    function setAddressFieldValue(field, value) {
        if (!field) return;
        const normalized = String(value ?? "").trim();

        if (field.tagName === "SELECT") {
            const option = [...field.options].find(opt =>
                String(opt.value).trim().toLowerCase() === normalized.toLowerCase() ||
                String(opt.textContent).trim().toLowerCase() === normalized.toLowerCase()
            );

            if (option) {
                field.value = option.value;
            } else if (normalized) {
                // Keep the actual select value/submission synchronized even
                // when the residence value is not present in its options.
                field.appendChild(new Option(normalized, normalized, false, true));
            } else {
                field.value = "";
            }
            return;
        }

        field.value = normalized;
    }

    function clearBusinessAddressFields(card) {
        const container = firstWithin(card, "alamatUsahaFields");
        if (!container) return;

        container.querySelectorAll(
            '[id^="usahaProvinsi"], [id^="usahaKabupaten"], [id^="usahaKecamatan"], [id^="usahaDesa"], [id^="usahaSls"], [id^="usahaAlamat"]'
        ).forEach(field => {
            if (field.type === "radio" || field.type === "checkbox") {
                field.checked = false;
            } else {
                field.value = "";
            }
            field.readOnly = false;
            field.classList.remove("address-auto-locked", "invalid", "valid");
            field.removeAttribute("aria-invalid");
            if (field.tagName === "SELECT") {
                field.setAttribute("aria-readonly", "false");
                field.style.pointerEvents = "";
            }
        });
    }

    function fillBusinessAddressFromResidence(card) {
        const address = residenceAddressSnapshot();

        setAddressFieldValue(firstWithin(card, "usahaProvinsi"), address.provinsi);
        setAddressFieldValue(firstWithin(card, "usahaKabupaten"), address.kabupaten);
        setAddressFieldValue(firstWithin(card, "usahaKecamatan"), address.kecamatan);
        setAddressFieldValue(firstWithin(card, "usahaDesa"), address.desa);
        setAddressFieldValue(firstWithin(card, "usahaSls"), address.sls);
        setAddressFieldValue(firstWithin(card, "usahaAlamat"), address.alamat);

        setBusinessAddressFieldsDisabled(card, false);
        setBusinessAddressEditable(card, false);
    }

    function prepareBusinessAddressManual(card) {
        clearBusinessAddressFields(card);
        setBusinessAddressFieldsDisabled(card, false);
        setBusinessAddressEditable(card, true);
    }

    function syncBusinessAddressFields(card) {
        const choice = checkedWithin(card, "alamatUsahaSama");
        const fields = firstWithin(card, "alamatUsahaFields");

        if (!fields) return;

        if (!choice) {
            fields.classList.add("hidden");
            setBusinessAddressFieldsDisabled(card, true);
            return;
        }

        fields.classList.remove("hidden");
        setBusinessAddressFieldsDisabled(card, false);

        if (choice === "iya") {
            // Always resync from the latest residence values. This also makes
            // Iya -> residence changed -> business address changed automatic.
            fillBusinessAddressFromResidence(card);
            card.dataset.businessAddressMode = "iya";
            return;
        }

        // Iya -> Tidak must clear the copied values once, then leave the
        // fields editable so the respondent can enter a different address.
        if (card.dataset.businessAddressMode !== "manual") {
            prepareBusinessAddressManual(card);
        } else {
            setBusinessAddressFieldsDisabled(card, false);
            setBusinessAddressEditable(card, true);
        }
        card.dataset.businessAddressMode = "manual";
    }

    window.syncAllBusinessAddressesFromResidence = function () {
        document.querySelectorAll(".usaha-identity-card").forEach(card => {
            if (checkedWithin(card, "alamatUsahaSama") === "iya") {
                fillBusinessAddressFromResidence(card);
            }
        });
    };

    function updateIdentityCardTitle(card, index) {
        const heading = card.querySelector("h4.subheading");
        if (!heading) return;
        heading.innerHTML = `<strong>${index + 2}.</strong> Keterangan Usaha/Perusahaan ${index}`;
    }

    function setIdentityCardActive(card, active) {
        card.classList.toggle("hidden", !active);
        card.setAttribute("aria-hidden", active ? "false" : "true");

        card.querySelectorAll("input, select, textarea, button").forEach(el => {
            // Tombol tidak menjadi jawaban, tetapi tetap dinonaktifkan pada kartu yang tidak aktif.
            el.disabled = !active;
            if (!active) {
                el.classList.remove("invalid");
                el.removeAttribute("aria-invalid");
            }
        });
    }

    function syncIdentityUsahaForms(totalUsaha) {
        const list = document.getElementById("identitasUsahaList");
        const template = document.getElementById("identitasUsahaTemplate");
        if (!list || !template) return;

        let cards = [
            ...list.querySelectorAll(".usaha-identity-card")
        ];

        if (!template.classList.contains("usaha-identity-card")) {
            template.classList.add("usaha-identity-card");
            cards = [template, ...cards];
        }

        // Kartu pertama tetap menjadi template aktif agar data usaha pertama tidak berubah.
        rewriteIdentityCardIds(template, 1);
        updateIdentityCardTitle(template, 1);
        normalizeIdentityBusinessNumbering(template);

        for (let index = 2; index <= totalUsaha; index++) {
            let card = list.querySelector(`.usaha-identity-card[data-usaha-index="${index}"]`);

            if (!card) {
                card = template.cloneNode(true);
                card.classList.add("usaha-identity-card");
                card.dataset.usahaIndex = String(index);
                rewriteIdentityCardIds(card, index);
                updateIdentityCardTitle(card, index);

                // Kartu baru harus dimulai kosong.
                card.querySelectorAll("input, select, textarea").forEach(el => {
                    if (el.type === "radio" || el.type === "checkbox") {
                        el.checked = false;
                    } else {
                        el.value = "";
                    }
                });

                list.appendChild(card);
                normalizeIdentityBusinessNumbering(card);
                setupCheckboxDropdowns(card);
                setupCurrencyInputs(card);
            }
        }

        cards = [
            ...list.querySelectorAll(".usaha-identity-card")
        ];

        cards.forEach((card, position) => {
            const index = position + 1;
            card.dataset.usahaIndex = String(index);
            updateIdentityCardTitle(card, index);
            setIdentityCardActive(card, index <= totalUsaha);
        });
    }

    function updateUsahaQuantityFields() {
        usahaQuantityMap.forEach(id => {
            const answer = document.getElementById(id)?.value || "";
            const showQuantity = answer === "ya";
            const field = document.getElementById(`jumlahUsahaField_${id}`);
            const input = document.getElementById(`jumlahUsaha_${id}`);

            toggle(`jumlahUsahaField_${id}`, showQuantity);

            if (!showQuantity) {
                if (input) input.value = "";
                return;
            }

            if (input) {
                input.min = "1";
                input.step = "1";
                input.dataset.required = "true";
            }
        });
    }

    function updateConditionalFields() {

        // -----------------------------------------------------
        // BLOK 3 — PEKERJAAN
        // -----------------------------------------------------

        const memilikiPekerjaan =
            document.getElementById("memilikiPekerjaan")?.value || "";

        const bekerja =
            memilikiPekerjaan === "ya";

        // Profesi dan status pekerjaan hanya muncul ketika bekerja.
        toggle("document4413_2", bekerja);

        if (!bekerja) {
            clearConditionalData("document4413_2");
        }

        // -----------------------------------------------------
        // BLOK 4 — IDENTIFIKASI USAHA
        // Minimal satu dari 11 identifikasi = Iya
        // -----------------------------------------------------

        const usahaIdentificationIds = usahaQuantityMap;

        // Setiap kategori yang dijawab Iya wajib memiliki jumlah usaha.
        updateUsahaQuantityFields();

        const totalUsaha = getTotalUsaha();
        const memilikiUsaha =
            usahaIdentificationIds.some(
                id => document.getElementById(id)?.value === "ya"
            );

        // Identitas Usaha/Perusahaan dibuat sebanyak total seluruh usaha.
        toggle("usahaContent", memilikiUsaha);

        if (!memilikiUsaha) {
            clearConditionalData("usahaContent");
            syncIdentityUsahaForms(0);
        } else {
            syncIdentityUsahaForms(totalUsaha);
        }

        // -----------------------------------------------------
        // BLOK 5 — PENDAPATAN DARI PEKERJAAN
        // Muncul langsung jika responden memiliki pekerjaan.
        // Tidak ada lagi pertanyaan Iya/Tidak khusus pendapatan.
        // -----------------------------------------------------

        toggle("pendapatanPekerjaanField", bekerja);

        if (!bekerja) {
            clearConditionalData("pendapatanPekerjaanField");
        }

        // -----------------------------------------------------
        // BLOK 5 — PENDAPATAN DARI USAHA
        // Muncul langsung jika minimal satu identifikasi usaha = Iya.
        // Tidak ada lagi pertanyaan Iya/Tidak khusus pendapatan usaha.
        // -----------------------------------------------------

        toggle("pendapatanUsahaField", memilikiUsaha);

        if (!memilikiUsaha) {
            clearConditionalData("pendapatanUsahaField");
        }

        // -----------------------------------------------------
        // BLOK 5 — PENDAPATAN LAIN / TRANSFER / PASSIVE INCOME
        // Selalu tampil pertanyaan Iya/Tidak.
        // Total pendapatan hanya muncul jika jawabannya Iya.
        // -----------------------------------------------------

        // Pertanyaan 3 (transfer orang tua/wali) tetap memakai field yang sudah ada.
        const pendapatanOrangTua =
            document.getElementById("adaPendapatanLain")?.value || "";

        const tampilkanTotalPendapatanOrangTua =
            pendapatanOrangTua === "ya";

        toggle("totalPendapatanLainField", tampilkanTotalPendapatanOrangTua);

        const totalPendapatanOrangTuaInput =
            document.getElementById("totalPendapatanLain");

        if (totalPendapatanOrangTuaInput) {
            totalPendapatanOrangTuaInput.dataset.required =
                tampilkanTotalPendapatanOrangTua ? "true" : "false";
        }

        if (!tampilkanTotalPendapatanOrangTua) {
            clearConditionalData("totalPendapatanLainField");
        }

        // Pertanyaan 4: pendapatan lain/passive income.
        const pendapatanPasif =
            document.getElementById("adaPendapatanPasif")?.value || "";

        const tampilkanTotalPendapatanPasif =
            pendapatanPasif === "ya";

        toggle("totalPendapatanPasifField", tampilkanTotalPendapatanPasif);

        const totalPendapatanPasifInput =
            document.getElementById("totalPendapatanPasif");

        if (totalPendapatanPasifInput) {
            totalPendapatanPasifInput.dataset.required =
                tampilkanTotalPendapatanPasif ? "true" : "false";
        }

        if (!tampilkanTotalPendapatanPasif) {
            clearConditionalData("totalPendapatanPasifField");
        }

        // -----------------------------------------------------
        // PROFESI LAINNYA
        // -----------------------------------------------------

        const profesi =
            document.getElementById("profesiPekerjaanUtama")?.value || "";

        const profesiLainnya =
            bekerja && profesi === "185";

        toggle(
            "profesiPekerjaanUtamaLainnyaField",
            profesiLainnya
        );

        if (!profesiLainnya) {
            clearConditionalData("profesiPekerjaanUtamaLainnyaField");
        }

        // -----------------------------------------------------
        // SETIAP IDENTITAS USAHA — CONDITIONAL PER DATASET
        // Periode usaha: <= 2025 memakai cabang Tahun 2025; 2026 memakai
        // cabang Satu Bulan Terakhir. Tahun selain rentang tersebut tidak
        // membuka salah satu cabang periode.
        // -----------------------------------------------------
        document.querySelectorAll(".usaha-identity-card").forEach(card => {
            const active = !card.classList.contains("hidden");
            if (!active) return;

            syncBusinessAddressFields(card);

            const tahunOperasi = Number(card.querySelector('[id^="tahunOperasi"]')?.value || 0);
            // Tahun <= 2025 menggunakan periode Tahun 2025.
            // Tahun 2026 ke atas menggunakan periode Satu Bulan Terakhir.
            const sebelumAtau2025 = memilikiUsaha && tahunOperasi > 0 && tahunOperasi <= 2025;
            const tahun2026Keatas = memilikiUsaha && tahunOperasi >= 2026;

            card.querySelectorAll('[id^="usahaBranchBefore2026"]').forEach(el => {
                el.classList.toggle("hidden", !sebelumAtau2025);
                el.querySelectorAll("input, select, textarea").forEach(field => {
                    field.disabled = !sebelumAtau2025;
                    if (!sebelumAtau2025) {
                        if (field.type === "radio" || field.type === "checkbox") field.checked = false;
                        else field.value = "";
                    }
                });
            });
            card.querySelectorAll('[id^="usahaBranch2026"]').forEach(el => {
                el.classList.toggle("hidden", !tahun2026Keatas);
                el.querySelectorAll("input, select, textarea").forEach(field => {
                    field.disabled = !tahun2026Keatas;
                    if (!tahun2026Keatas) {
                        if (field.type === "radio" || field.type === "checkbox") field.checked = false;
                        else field.value = "";
                    }
                });
            });

            updateUsahaPeriodSectionTitles(card, sebelumAtau2025);
            card.querySelectorAll(":scope > .usaha-subsection-card").forEach(section => {
                const letter = section.dataset.usahaSection;
                if (letter === "e" || letter === "f" || letter === "g") {
                    // Each period branch (<=2025 and 2026+) is numbered
                    // independently so the visible branch always starts at .1.
                    section.querySelectorAll(":scope > .usaha-period-branch").forEach(branch => {
                        numberDirectQuestionBoxes(branch, letter);
                    });
                }
            });

            const nib = selectedWithin(card, "punyaNIB");
            toggleWithin(card, '[id^="nibField"]', memilikiUsaha && nib === "1");
            toggleWithin(card, '[id^="alasanTidakNIBField"]', memilikiUsaha && nib === "2");
            if (nib !== "1") clearWithin(card, '[id^="nibField"]');
            if (nib !== "2") clearWithin(card, '[id^="alasanTidakNIBField"]');

            const alasan = selectedWithin(card, "alasanTidakNIBPilihan");
            const lainnya = memilikiUsaha && nib === "2" && alasan === "Lainnya";
            toggleWithin(card, '[id^="alasanTidakNIBLainnyaField"]', lainnya);

            // Keep the canonical stored-answer field hidden. It is used only
            // for persistence and must never appear as an extra visible
            // question under b.3.
            const reasonAnswerField = card.querySelector('[id^="alasanTidakNIBJawabanField"]');
            const alasanLainnyaInput = card.querySelector('[id^="alasanTidakNIBLainnya"]');
            const alasanJawabanInput = card.querySelector('[id^="alasanTidakNIBJawaban"]');
            if (reasonAnswerField) reasonAnswerField.classList.add("hidden");
            if (alasanJawabanInput) {
                alasanJawabanInput.disabled = !(memilikiUsaha && nib === "2");
            }

            if (lainnya) {
                if (alasanLainnyaInput && alasanJawabanInput) {
                    alasanJawabanInput.value = alasanLainnyaInput.value || "";
                }
            } else if (alasan === "" || nib !== "2") {
                if (alasanJawabanInput) alasanJawabanInput.value = "";
                if (alasanLainnyaInput) alasanLainnyaInput.value = "";
            } else if (alasanJawabanInput) {
                // Standard reason: synchronize the selected option into the
                // canonical text answer immediately.
                alasanJawabanInput.value = alasan;
            }

            const status = card.querySelector('[id^="statusBadanUsaha"]')?.value || "";
            const koperasi = memilikiUsaha && status === "4";
            toggleWithin(card, '[id^="koperasiFields"]', koperasi);
            if (!koperasi) clearWithin(card, '[id^="koperasiFields"]');

            const internet = selectedWithin(card, "menggunakanInternet");
            const memakaiInternet = memilikiUsaha && internet === "1";
            toggleWithin(card, '[id^="tujuanPenggunaanInternet"]', memakaiInternet);

            // c.10 = Iya -> tampilkan seluruh c.11.
            // c.10 = Tidak -> sembunyikan dan kosongkan seluruh c.11.
            if (!memakaiInternet) {
                clearWithin(card, '[id^="tujuanPenggunaanInternet"]');
            }

            // c.11.6 Lainnya = Ya -> tampilkan isian manual.
            // Jika c.10 bukan Iya, field ini selalu tersembunyi.
            const internetLainnya = selectedWithin(card, "internetLainnya");
            const tampilkanInternetLainnya = memakaiInternet && internetLainnya === "1";
            toggleWithin(card, '[id^="internetLainnyaField"]', tampilkanInternetLainnya);
            if (!tampilkanInternetLainnya) {
                clearWithin(card, '[id^="internetLainnyaField"]');
            }

        });

        // -----------------------------------------------------
        // BLOK G — ASET: NILAI HANYA JIKA JUMLAH > 0
        // -----------------------------------------------------

        const assetConditions = [
            ["sepedaMotor", "nilaiMotorField"],
            ["mobil", "nilaiMobilField"],
            ["jumlahTanah", "nilaiTanahField"],
            ["jumlahBangunanLain", "nilaiBangunanLainField"]
        ];

        assetConditions.forEach(([quantityId, valueFieldId]) => {
            const quantity = Number(
                document.getElementById(quantityId)?.value || 0
            );
            const showValue = Number.isFinite(quantity) && quantity > 0;

            toggle(valueFieldId, showValue);

            if (!showValue) {
                clearConditionalData(valueFieldId);
            }
        });

        // -----------------------------------------------------
        // STATUS BADAN USAHA — KOPERASI
        // -----------------------------------------------------
        const statusBadanUsaha =
            document.getElementById("statusBadanUsaha")?.value || "";

        const isKoperasi =
            memilikiUsaha && statusBadanUsaha === "5";

        toggle("koperasiFields", isKoperasi);

        if (!isKoperasi) {
            clearConditionalData("koperasiFields");
        }

        // -----------------------------------------------------
        // INTERNET — TUJUAN PENGGUNAAN
        // -----------------------------------------------------
        const menggunakanInternet =
            selected("menggunakanInternet");

        const memakaiInternet =
            memilikiUsaha && menggunakanInternet === "1";

        toggle("tujuanPenggunaanInternet", memakaiInternet);

        if (!memakaiInternet) {
            clearConditionalData("tujuanPenggunaanInternet");
        }

        const internetLainnya =
            selected("internetLainnya");

        const tampilkanInternetLainnya =
            memakaiInternet && internetLainnya === "1";

        toggle("internetLainnyaField", tampilkanInternetLainnya);

        if (!tampilkanInternetLainnya) {
            clearConditionalData("internetLainnyaField");
        }

        // -----------------------------------------------------
        // KELUHAN KESEHATAN — LAINNYA
        const keluhanLainnya =
            document.querySelector('input[name="keluhan_Lainnya"]:checked')?.value || "";

        toggle(
            "keluhanKesehatanLainnyaField",
            keluhanLainnya === "Ya"
        );

        if (keluhanLainnya !== "Ya") {
            clearConditionalData("keluhanKesehatanLainnyaField");
        }

        // -----------------------------------------------------
        // STATUS KEPEMILIKAN RUMAH
        // -----------------------------------------------------

        // -----------------------------------------------------

        const statusKepemilikan =
            document.getElementById("statusKepemilikanRumah")?.value;

        toggle(
            "statusKepemilikanLainnyaField",
            statusKepemilikan === "29"
        );

        toggle(
            "nilaiKontrakSewaField",
            statusKepemilikan === "26"
        );

        toggle(
            "perkiraanSewaBebasSendiriField",
            statusKepemilikan === "27" || statusKepemilikan === "28"
        );

        if (statusKepemilikan !== "29") {
            clearConditionalData("statusKepemilikanLainnyaField");
        }

        if (statusKepemilikan !== "26") {
            clearConditionalData("nilaiKontrakSewaField");
        }

        if (statusKepemilikan !== "27" && statusKepemilikan !== "28") {
            clearConditionalData("perkiraanSewaBebasSendiriField");
        }

        // -----------------------------------------------------
        // KK LAIN
        // -----------------------------------------------------

        const n =
            Number(
                document.getElementById("jumlahKKLain")?.value || 0
            );

        const container =
            document.getElementById("kkLainContainer");

        if (container) {
            container.classList.toggle("hidden", n === 0);

            [
                ...container.querySelectorAll("[data-kk-row]")
            ].forEach((row, i) => {
                const show = i < n;

                row.classList.toggle("hidden", !show);

                row.querySelectorAll("input").forEach(inp => {
                    inp.disabled = !show;

                    if (!show) {
                        inp.value = "";
                        inp.checked = false;
                    }
                });
            });
        }

        // -----------------------------------------------------
        // PLN
        // -----------------------------------------------------

        const listrik =
            document.getElementById("sumberPenerangan")?.value;

        const plnDenganMeteran = listrik === "91";
        const memakaiListrik = ["91", "92", "93"].includes(listrik);

        [
            "jumlahMeteranField",
            "dayaListrikField",
            "idPelangganPLNField",
            "noMeteranListrikField"
        ].forEach(id => {
            toggle(id, plnDenganMeteran);

            if (!plnDenganMeteran) {
                clearConditionalData(id);
            }
        });

        toggle("pengeluaranListrikField", memakaiListrik);

        if (!memakaiListrik) {
            clearConditionalData("pengeluaranListrikField");
        }
    }


    // =========================================================
    // CALCULATE AGE
    // =========================================================

    function calculateAge() {

        const dob =
            document.getElementById(
                "tanggalLahir"
            );


        const age =
            document.getElementById(
                "umur"
            );


        if (
            !dob ||
            !age ||
            !dob.value
        ) {
            return;
        }


        const birth =
            new Date(
                `${dob.value}T00:00:00`
            );


        const today =
            new Date();


        let years =
            today.getFullYear() -
            birth.getFullYear();


        const beforeBirthday =
            today.getMonth() <
                birth.getMonth() ||
            (
                today.getMonth() ===
                    birth.getMonth() &&
                today.getDate() <
                    birth.getDate()
            );


        if (beforeBirthday) {
            years--;
        }


        age.value =
            Math.max(
                0,
                years
            );
    }


    // =========================================================
    // CALCULATE TOTALS
    // =========================================================

    function calculateTotals() {

        const sum =
            ids => {

                return ids.reduce(
                    (total, id) => {

                        return (
                            total +
                            getNumberValue(
                                id
                            )
                        );

                    },
                    0
                );
            };


        const total =
            document.getElementById(
                "totalPengeluaran2025"
            );


        if (total) {

            total.value = formatRupiah(sum([
                "upah2025",
                "produksi2025",
                "pembelian2025",
                "operasional2025",
                "nonOperasional2025"
            ]));
        }


        const totalPendapatanPekerjaan =
            document.getElementById("totalPendapatanPekerjaan");

        if (totalPendapatanPekerjaan) {
            totalPendapatanPekerjaan.value = formatRupiah(sum([
                "upahGajiPekerjaan",
                "tunjanganPekerjaan",
                "uangMakanPekerjaan",
                "honorPekerjaan",
                "lemburPekerjaan",
                "lainnyaPekerjaan"
            ]));
        }

        const totalPendapatanKeuntunganUsaha =
            document.getElementById("pendapatanKeuntunganUsaha");

        // Nilai usaha hanya merupakan field detail, bukan penjumlahan.
        // Dibiarkan mengikuti input responden.

        document.querySelectorAll(".usaha-identity-card").forEach(card => {
            const sumCard = ids => ids.reduce((t, base) => {
                const input = card.querySelector(`[id^="${base}"]`);
                return t + parseCurrency(input?.value || "");
            }, 0);
            const setCardTotal = (base, ids) => {
                const input = card.querySelector(`[id^="${base}"]`);
                if (input) input.value = formatRupiah(sumCard(ids));
            };
            setCardTotal("totalPengeluaran2025", ["upah2025","produksi2025","pembelian2025","operasional2025","nonOperasional2025"]);
            setCardTotal("totalPendapatan2025", ["pendapatan2025","pendapatanLain2025"]);
            setCardTotal("totalPengeluaranBulan", ["upahBulan","produksiBulan","pembelianBulan","operasionalBulan","nonOperasionalBulan"]);
            setCardTotal("totalPendapatanBulan", ["pendapatanBulan","pendapatanLainBulan"]);
        });

        const totalBulan =
            document.getElementById(
                "totalPendapatanBulan"
            );


        if (totalBulan) {

            totalBulan.value = formatRupiah(sum([
                "pendapatanBulan",
                "pendapatanLainBulan"
            ]));
        }
    }


    // =========================================================
    // UPDATE ALL
    // =========================================================

    function updateAll() {

        calculateAge();

        calculateTotals();
        formatTotalInputs();

        updateConditionalFields();

        document
            .querySelectorAll(
                ".checkbox-dropdown"
            )
            .forEach(
                d => {

                    d._updateSelectedText?.();
                }
            );
    }


    // =========================================================
    // INPUT NORMALIZATION
    // =========================================================

    form.querySelectorAll(
        'input[inputmode="numeric"], input[type="number"]'
    ).forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    if (
                        input.id.startsWith("persentaseOnline")
                    ) {

                        const digits = input.value.replace(/[^0-9]/g, "");
                        let percentage = digits === "" ? "" : parseInt(digits, 10);
                        if (percentage !== "" && percentage > 100) percentage = 100;
                        input.value = percentage === "" ? "" : String(percentage);

                    } else if (
                        input.type ===
                        "number"
                    ) {

                        input.value =
                            input.value.replace(
                                /[^0-9]/g,
                                ""
                            );

                        if (input.id.startsWith("jumlahUsaha_")) {
                            const parsed = Number.parseInt(input.value || "", 10);
                            if (Number.isFinite(parsed) && parsed < 1) {
                                input.value = "";
                            }
                        }
                    }


                    updateAll();

                    scheduleSave();
                }
            );
        }
    );


    // =========================================================
    // INISIALISASI REVISI DINAMIS
    // =========================================================

    restructureIdentityBusinessTemplate();
    setupUsahaQuantityFields();
    setupPertanianMatrixUI();

    const nibInput = document.getElementById("nib");
    nibInput?.addEventListener("input", () => {
        nibInput.value = nibInput.value
            .replace(/\D/g, "")
            .slice(0, 13);
        updateAll();
    });

    // =========================================================
    // FORM INPUT / CHANGE
    // =========================================================

    form.addEventListener(
        "input",
        (event) => {
            const target = event.target;

            // NIB is numeric and must never exceed 13 characters, including
            // dynamically generated usaha_2, usaha_3, etc.
            if (target?.matches?.('input[id^="nib"]')) {
                target.value = target.value
                    .replace(/\D/g, "")
                    .slice(0, 13);
            }

            updateAll();

            scheduleSave();
        }
    );


    form.addEventListener(
        "change",
        (event) => {

            const card = event.target.closest?.(".usaha-identity-card");
            if (card && event.target.name?.startsWith("lokasiUsaha")) {
                }

            updateAll();

            scheduleSave();
        }
    );


    // =========================================================
    // NEXT BUTTON
    // =========================================================

    document
        .querySelectorAll(
            ".next-btn"
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        if (
                            !validateStep(
                                currentStep
                            )
                        ) {
                            return;
                        }


                        saveDraft(
                            "✓ Data tersimpan"
                        );


                        showStep(
                            currentStep + 1
                        );
                    }
                );
            }
        );


    // =========================================================
    // PREVIOUS BUTTON
    // =========================================================

    document
        .querySelectorAll(
            ".prev-btn"
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        saveDraft(
                            "✓ Data tersimpan"
                        );


                        showStep(
                            currentStep - 1
                        );
                    }
                );
            }
        );


    // =========================================================
    // SUBMIT
    // =========================================================

        // =========================================================
    // SUBMIT CONFIRMATION + SINGLE SUBMISSION
    // =========================================================

    const submitConfirmationModal =
        document.getElementById("submitConfirmationModal");
    const cancelSubmitConfirmation =
        document.getElementById("cancelSubmitConfirmation");
    const confirmSubmitData =
        document.getElementById("confirmSubmitData");

    let submissionInProgress = false;

    function validateAllForm() {
        let firstInvalidStep = -1;

        steps.forEach((_, index) => {
            const stepValid = validateStep(index);
            if (!stepValid && firstInvalidStep === -1) {
                firstInvalidStep = index;
            }
        });

        if (firstInvalidStep === -1) return true;

        showStep(firstInvalidStep);
        const firstInvalid =
            steps[firstInvalidStep]?.querySelector(".invalid, .invalid-group");
        firstInvalid?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        firstInvalid?.focus?.();

        return false;
    }

    function openSubmitConfirmation() {
        if (!submitConfirmationModal) return;
        if (confirmSubmitData) {
            confirmSubmitData.disabled = submissionInProgress;
        }
        submitConfirmationModal.classList.remove("hidden");
        document.body.classList.add("submit-modal-open");
        confirmSubmitData?.focus();
    }

    function closeSubmitConfirmation() {
        submitConfirmationModal?.classList.add("hidden");
        document.body.classList.remove("submit-modal-open");
        if (!submissionInProgress && confirmSubmitData) {
            confirmSubmitData.disabled = false;
        }
    }

    cancelSubmitConfirmation?.addEventListener("click", () => {
        if (!submissionInProgress) {
            closeSubmitConfirmation();
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (submissionInProgress) return;

        updateAll();

        // Submit selalu memvalidasi seluruh kuesioner terlebih dahulu.
        if (!validateAllForm()) {
            return;
        }

        openSubmitConfirmation();
    });

    confirmSubmitData?.addEventListener("click", async () => {
        if (submissionInProgress) {
            return;
        }

        submissionInProgress = true;
        confirmSubmitData.disabled = true;
        closeSubmitConfirmation();

        // =========================================================
        // SUBMIT ACTUAL — data hanya dikirim setelah konfirmasi.
        // =========================================================
            updateAll();


            const submitButton =
                form.querySelector(
                    "button[type=submit]"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.dataset.originalText =
                    submitButton.innerHTML;

                submitButton.innerHTML =
                    "Menyimpan…";
            }


            try {

                const fd =
                    new FormData();


                // NIM berasal dari responden yang sedang mengisi.
                // Jawaban kuesioner tidak diambil dari draft/localStorage.
                const nim = String(
                    activeNIM ||
                    document.getElementById("nim")?.value ||
                    ""
                ).trim();


                if (!nim) {

                    throw new Error(
                        "NIM responden tidak ditemukan. Kembali ke Tempat Tinggal lalu lanjutkan lagi."
                    );
                }


                // =================================================
                // KIRIM NIM
                // =================================================

                fd.append(
                    "nim",
                    nim
                );


                // =================================================
                // KIRIM DATA KUESIONER
                // =================================================

                fd.append(
                    "questionnaire",
                    JSON.stringify(
                        collectData()
                    )
                );


                // =================================================
                // FOTO
                // =================================================

                [
                    "fotoDepan",
                    "fotoRuangTamu"
                ].forEach(
                    id => {

                        const input =
                            document.getElementById(
                                id
                            );


                        if (
                            input?.files?.[0]
                        ) {

                            fd.append(
                                id,
                                input.files[0]
                            );
                        }
                    }
                );


                // =================================================
                // SUBMIT KE SERVER
                // =================================================

                const response =
                    await fetch(
                        "api/submit.php",
                        {
                            method: "POST",
                            body: fd
                        }
                    );


                const result =
                    await response
                        .json()
                        .catch(
                            () => ({
                                success: false,
                                message:
                                    "Respons server tidak valid."
                            })
                        );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Data gagal disimpan."
                    );
                }


                // =================================================
                // SETELAH SUBMIT: BUKA DOKUMEN BUKTI PENGISIAN
                // =================================================
                // Dokumen hanya memuat data registrasi awal + tanggal/waktu
                // submit. Jawaban Form 3 tetap tersimpan di database, tetapi
                // tidak ditampilkan di dokumen bukti.
                if (result.document_url) {
                    window.location.href = result.document_url;
                    return;
                }

                // Fallback jika URL dokumen tidak dikirim server.
                form.classList.add(
                    "hidden"
                );


                document
                    .getElementById(
                        "stepQuestionnaire"
                    )
                    ?.classList.add(
                        "hidden"
                    );


                document
                    .querySelector(
                        ".progress-container"
                    )
                    ?.classList.add(
                        "hidden"
                    );


                document
                    .getElementById(
                        "confirmBox"
                    )
                    ?.classList.remove(
                        "hidden"
                    );

                const successName =
                    result.profile?.nama ||
                    document.getElementById("nama")?.value ||
                    "Responden";

                const successNameEl =
                    document.getElementById("successRespondentName");

                if (successNameEl) {
                    successNameEl.textContent = successName;
                }


                const detail =
                    document.getElementById(
                        "confirmDetail"
                    );


                if (detail) {

                    detail.innerHTML = `

                        <div class="confirmation-row">
                            <span>Nama</span>
                            <span>
                                ${escapeHtml(
                                    result.profile?.nama ||
                                    "Responden"
                                )}
                            </span>
                        </div>

                        <div class="confirmation-row">
                            <span>NIM</span>
                            <span>
                                ${escapeHtml(
                                    result.profile?.nim ||
                                    nim ||
                                    "-"
                                )}
                            </span>
                        </div>

                        <div class="confirmation-row">
                            <span>Fakultas</span>
                            <span>
                                ${escapeHtml(
                                    result.profile?.fakultas ||
                                    "-"
                                )}
                            </span>
                        </div>

                        <div class="confirmation-row">
                            <span>Program Studi</span>
                            <span>
                                ${escapeHtml(
                                    result.profile?.program_studi ||
                                    "-"
                                )}
                            </span>
                        </div>

                        <div class="confirmation-row">
                            <span>ID Pengiriman</span>
                            <span>
                                ${escapeHtml(
                                    result.submission_id
                                )}
                            </span>
                        </div>

                    `;
                }


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


            } catch (err) {

                console.error(
                    err
                );


                alert(
                    err.message ||
                    "Data gagal disimpan. Silakan coba lagi."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        submitButton.dataset.originalText ||
                        "Kirim Data";
                }

                submissionInProgress = false;
            }
    });



    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    // =========================================================
    // BEFORE UNLOAD
    // =========================================================

    window.addEventListener(
        "beforeunload",
        () => {

            if (!restoring) {

                clearTimeout(
                    saveTimer
                );
                clearTimeout(serverSaveTimer);

                // Tidak ada autosave jawaban kuesioner.
            }
        }
    );


    // =========================================================
    // INITIALIZATION
    // =========================================================

    setupCheckboxDropdowns();
    setupCurrencyInputs();
    setupBirthDateValidation();


    // =========================================================
    // JANGAN PANGGIL restoreDraft() DI SINI
    //
    // Draft hanya boleh direstore setelah NIM aktif
    // melalui openQuestionnaire().
    // =========================================================

    currentStep = 0;


    if (steps.length) {

        steps.forEach(
            (step, i) => {

                step.classList.toggle(
                    "active",
                    i === 0
                );

                step.classList.toggle(
                    "hidden",
                    i !== 0
                );

                step.style.display =
                    i === 0
                        ? "block"
                        : "none";

                step.setAttribute(
                    "aria-hidden",
                    i === 0
                        ? "false"
                        : "true"
                );
            }
        );
    }


    updateAll();

});


