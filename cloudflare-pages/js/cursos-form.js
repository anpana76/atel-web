const form = document.getElementById("training-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const langSelect = document.getElementById("language-select");
const LANGUAGE_STORAGE_KEY = "atelLanguage";

function trackEvent(eventName, options = {}) {
    if (typeof window.atelTrack !== "function") {
        return;
    }
    window.atelTrack(eventName, options);
}

function getSafeLang(lang) {
    if (typeof translations !== "object" || !translations) {
        return "es";
    }
    if (lang && translations[lang]) {
        return lang;
    }
    return "es";
}

function getCurrentLang() {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const selectLang = langSelect ? langSelect.value : "";
    return getSafeLang(stored || selectLang || "es");
}

function t(key) {
    const lang = getCurrentLang();
    if (typeof getTranslation === "function") {
        return getTranslation(lang, key);
    }
    if (translations?.[lang]?.[key]) {
        return translations[lang][key];
    }
    return key;
}

function setPageLanguage(lang) {
    const safeLang = getSafeLang(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLang);

    if (langSelect) {
        langSelect.value = safeLang;
    }

    document.documentElement.lang = safeLang;
    document.documentElement.setAttribute("dir", safeLang === "ar" ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key) {
            el.textContent = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key) {
            el.setAttribute("placeholder", t(key));
        }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        if (key) {
            el.setAttribute("aria-label", t(key));
        }
    });

    document.title = t("training-page-title");
}

function getFormspreeFormId() {
    if (!window.ATEL_CONFIG) {
        return "";
    }
    return String(window.ATEL_CONFIG.FORMSPREE_FORM_ID || "").trim();
}

function getContactEmail() {
    if (!window.ATEL_CONFIG) {
        return "atel@atelsistems.com";
    }
    return String(window.ATEL_CONFIG.CONTACT_EMAIL || "atel@atelsistems.com").trim();
}

function buildMailtoLink(payload) {
    const contactEmail = getContactEmail();
    const subject = "Solicitud de formación a medida - ATEL";
    const bodyLines = [
        `Nombre: ${String(payload.nombre || "")}`,
        `Empresa/comunidad: ${String(payload.empresa || "")}`,
        `Email: ${String(payload.email || "")}`,
        `Telefono: ${String(payload.telefono || "")}`,
        `Perfil: ${String(payload.perfil || "")}`,
        `Interes: ${String(payload.interes || "")}`,
        "",
        "Necesidades:",
        String(payload.mensaje || ""),
    ];

    const body = bodyLines.join("\n");
    return `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setFieldError(field, message) {
    field.setCustomValidity(message);
    field.reportValidity();
    field.focus();
}

function clearFieldErrors(formElement) {
    ["nombre", "empresa", "email", "telefono", "perfil", "interes", "mensaje"].forEach((fieldName) => {
        const field = formElement.elements.namedItem(fieldName);
        if (field && typeof field.setCustomValidity === "function") {
            field.setCustomValidity("");
        }
    });
}

function validateTrainingFields(formElement) {
    clearFieldErrors(formElement);

    const nameField = formElement.elements.namedItem("nombre");
    const emailField = formElement.elements.namedItem("email");
    const phoneField = formElement.elements.namedItem("telefono");
    const profileField = formElement.elements.namedItem("perfil");
    const interestField = formElement.elements.namedItem("interes");
    const messageField = formElement.elements.namedItem("mensaje");

    const nameValue = String(nameField?.value || "").trim();
    const emailValue = String(emailField?.value || "").trim();
    const phoneValue = String(phoneField?.value || "").trim();
    const profileValue = String(profileField?.value || "").trim();
    const interestValue = String(interestField?.value || "").trim();
    const messageValue = String(messageField?.value || "").trim();

    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'\-\s]{4,120}$/.test(nameValue)) {
        setFieldError(nameField, t("training-error-name"));
        return false;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(emailValue)) {
        setFieldError(emailField, t("training-error-email"));
        return false;
    }

    const digits = phoneValue.replace(/\D/g, "");
    if (!/^[+()\-\s\d]{8,25}$/.test(phoneValue) || digits.length < 9 || digits.length > 15) {
        setFieldError(phoneField, t("training-error-phone"));
        return false;
    }

    if (profileValue.length < 2) {
        setFieldError(profileField, t("training-error-profile"));
        return false;
    }

    if (interestValue.length < 2) {
        setFieldError(interestField, t("training-error-interest"));
        return false;
    }

    if (messageValue.length < 30 || messageValue.split(/\s+/).filter(Boolean).length < 6) {
        setFieldError(messageField, t("training-error-message"));
        return false;
    }

    return true;
}

if (form && statusEl && submitBtn) {
    const initialLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || (langSelect ? langSelect.value : "es");
    setPageLanguage(initialLang);

    if (langSelect) {
        langSelect.addEventListener("change", (event) => {
            setPageLanguage(event.target.value);
            trackEvent("language_change", {
                elementId: "language-select",
                elementText: event.target.value,
            });
        });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        statusEl.textContent = "";
        statusEl.className = "form-status";

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!validateTrainingFields(form)) {
            return;
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="bi bi-hourglass-split" aria-hidden="true"></i> ${t("training-submit-sending")}`;

        try {
            const formspreeFormId = getFormspreeFormId();

            if (!formspreeFormId) {
                window.location.href = buildMailtoLink(payload);
                statusEl.textContent = `✅ ${t("training-status-prepared")}`;
                statusEl.classList.add("success");
                return;
            }

            const response = await fetch(`https://formspree.io/f/${formspreeFormId}`, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "Accept": "application/json",
                },
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || t("training-error-generic"));
            }

            statusEl.textContent = `✅ ${t("training-status-success")}`;
            statusEl.classList.add("success");
            form.reset();
            trackEvent("training_form_submit_success", {
                elementId: "training-form",
                pagePath: "/cursos/solicitud",
            });
        } catch (error) {
            statusEl.textContent = `❌ ${String(error.message || t("training-error-generic"))}`;
            statusEl.classList.add("error");
            trackEvent("training_form_submit_error", {
                elementId: "training-form",
                pagePath: "/cursos/solicitud",
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send-fill" aria-hidden="true"></i> ${t("training-submit")}`;
        }
    });
}
