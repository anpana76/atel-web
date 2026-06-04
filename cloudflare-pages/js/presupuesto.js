const form = document.getElementById("budget-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const langSelect = document.getElementById("language-select");
const LANGUAGE_STORAGE_KEY = "atelLanguage";
const backLink = document.querySelector(".back-link");

function centerBudgetCardOnLoad() {
    const budgetCard = document.querySelector(".budget-card");
    if (!budgetCard || !window.matchMedia("(min-width: 769px)").matches) {
        return;
    }

    const header = document.querySelector(".budget-header");
    const headerHeight = header ? header.offsetHeight : 0;
    const rect = budgetCard.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const desiredTop = window.scrollY + rect.top - (viewportHeight * 0.35) + (rect.height * 0.45) - (headerHeight * 0.2);

    window.scrollTo({
        top: Math.max(0, Math.round(desiredTop)),
        behavior: "auto",
    });
}

window.addEventListener("load", () => {
    window.requestAnimationFrame(centerBudgetCardOnLoad);
});

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.requestAnimationFrame(centerBudgetCardOnLoad);
    }
});

// Envoltura de telemetría defensiva: evita errores si analytics no está disponible.
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
    const subject = "Solicitud de presupuesto - ATEL";
    const bodyLines = [
        `Nombre: ${String(payload.nombre || "")}`,
        `Empresa: ${String(payload.empresa || "")}`,
        `Email: ${String(payload.email || "")}`,
        `Telefono: ${String(payload.telefono || "")}`,
        `Servicio: ${String(payload.servicio || "")}`,
        "",
        "Mensaje:",
        String(payload.mensaje || ""),
    ];

    const body = bodyLines.join("\n");
    return `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Resolve de traducciones con fallback robusto para claves faltantes.
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
        if (!key) {
            return;
        }
        el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (!key) {
            return;
        }
        el.setAttribute("placeholder", t(key));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        if (!key) {
            return;
        }
        el.setAttribute("aria-label", t(key));
    });

    document.title = t("budget-page-title");

    // Si había un estado visible, lo limpiamos al cambiar de idioma para evitar mezcla de idiomas.
    if (statusEl) {
        statusEl.textContent = "";
        statusEl.className = "form-status";
    }
}

// Heurísticas simples para bloquear texto aleatorio y spam básico.
function appearsRandomText(value) {
    const cleaned = value.replace(/\s+/g, "").toLowerCase();
    if (cleaned.length < 6) {
        return false;
    }

    const hasLetters = /[a-záéíóúüñ]/i.test(cleaned);
    const hasNumbers = /\d/.test(cleaned);
    if (/^[a-z0-9]+$/i.test(cleaned) && hasLetters && hasNumbers) {
        return true;
    }

    return ["asdf", "qwerty", "zxcv", "12345", "abc123", "test", "prueba"].includes(cleaned);
}

function setFieldError(field, message) {
    field.setCustomValidity(message);
    field.reportValidity();
    field.focus();
}

function clearFieldErrors(formElement) {
    ["nombre", "empresa", "email", "telefono", "servicio", "mensaje"].forEach((fieldName) => {
        const field = formElement.elements.namedItem(fieldName);
        if (field && typeof field.setCustomValidity === "function") {
            field.setCustomValidity("");
        }
    });
}

// Validación de calidad de datos orientada a leads reales (no solo formato).
function validateBusinessFields(formElement) {
    clearFieldErrors(formElement);

    const nameField = formElement.elements.namedItem("nombre");
    const companyField = formElement.elements.namedItem("empresa");
    const emailField = formElement.elements.namedItem("email");
    const phoneField = formElement.elements.namedItem("telefono");
    const serviceField = formElement.elements.namedItem("servicio");
    const messageField = formElement.elements.namedItem("mensaje");

    const nameValue = String(nameField?.value || "").trim();
    const companyValue = String(companyField?.value || "").trim();
    const emailValue = String(emailField?.value || "").trim();
    const phoneValue = String(phoneField?.value || "").trim();
    const serviceValue = String(serviceField?.value || "").trim();
    const messageValue = String(messageField?.value || "").trim();

    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'\-\s]{4,120}$/.test(nameValue) || nameValue.split(/\s+/).filter((part) => part.length >= 2).length < 2 || appearsRandomText(nameValue)) {
        setFieldError(nameField, t("budget-error-name"));
        return false;
    }

    if (companyValue && appearsRandomText(companyValue)) {
        setFieldError(companyField, t("budget-error-company"));
        return false;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(emailValue)) {
        setFieldError(emailField, t("budget-error-email"));
        return false;
    }

    const digits = phoneValue.replace(/\D/g, "");
    if (!/^[+()\-\s\d]{8,25}$/.test(phoneValue) || digits.length < 9 || digits.length > 15) {
        setFieldError(phoneField, t("budget-error-phone"));
        return false;
    }

    if (serviceValue.length < 3 || appearsRandomText(serviceValue)) {
        setFieldError(serviceField, t("budget-error-service"));
        return false;
    }

    if (messageValue.length < 20 || messageValue.split(/\s+/).filter(Boolean).length < 4 || appearsRandomText(messageValue)) {
        setFieldError(messageField, t("budget-error-message"));
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

    if (backLink) {
        backLink.addEventListener("click", () => {
            trackEvent("cta_click", {
                elementId: "back-link",
                elementText: "volver-web",
            });
        });
    }

    let budgetFormStarted = false;
    const trackedStepFields = new Set();

    // Marca hitos de avance del formulario una sola vez por campo.
    function trackFieldStep(fieldName) {
        if (!fieldName || trackedStepFields.has(fieldName)) {
            return;
        }

        const field = form.elements.namedItem(fieldName);
        if (!field) {
            return;
        }

        const rawValue = String(field.value || "").trim();
        if (!rawValue) {
            return;
        }

        trackedStepFields.add(fieldName);
        trackEvent("budget_step_complete", {
            elementId: fieldName,
            pagePath: "/presupuesto",
        });
    }
    // Primer input del usuario: útil para métricas de abandono.
    form.addEventListener("input", () => {
        if (budgetFormStarted) {
            return;
        }
        budgetFormStarted = true;
        trackEvent("budget_form_start", {
            elementId: "budget-form",
            pagePath: "/presupuesto",
        });
    }, { once: false });

    ["nombre", "email", "telefono", "servicio", "mensaje"].forEach((fieldName) => {
        const field = form.elements.namedItem(fieldName);
        if (!field) {
            return;
        }
        field.addEventListener("blur", () => {
            trackFieldStep(fieldName);
        });
        field.addEventListener("change", () => {
            trackFieldStep(fieldName);
        });
    });

    const privacyField = form.elements.namedItem("acepta_privacidad");
    if (privacyField) {
        privacyField.addEventListener("change", () => {
            if (privacyField.checked) {
                trackEvent("budget_privacy_check", {
                    elementId: "acepta_privacidad",
                    pagePath: "/presupuesto",
                });
            }
        });
    }

    // Envío asíncrono con estado visual y protección anti doble envío.
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        statusEl.textContent = "";
        statusEl.className = "form-status";

        // Reutilizamos validación HTML5 nativa del navegador.
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!validateBusinessFields(form)) {
            return;
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        trackEvent("budget_form_submit_attempt", {
            elementId: "submit-btn",
            pagePath: "/presupuesto",
            metadata: {
                servicio: String(payload.servicio || "").slice(0, 60),
            },
        });

        // Bloquea doble envío mientras la petición está en curso.
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="bi bi-hourglass-split" aria-hidden="true"></i> ${t("budget-submit-sending")}`;

        try {
            const formspreeFormId = getFormspreeFormId();

            if (!formspreeFormId) {
                window.location.href = buildMailtoLink(payload);
                statusEl.textContent = "✅ Solicitud preparada en tu cliente de correo.";
                statusEl.classList.add("success");
                trackEvent("budget_form_submit_mailto_fallback", {
                    elementId: "budget-form",
                    pagePath: "/presupuesto",
                });
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
                throw new Error(result.error || t("budget-error-generic"));
            }

            statusEl.textContent = `✅ ${t("budget-status-success")}`;
            statusEl.classList.add("success");
            trackEvent("budget_form_submit_success", {
                elementId: "budget-form",
                pagePath: "/presupuesto",
                metadata: {
                    servicio: String(payload.servicio || "").slice(0, 60),
                },
            });
            form.reset();
            budgetFormStarted = false;
            trackedStepFields.clear();
        } catch (error) {
            statusEl.textContent = `❌ ${error.message}`;
            statusEl.classList.add("error");
            trackEvent("budget_form_submit_error", {
                elementId: "budget-form",
                pagePath: "/presupuesto",
                metadata: {
                    reason: String(error.message || "error").slice(0, 120),
                },
            });
        } finally {
            // Restaura estado del botón al terminar (éxito o error).
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send-fill" aria-hidden="true"></i> ${t("budget-submit")}`;
        }
    });
}
