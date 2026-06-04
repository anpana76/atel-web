// ---------------------------
// Inicializar baguetteBox.js para todas las galerías
// ---------------------------
window.addEventListener("DOMContentLoaded", function() {
    if (typeof baguetteBox !== "undefined") {
        baguetteBox.run('.gallery', {
            animation: 'fade',
            noScrollbars: true,
        });
    }
});
// ---------------------------
// MAIN.JS - Funcionalidad web ATEL SISTEMS
// ---------------------------
// Las traducciones se cargan desde translations.js

// ---------------------------
// Función que cambia el idioma
// ---------------------------
const LANGUAGE_STORAGE_KEY = "atelLanguage";
const INTENT_STORAGE_KEY = "atelIntentProfileV1";

function isReloadNavigation() {
    try {
        const entries = performance.getEntriesByType("navigation");
        if (entries && entries.length > 0) {
            return entries[0].type === "reload";
        }
    } catch (error) {
        // Fallback legacy API.
    }

    return typeof performance.navigation === "object" && performance.navigation.type === 1;
}

function scrollToHeroOnReload() {
    if (!isReloadNavigation()) {
        return;
    }

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    const hero = document.querySelector(".hero");
    const rootStyles = getComputedStyle(document.documentElement);
    const navbarHeight = parseInt(rootStyles.getPropertyValue("--navbar-height"), 10) || 96;
    const targetTop = hero
        ? hero.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + 8)
        : 0;

    window.requestAnimationFrame(() => {
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    });
}

window.addEventListener("load", scrollToHeroOnReload);

function isHomePathname(pathname) {
    return pathname === "/" || pathname === "/index.html";
}

function cameFromAnotherPage() {
    if (!document.referrer) {
        return false;
    }

    try {
        const previousUrl = new URL(document.referrer);
        return previousUrl.origin === window.location.origin
            && previousUrl.pathname !== window.location.pathname;
    } catch (error) {
        return false;
    }
}

function isBackForwardNavigation() {
    try {
        const entries = performance.getEntriesByType("navigation");
        if (entries && entries.length > 0) {
            return entries[0].type === "back_forward";
        }
    } catch (error) {
        // Fallback legacy API.
    }

    return typeof performance.navigation === "object" && performance.navigation.type === 2;
}

function forceHomeTopOnPageEntry() {
    if (!isHomePathname(window.location.pathname) || window.location.hash) {
        return;
    }

    if (!cameFromAnotherPage() && !isBackForwardNavigation()) {
        return;
    }

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
}

window.addEventListener("pageshow", forceHomeTopOnPageEntry);
window.addEventListener("load", forceHomeTopOnPageEntry);

function getStoredIntent() {
    const value = String(localStorage.getItem(INTENT_STORAGE_KEY) || "").trim();
    return ["budget", "maintenance", "consulting"].includes(value) ? value : "";
}

function getCurrentLanguageForDynamicText() {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && translations[storedLang]) {
        return storedLang;
    }
    if (langSelect && translations[langSelect.value]) {
        return langSelect.value;
    }
    return "es";
}

function getIntentConfig(intent) {
    const map = {
        budget: {
            ctaKey: "cta-budget",
            helperKey: "intent-helper-budget",
            href: "presupuesto/"
        },
        maintenance: {
            ctaKey: "cta-maintenance",
            helperKey: "intent-helper-maintenance",
            href: "#servicios"
        },
        consulting: {
            ctaKey: "cta-consulting",
            helperKey: "intent-helper-consulting",
            href: "#contacto"
        }
    };

    return map[intent] || map.budget;
}

function updateIntentButtonsState(intent) {
    const intentButtons = Array.from(document.querySelectorAll(".intent-chip[data-intent]"));
    intentButtons.forEach((button) => {
        button.classList.toggle("is-active", button.getAttribute("data-intent") === intent);
    });
}

function updateIntentHelperText(intent) {
    const helper = document.getElementById("hero-intent-helper");
    if (!helper) {
        return;
    }

    const lang = getCurrentLanguageForDynamicText();
    const config = getIntentConfig(intent);
    const helperText = translateKey(lang, config.helperKey);
    const defaultText = translateKey(lang, "intent-helper-default");

    helper.textContent = helperText === config.helperKey ? defaultText : helperText;
}

function updateFloatingBudgetByIntent(intent, shouldTrack = false) {
    const floatingBudget = document.querySelector(".floating-budget");
    if (!floatingBudget) {
        return;
    }

    const normalizedIntent = ["budget", "maintenance", "consulting"].includes(intent) ? intent : "budget";
    const config = getIntentConfig(normalizedIntent);
    const lang = getCurrentLanguageForDynamicText();
    const textElement = floatingBudget.querySelector(".floating-budget-text");

    floatingBudget.setAttribute("href", config.href);
    floatingBudget.dataset.intent = normalizedIntent;

    const translatedText = translateKey(lang, config.ctaKey);
    const safeText = translatedText === config.ctaKey ? translateKey(lang, "hero-cta") : translatedText;

    floatingBudget.setAttribute("aria-label", safeText);
    if (textElement) {
        textElement.textContent = safeText;
    }

    if (shouldTrack) {
        trackEvent("personalized_cta_update", {
            elementId: "floating-budget",
            elementText: normalizedIntent,
            metadata: {
                href: config.href,
            },
        });
    }
}

function syncIntentUiWithLanguage() {
    const storedIntent = getStoredIntent();
    updateIntentButtonsState(storedIntent || "budget");
    updateIntentHelperText(storedIntent);
    updateFloatingBudgetByIntent(storedIntent || "budget", false);
}

function syncFeedbackBotInitialMessageWithLanguage(preferredLang = "") {
    const chatStream = document.getElementById("feedback-chat-stream");
    const initialMessageElement = chatStream?.querySelector("[data-i18n='feedback-initial-message']");
    if (!initialMessageElement) {
        return;
    }

    const lang = preferredLang && translations[preferredLang]
        ? preferredLang
        : getCurrentLanguageForDynamicText();

    const selectedIntent = getStoredIntent();
    const contextualKeyMap = {
        budget: "feedback-initial-message-budget",
        maintenance: "feedback-initial-message-maintenance",
        consulting: "feedback-initial-message-consulting",
    };

    const contextualKey = contextualKeyMap[selectedIntent] || "feedback-initial-message";
    const contextualText = translateKey(lang, contextualKey);
    initialMessageElement.textContent = contextualText === contextualKey
        ? translateKey(lang, "feedback-initial-message")
        : contextualText;
}

function syncLauncherButtonsLanguage(preferredLang = "") {
    const lang = preferredLang && translations[preferredLang]
        ? preferredLang
        : getCurrentLanguageForDynamicText();

    const launchers = [
        document.getElementById("feedback-bot-launcher"),
        document.getElementById("guide-bot-launcher"),
    ];

    launchers.forEach((launcher) => {
        if (!launcher) {
            return;
        }

        const textNode = launcher.querySelector("span[data-i18n]");
        const textKey = textNode?.getAttribute("data-i18n");
        if (textNode && textKey) {
            textNode.textContent = translateKey(lang, textKey);
        }

        const ariaKey = launcher.getAttribute("data-i18n-aria-label");
        if (ariaKey) {
            launcher.setAttribute("aria-label", translateKey(lang, ariaKey));
        }
    });
}

// Sanitización HTML básica para prevenir XSS en traducciones
function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Parser seguro de HTML con tags permitidos limitados
function sanitizeHtmlAllowMarkup(html) {
    const allowedTags = ['strong', 'b', 'em', 'i', 'a', 'p', 'br'];
    const allowedAttrs = ['href', 'target', 'rel', 'title'];
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const walk = (node) => {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i];
            if (child.nodeType === 1) { // Element
                const tagName = child.tagName.toLowerCase();
                if (!allowedTags.includes(tagName)) {
                    // Reemplazar tag por su contenido textual
                    const text = document.createTextNode(child.textContent);
                    node.replaceChild(text, child);
                } else {
                    // Limpiar atributos no permitidos
                    for (let attr of child.attributes) {
                        if (!allowedAttrs.includes(attr.name)) {
                            child.removeAttribute(attr.name);
                        }
                    }
                    // Si es <a href>, asegurar que sea http/https
                    if (tagName === 'a' && child.href) {
                        if (!child.href.startsWith('http://') && !child.href.startsWith('https://') && !child.href.startsWith('/')) {
                            child.removeAttribute('href');
                        }
                    }
                    walk(child);
                }
            }
        }
    };
    
    walk(temp);
    return temp.innerHTML;
}

function trackEvent(eventName, options = {}) {
    if (typeof window.atelTrack !== "function") {
        return;
    }
    window.atelTrack(eventName, options);
}

// Reporte centralizado de errores de frontend hacia backend para diagnóstico.
async function reportClientError(payload) {
    try {
        await fetch("/api/client-error", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        // Silencioso para no crear bucles ni ruido en UX.
    }
}

window.addEventListener("error", (event) => {
    const message = String(event.message || "Error JS").slice(0, 500);
    const stack = String(event.error?.stack || "").slice(0, 3500);
    reportClientError({
        source: "frontend",
        message,
        path: window.location.pathname,
        stack,
    });
});

window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = String(reason?.message || reason || "Unhandled Promise rejection").slice(0, 500);
    const stack = String(reason?.stack || "").slice(0, 3500);
    reportClientError({
        source: "frontend",
        message,
        path: window.location.pathname,
        stack,
    });
});

function translateKey(lang, key) {
    if (translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    if (translations.en && translations.en[key]) {
        return translations.en[key];
    }
    return key;
}

function setLanguage(lang) {
    // Itera sobre todos los elementos con data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
        // Si el nodo contiene hijos traducibles, no sobreescribir el contenedor completo.
        if (el.querySelector("[data-i18n]") && el !== el.querySelector("[data-i18n]")) {
            return;
        }

        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            // Usar textContent para prevenir XSS
            el.textContent = translations[lang][key];
        }
    });

    // Traduce bloques que contienen HTML (etiquetas <strong>, enlaces, etc.).
    // SOLO con data-i18n-html que es explícitamente para permitir markup
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        if (translations[lang] && translations[lang][key]) {
            const rawHtml = translations[lang][key];
            // Sanitizar para permitir solo tags seguros
            el.innerHTML = sanitizeHtmlAllowMarkup(rawHtml);
        }
    });

    // Traduce atributos aria-label declarados con data-i18n-aria-label.
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        if (!key) {
            return;
        }
        el.setAttribute("aria-label", translateKey(lang, key));
    });

    // Traduce atributos alt declarados con data-i18n-alt.
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
        const key = el.getAttribute("data-i18n-alt");
        if (!key) {
            return;
        }
        el.setAttribute("alt", translateKey(lang, key));
    });

    // Traduce placeholders declarados con data-i18n-placeholder.
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (!key) {
            return;
        }
        el.setAttribute("placeholder", translateKey(lang, key));
    });

    // Ajusta la dirección del texto (RTL para árabe)
    if(lang === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
    } else {
        document.documentElement.setAttribute("dir", "ltr");
    }

    document.documentElement.setAttribute("lang", lang);

    syncIntentUiWithLanguage();
    syncFeedbackBotInitialMessageWithLanguage(lang);
    syncLauncherButtonsLanguage(lang);

    document.dispatchEvent(new CustomEvent("atel:language-changed", {
        detail: { lang },
    }));
}

// ---------------------------
// Manejo de cambio de idioma desde el select
// ---------------------------
const langSelect = document.getElementById("language-select");
if(langSelect){
    langSelect.addEventListener("change", e => {
        const selectedLang = e.target.value;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLang);
        setLanguage(selectedLang);
        trackEvent("language_change", {
            elementId: "language-select",
            elementText: selectedLang,
        });
    });

    // Inicializar idioma guardado o valor por defecto del selector.
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const initialLang = savedLang && translations[savedLang] ? savedLang : (langSelect.value || "es");
    langSelect.value = initialLang;
    setLanguage(initialLang);
}

// ---------------------------
// Acordeón de servicios con animación
// ---------------------------
function toggleAccordion(element, options = {}){
    const { skipAutoScroll = false } = options;
    const items = document.querySelectorAll(".accordion-item");
    items.forEach(item => {
        if(item !== element) item.classList.remove("active");
    });

    const isOpening = !element.classList.contains("active");
    element.classList.toggle("active");

    if (isOpening && !skipAutoScroll) {
        setTimeout(() => {
            centerElementInViewport(element);
        }, 120);
    }
}

function centerElementInViewport(element) {
    if (!element) {
        return;
    }

    const navbar = document.querySelector(".navbar");
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const desiredTop = window.scrollY + rect.top - (viewportHeight * 0.5) + (rect.height * 0.5) - (navbarHeight * 0.5);
    const top = Math.max(0, Math.round(desiredTop));

    window.scrollTo({
        top,
        behavior: "smooth",
    });
}

function closeOffscreenAccordions() {
    const activeItems = document.querySelectorAll(".accordion-item.active");
    if (!activeItems.length) {
        return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const upperBoundary = viewportHeight * 0.25;
    const lowerBoundary = viewportHeight * 0.75;

    activeItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const isStillVisible = rect.bottom > upperBoundary && rect.top < lowerBoundary;

        if (!isStillVisible) {
            item.classList.remove("active");
        }
    });
}

let accordionScrollRafId = null;

function scheduleAccordionScrollCheck() {
    if (accordionScrollRafId !== null) {
        return;
    }

    accordionScrollRafId = window.requestAnimationFrame(() => {
        accordionScrollRafId = null;
        closeOffscreenAccordions();
    });
}

window.addEventListener("scroll", scheduleAccordionScrollCheck, { passive: true });

// ---------------------------
// Con animación suave para abrir/cerrar
// ---------------------------
document.querySelectorAll(".accordion-item .accordion-header").forEach(header => {
    header.addEventListener("click", e => {
        const item = header.parentElement;
        const title = header.querySelector("[data-i18n]")?.textContent || header.textContent || "";
        trackEvent("accordion_toggle", {
            elementId: item?.id || "accordion-item",
            elementText: title,
        });
        toggleAccordion(item);
    });
});

// Mostrar el primer bloque de servicios al cargar para evitar apariencia de sección vacía.
// const firstServiceAccordion = document.querySelector("#servicios .accordion-item");
// if (firstServiceAccordion) {
//     // firstServiceAccordion.classList.add("active");
// }
function initServicesImageRotation() {
    const serviceImages = document.querySelectorAll("#servicios .content-image img, #productos .content-image img, #empresa .content-image img");
    if (!serviceImages.length) {
        return;
    }

    const controllers = [];

    const syncApi = {
        pauseAll: () => {
            controllers.forEach((controller) => controller.pause());
        },
        resumeAll: () => {
            controllers.forEach((controller) => controller.resume());
        },
        focusByAccordion: (accordionElement) => {
            if (!accordionElement) {
                return;
            }

            const matchedController = controllers.find((controller) => controller.accordionElement === accordionElement);
            if (!matchedController) {
                return;
            }

            matchedController.focusImage();
        },
    };

    window.ATEL_SERVICE_IMAGE_ROTATION = syncApi;

    serviceImages.forEach((img, index) => {
        const imageWrapper = img.closest(".content-image");
        if (!imageWrapper) {
            return;
        }

        const accordionElement = img.closest(".accordion-item");

        const rawSources = String(
            img.getAttribute("data-images") ||
            img.getAttribute("data-gallery-sources") ||
            img.getAttribute("src") ||
            ""
        );
        const imageList = rawSources
            .split(",")
            .map((value) => value.trim().replace(/\/+$/g, ""))
            .filter(Boolean);

        if (!imageList.length) {
            return;
        }

        // Garantiza que el src inicial sea válido aunque el atributo tenga varias rutas.
        img.setAttribute("src", imageList[0]);

        if (imageList.length === 1) {
            return;
        }

        imageList.forEach((url) => {
            const preload = new Image();
            preload.src = url;
        });

        let currentIndex = 0;
        const intervalMs = 4500 + (index * 350);

        const showImageAtIndex = (targetIndex) => {
            currentIndex = (targetIndex + imageList.length) % imageList.length;
            img.classList.add("is-fading");

            window.setTimeout(() => {
                img.setAttribute("src", imageList[currentIndex]);
                img.classList.remove("is-fading");
                updateIndicators();
            }, 180);
        };

        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "service-image-nav service-image-nav-prev";
        prevBtn.setAttribute("aria-label", "Imagen anterior");
        prevBtn.textContent = "\u2039";

        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "service-image-nav service-image-nav-next";
        nextBtn.setAttribute("aria-label", "Siguiente imagen");
        nextBtn.textContent = "\u203a";

        const indicatorsWrap = document.createElement("div");
        indicatorsWrap.className = "service-image-indicators";

        const dotsWrap = document.createElement("div");
        dotsWrap.className = "service-image-dots";

        const countLabel = document.createElement("span");
        countLabel.className = "service-image-count";
        countLabel.setAttribute("aria-live", "polite");

        const dots = imageList.map(() => {
            const dot = document.createElement("span");
            dot.className = "service-image-dot";
            dotsWrap.appendChild(dot);
            return dot;
        });

        const updateIndicators = () => {
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === currentIndex);
            });
            countLabel.textContent = `${currentIndex + 1}/${imageList.length}`;
        };

        indicatorsWrap.appendChild(dotsWrap);
        indicatorsWrap.appendChild(countLabel);
        updateIndicators();

        imageWrapper.appendChild(prevBtn);
        imageWrapper.appendChild(nextBtn);
        imageWrapper.appendChild(indicatorsWrap);

        let isPaused = false;
        let isExternallyPaused = false;

        const startAutoRotation = () => window.setInterval(() => {
            if (document.hidden || isPaused || isExternallyPaused) {
                return;
            }

            showImageAtIndex(currentIndex + 1);
        }, intervalMs);

        let rotationTimerId = startAutoRotation();

        const resetRotation = () => {
            window.clearInterval(rotationTimerId);
            rotationTimerId = startAutoRotation();
        };

        controllers.push({
            accordionElement,
            pause: () => {
                isExternallyPaused = true;
            },
            resume: () => {
                isExternallyPaused = false;
                resetRotation();
            },
            focusImage: () => {
                isExternallyPaused = true;
                showImageAtIndex(0);
                img.classList.remove("is-guide-focus");
                // Reinicia la animacion CSS para cada paso de guia.
                void img.offsetWidth;
                img.classList.add("is-guide-focus");
            },
        });

        prevBtn.addEventListener("click", () => {
            showImageAtIndex(currentIndex - 1);
            resetRotation();
        });

        nextBtn.addEventListener("click", () => {
            showImageAtIndex(currentIndex + 1);
            resetRotation();
        });

        imageWrapper.addEventListener("mouseenter", () => {
            isPaused = true;
        });

        imageWrapper.addEventListener("mouseleave", () => {
            isPaused = false;
            resetRotation();
        });

        imageWrapper.addEventListener("focusin", () => {
            isPaused = true;
        });

        imageWrapper.addEventListener("focusout", () => {
            const activeElement = document.activeElement;
            if (!activeElement || !imageWrapper.contains(activeElement)) {
                isPaused = false;
                resetRotation();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                return;
            }
            resetRotation();
        });
    });
}

initServicesImageRotation();

// Inicializar AOS desde script externo para cumplir CSP sin scripts inline.
if (typeof AOS !== "undefined") {
    AOS.init({
        duration: 1600,          // Animación más lenta y elegante
        once: true,              // Se ejecuta una sola vez al hacer scroll
        easing: "ease-out-quad", // Curva de desaceleración súper fluida
        offset: 140,             // Se activa 140px dentro de pantalla para evitar aparición abrupta
        delay: 50,               // Sutil retraso inicial para mayor naturalidad
    });
} else {
    // Fallback: evitar que se oculten secciones marcadas con data-aos.
    document.querySelectorAll("[data-aos]").forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
    });
}

// ---------------------------
// Banner de cookies
// ---------------------------
const cookieBanner = document.getElementById("cookie-banner");
const acceptCookies = document.getElementById("accept-cookies");
const rejectCookies = document.getElementById("reject-cookies");
const configureCookies = document.getElementById("configure-cookies");
const saveCookieSettings = document.getElementById("save-cookie-settings");
const cookieSettings = document.getElementById("cookie-settings");
const cookiePreferences = document.getElementById("cookie-preferences");
const cookieAnalytics = document.getElementById("cookie-analytics");
const cookieMarketing = document.getElementById("cookie-marketing");
const openCookieSettingsLinks = document.querySelectorAll(".cookie-open-settings");

const COOKIE_CONSENT_KEY = "atelCookieConsentV1";

function getDefaultConsent() {
    return {
        necessary: true,
        preferences: false,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: 1,
    };
}

function getStoredConsent() {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

function applyConsent(consent) {
    document.documentElement.dataset.cookiePreferences = consent.preferences ? "granted" : "denied";
    document.documentElement.dataset.cookieAnalytics = consent.analytics ? "granted" : "denied";
    document.documentElement.dataset.cookieMarketing = consent.marketing ? "granted" : "denied";
}

function setCookieSettingsFormValues(consent) {
    if (cookiePreferences) cookiePreferences.checked = Boolean(consent.preferences);
    if (cookieAnalytics) cookieAnalytics.checked = Boolean(consent.analytics);
    if (cookieMarketing) cookieMarketing.checked = Boolean(consent.marketing);
}

async function sendConsentAudit(consent, source) {
    try {
        await fetch("/api/cookie-consent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...consent,
                source,
            }),
        });
    } catch (error) {
        console.warn("No se pudo auditar el consentimiento de cookies", error);
    }
}

function saveConsent(consent, source = "banner") {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    cookieBanner?.classList.remove("show");
    closeCookieSettings();
    sendConsentAudit(consent, source);
}

function openCookieSettings() {
    if (!cookieSettings || !configureCookies) {
        return;
    }
    cookieSettings.hidden = false;
    configureCookies.setAttribute("aria-expanded", "true");
}

function closeCookieSettings() {
    if (!cookieSettings || !configureCookies) {
        return;
    }
    cookieSettings.hidden = true;
    configureCookies.setAttribute("aria-expanded", "false");
}

if (cookieBanner && acceptCookies && rejectCookies && configureCookies && saveCookieSettings) {
    const existingConsent = getStoredConsent();

    if (!existingConsent) {
        cookieBanner.classList.add("show");
        setCookieSettingsFormValues(getDefaultConsent());
    } else {
        applyConsent(existingConsent);
        setCookieSettingsFormValues(existingConsent);
    }

    acceptCookies.addEventListener("click", () => {
        trackEvent("cookie_accept_all", { elementId: "accept-cookies" });
        saveConsent({
            necessary: true,
            preferences: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
            version: 1,
        }, "accept-all");
    });

    rejectCookies.addEventListener("click", () => {
        trackEvent("cookie_reject_non_essential", { elementId: "reject-cookies" });
        saveConsent(getDefaultConsent(), "reject-non-essential");
    });

    configureCookies.addEventListener("click", () => {
        trackEvent("cookie_settings_open", { elementId: "configure-cookies" });
        if (!cookieSettings) {
            return;
        }

        if (cookieSettings.hidden) {
            openCookieSettings();
        } else {
            closeCookieSettings();
        }
    });

    saveCookieSettings.addEventListener("click", () => {
        trackEvent("cookie_custom_settings", { elementId: "save-cookie-settings" });
        saveConsent({
            necessary: true,
            preferences: Boolean(cookiePreferences?.checked),
            analytics: Boolean(cookieAnalytics?.checked),
            marketing: Boolean(cookieMarketing?.checked),
            timestamp: new Date().toISOString(),
            version: 1,
        }, "custom-settings");
    });

    openCookieSettingsLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            cookieBanner.classList.add("show");
            openCookieSettings();
        });
    });
}

// ---------------------------
// Scroll suave para anclas
// ---------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e){
        const href = this.getAttribute("href");
        if (!href) {
            return;
        }

        if (href === "#") {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const navbar = document.querySelector(".navbar");
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const extraOffset = Math.max(26, Math.round(navbarHeight * 0.22));
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const finalTop = Math.max(0, targetTop - navbarHeight - extraOffset);

            window.scrollTo({
                top: finalTop,
                behavior: "smooth"
            });

            // Al entrar en Empresa desde el botón/título, abre el primer bloque para mostrar contenido útil.
            if (href === "#empresa") {
                const firstCompanyAccordion = document.querySelector("#empresa .accordion-item");
                if (firstCompanyAccordion && !firstCompanyAccordion.classList.contains("active")) {
                    setTimeout(() => {
                        toggleAccordion(firstCompanyAccordion);
                    }, 220);
                }
            }
        }
    });
});

// ---------------------------
// Función extra: cambio dinámico de hero y fondos
// Puedes añadir más imágenes por sección si quieres
// ---------------------------
function updateHeroImage(url){
    const hero = document.querySelector(".hero");
    if(hero) hero.style.backgroundImage = `linear-gradient(rgba(68,138,60,0.32), rgba(68,138,60,0.32)), url('${url}')`;
}

function initFeedbackBot() {
    const feedbackBot = document.getElementById("feedback-bot");
    const feedbackLauncher = document.getElementById("feedback-bot-launcher");
    const closeButton = document.getElementById("feedback-bot-close");
    const quickActions = document.getElementById("feedback-quick-actions");
    const chatStream = document.getElementById("feedback-chat-stream");
    const questionInput = document.getElementById("feedback-question-input");
    const questionSend = document.getElementById("feedback-question-send");
    const finalBlock = document.getElementById("feedback-final");
    const commentInput = document.getElementById("feedback-comment");
    const submitButton = document.getElementById("feedback-submit");
    const laterButton = document.getElementById("feedback-later");
    const starButtons = Array.from(document.querySelectorAll(".feedback-star"));

    if (!feedbackBot || !chatStream || !finalBlock) {
        return;
    }

    const FEEDBACK_STATE_KEY = "atelFeedbackBotStateV1";
    const FEEDBACK_LOG_KEY = "atelFeedbackLogV1";
    const selectedIntent = getStoredIntent();
    const SHOW_DELAY_MS = selectedIntent ? 7000 : 12000;

    let sentiment = "";
    let rating = 0;

    const getCurrentLanguage = () => {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang && translations[storedLang]) {
            return storedLang;
        }
        if (langSelect && translations[langSelect.value]) {
            return langSelect.value;
        }
        const docLang = document.documentElement.lang;
        if (docLang && translations[docLang]) {
            return docLang;
        }
        return "es";
    };

    const t = (key) => translateKey(getCurrentLanguage(), key);

    const now = Date.now();

    const appendMessage = (text, fromUser = false) => {
        const message = document.createElement("p");
        message.className = `feedback-msg ${fromUser ? "feedback-msg-user" : "feedback-msg-bot"}`;
        message.textContent = text;
        chatStream.appendChild(message);
    };

    const readState = () => {
        const raw = localStorage.getItem(FEEDBACK_STATE_KEY);
        if (!raw) {
            return {};
        }
        try {
            return JSON.parse(raw) || {};
        } catch (error) {
            return {};
        }
    };

    const writeState = (state) => {
        localStorage.setItem(FEEDBACK_STATE_KEY, JSON.stringify(state));
    };

    const scheduleHide = (days) => {
        const nextUntil = Date.now() + days * 24 * 60 * 60 * 1000;
        writeState({
            dismissedUntil: nextUntil,
            completed: false,
        });
    };

    const openBot = () => {
        const guideBot = document.getElementById("guide-bot");
        if (guideBot?.classList.contains("show")) {
            guideBot.classList.remove("show");
            guideBot.setAttribute("aria-hidden", "true");
        }
        feedbackBot.classList.add("show");
        feedbackBot.setAttribute("aria-hidden", "false");
    };

    const closeBot = (days = 7) => {
        scheduleHide(days);
        feedbackBot.classList.remove("show");
        feedbackBot.setAttribute("aria-hidden", "true");
    };

    const findReply = (question) => {
        const value = String(question || "").toLowerCase();
        if (value.includes("precio") || value.includes("presupuesto")) {
            return t("feedback-reply-budget");
        }
        if (value.includes("telefono") || value.includes("contacto") || value.includes("email")) {
            return t("feedback-reply-contact");
        }
        if (value.includes("servicio") || value.includes("instalacion") || value.includes("mantenimiento")) {
            return t("feedback-reply-services");
        }
        return t("feedback-reply-generic");
    };

    const sendQuestion = () => {
        const question = (questionInput?.value || "").trim();
        if (!question) {
            return;
        }
        appendMessage(question, true);
        appendMessage(findReply(question), false);
        if (questionInput) {
            questionInput.value = "";
        }
        finalBlock.hidden = false;
    };

    const storedState = readState();
    const canAutoShow = !(storedState.completed || (storedState.dismissedUntil && Number(storedState.dismissedUntil) > now));

    syncFeedbackBotInitialMessageWithLanguage(getCurrentLanguage());

    if (canAutoShow) {
        setTimeout(() => {
            openBot();
            trackEvent("feedback_bot_show", { elementId: "feedback-bot" });
        }, SHOW_DELAY_MS);
    }

    feedbackLauncher?.addEventListener("click", () => {
        const isOpen = feedbackBot.classList.contains("show");
        if (isOpen) {
            feedbackBot.classList.remove("show");
            feedbackBot.setAttribute("aria-hidden", "true");
            return;
        }
        openBot();
        trackEvent("feedback_bot_open_manual", { elementId: "feedback-bot-launcher" });
    });

    quickActions?.querySelectorAll("[data-feedback-sentiment]").forEach((button) => {
        button.addEventListener("click", () => {
            sentiment = button.getAttribute("data-feedback-sentiment") || "";
            appendMessage(button.textContent || "", true);

            if (sentiment === "positiva") {
                appendMessage(t("feedback-sentiment-reply-positive"), false);
            } else if (sentiment === "neutral") {
                appendMessage(t("feedback-sentiment-reply-neutral"), false);
            } else {
                appendMessage(t("feedback-sentiment-reply-improve"), false);
            }

            finalBlock.hidden = false;
            quickActions.hidden = true;
            trackEvent("feedback_bot_sentiment", {
                elementId: "feedback-sentiment",
                elementText: sentiment,
            });
        });
    });

    questionSend?.addEventListener("click", sendQuestion);
    questionInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendQuestion();
        }
    });

    starButtons.forEach((button) => {
        button.addEventListener("click", () => {
            rating = Number(button.getAttribute("data-rating")) || 0;
            starButtons.forEach((star) => {
                const starValue = Number(star.getAttribute("data-rating")) || 0;
                star.classList.toggle("is-active", starValue <= rating);
            });
        });
    });

    submitButton?.addEventListener("click", () => {
        if (!rating) {
            appendMessage(t("feedback-rating-required"), false);
            return;
        }

        const entry = {
            sentiment,
            rating,
            comment: String(commentInput?.value || "").trim(),
            createdAt: new Date().toISOString(),
        };

        const rawLog = localStorage.getItem(FEEDBACK_LOG_KEY);
        let list = [];
        if (rawLog) {
            try {
                list = JSON.parse(rawLog) || [];
            } catch (error) {
                list = [];
            }
        }
        list.push(entry);
        localStorage.setItem(FEEDBACK_LOG_KEY, JSON.stringify(list.slice(-20)));

        writeState({
            completed: true,
            dismissedUntil: Date.now() + 180 * 24 * 60 * 60 * 1000,
        });

        appendMessage(t("feedback-thanks"), false);
        feedbackBot.classList.remove("show");
        feedbackBot.setAttribute("aria-hidden", "true");

        trackEvent("feedback_bot_submit", {
            elementId: "feedback-submit",
            metadata: { rating, sentiment },
        });
    });

    laterButton?.addEventListener("click", () => {
        closeBot(10);
        trackEvent("feedback_bot_later", { elementId: "feedback-later" });
    });

    closeButton?.addEventListener("click", () => {
        closeBot(10);
        trackEvent("feedback_bot_close", { elementId: "feedback-bot-close" });
    });
}

function initGuideBot() {
    const guideBot = document.getElementById("guide-bot");
    const guideLauncher = document.getElementById("guide-bot-launcher");
    const guideClose = document.getElementById("guide-bot-close");
    const guideStart = document.getElementById("guide-start");
    const guideBrowse = document.getElementById("guide-browse");
    const guideNext = document.getElementById("guide-next");
    const guideStream = document.getElementById("guide-chat-stream");
    const guideSpeedButtons = Array.from(document.querySelectorAll("[data-guide-speed]"));

    if (!guideBot || !guideLauncher || !guideStream) {
        return;
    }

    let stepIndex = -1;
    let guidePlan = [];
    let highlightedElement = null;
    let autoGuideRunning = false;
    let autoGuideTimer = null;
    let autoGuideCloseTimer = null;

    const AUTO_GUIDE_STEP_DELAY_MS = 2200;
    const AUTO_GUIDE_LONG_STEP_DELAY_MS = 3000;
    const AUTO_GUIDE_SHORT_STEP_DELAY_MS = 1800;
    const GUIDE_AUTO_CLOSE_DELAY_MS = 2200;

    const AUTO_GUIDE_SPEED_MULTIPLIER = {
        slow: 1.25,
        normal: 1,
        fast: 0.75,
    };

    const GUIDE_SPEED_STORAGE_KEY = "atelGuideSpeedV1";

    let selectedGuideSpeed = "normal";

    const t = (key) => translateKey(getCurrentLanguageForDynamicText(), key);

    const getGuideBackdropImageUrl = (target = null) => {
        const targetImage = target?.querySelector?.("img") || null;
        const heroImage = document.querySelector(".hero-tile.is-active img") || document.querySelector(".hero-tile img");
        return targetImage?.currentSrc || targetImage?.getAttribute("src") || heroImage?.currentSrc || heroImage?.getAttribute("src") || "";
    };

    const updateGuideBackdropImage = (target = null) => {
        const imageUrl = getGuideBackdropImageUrl(target);
        if (!imageUrl) {
            guideBot.classList.remove("has-guide-backdrop");
            guideBot.style.removeProperty("--guide-bot-background-image");
            return;
        }

        guideBot.style.setProperty("--guide-bot-background-image", `url(${JSON.stringify(imageUrl)})`);
        guideBot.classList.add("has-guide-backdrop");
    };

    const appendBotMessage = (text) => {
        if (!text) {
            return;
        }
        const message = document.createElement("p");
        message.className = "feedback-msg feedback-msg-bot";
        message.textContent = text;
        guideStream.appendChild(message);

        const messages = Array.from(guideStream.querySelectorAll(".feedback-msg"));
        if (messages.length > 4) {
            messages.slice(0, messages.length - 4).forEach((node) => node.remove());
        }

        guideStream.scrollTop = guideStream.scrollHeight;
    };

    const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

    const getSectionTitle = (selector) => {
        const titleElement = document.querySelector(`${selector} .section-title [data-i18n]`) ||
            document.querySelector(`${selector} .section-title`);
        return cleanText(titleElement?.textContent);
    };

    const getAccordionSummary = (item) => {
        if (!item) {
            return "";
        }

        const title = cleanText(item.querySelector(".accordion-header [data-i18n]")?.textContent || item.querySelector(".accordion-header")?.textContent);
        const detail = cleanText(
            item.querySelector(".accordion-content .content-text p")?.textContent ||
            item.querySelector(".accordion-content .content-text li")?.textContent ||
            item.querySelector(".accordion-content p")?.textContent ||
            ""
        );

        if (title && detail) {
            return `${title}: ${detail}`;
        }
        return title || detail;
    };

    const getContactSummary = (office) => {
        const panel = document.querySelector(`[data-office-panel="${office}"]`);
        if (!panel) {
            return "";
        }

        const title = cleanText(panel.querySelector("h3")?.textContent);
        const address = cleanText(panel.querySelector("[data-map-link]")?.textContent || panel.querySelector("p")?.textContent);
        if (title && address) {
            return `${title}: ${address}`;
        }
        return title || address;
    };

    const focusTarget = (target) => {
        if (!target) {
            return;
        }

        const navbar = document.querySelector(".navbar");
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const rect = target.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const desiredTop = window.scrollY + rect.top - (viewportHeight * 0.32) - (navbarHeight * 0.5);
        const targetTop = Math.max(0, Math.round(desiredTop));

        const currentTop = window.scrollY;
        const distance = Math.abs(targetTop - currentTop);
        const shouldScroll = distance > 32;

        if (shouldScroll) {
            window.scrollTo({ top: targetTop, behavior: "smooth" });
        }

        clearHighlight();
        target.classList.add("guide-highlight");
        highlightedElement = target;
    };

    const resetGuideStream = () => {
        guideStream.innerHTML = "";
        appendBotMessage(t("guide-intro"));
    };

    const buildGuidePlan = () => {
        const plan = [];

        const services = Array.from(document.querySelectorAll("#servicios .accordion-item"));
        const company = Array.from(document.querySelectorAll("#empresa .accordion-item"));
        const products = Array.from(document.querySelectorAll("#productos .accordion-item"));
        const certs = Array.from(document.querySelectorAll("#certificaciones .accordion-item"));
        const malagaButton = document.querySelector('.contact-selector-btn[data-office="malaga"]');
        const marbellaButton = document.querySelector('.contact-selector-btn[data-office="marbella"]');

        services.forEach((item, index) => {
            plan.push({
                message: `${index === 0 ? `${getSectionTitle("#servicios")}. ` : ""}${getAccordionSummary(item)}`,
                target: item,
                delayMs: AUTO_GUIDE_LONG_STEP_DELAY_MS,
                run: () => {
                    if (!item.classList.contains("active")) {
                        toggleAccordion(item, { skipAutoScroll: true });
                    }
                },
            });
        });

        company.forEach((item, index) => {
            plan.push({
                message: `${index === 0 ? `${getSectionTitle("#empresa")}. ` : ""}${getAccordionSummary(item)}`,
                target: item,
                delayMs: AUTO_GUIDE_STEP_DELAY_MS,
                run: () => {
                    if (!item.classList.contains("active")) {
                        toggleAccordion(item, { skipAutoScroll: true });
                    }
                },
            });
        });

        products.forEach((item, index) => {
            plan.push({
                message: `${index === 0 ? `${getSectionTitle("#productos")}. ` : ""}${getAccordionSummary(item)}`,
                target: item,
                delayMs: AUTO_GUIDE_STEP_DELAY_MS,
                run: () => {
                    if (!item.classList.contains("active")) {
                        toggleAccordion(item, { skipAutoScroll: true });
                    }
                },
            });
        });

        plan.push({
            message: `${getSectionTitle("#contacto")}. ${getContactSummary("malaga")}`,
            target: document.getElementById("contacto"),
            delayMs: AUTO_GUIDE_SHORT_STEP_DELAY_MS,
            run: () => {
                malagaButton?.click();
            },
        });

        plan.push({
            message: getContactSummary("marbella"),
            target: document.getElementById("contacto"),
            delayMs: AUTO_GUIDE_SHORT_STEP_DELAY_MS,
            run: () => {
                marbellaButton?.click();
            },
        });

        certs.forEach((item, index) => {
            plan.push({
                message: `${index === 0 ? `${getSectionTitle("#certificaciones")}. ` : ""}${getAccordionSummary(item)}`,
                target: item,
                delayMs: AUTO_GUIDE_LONG_STEP_DELAY_MS,
                run: () => {
                    if (!item.classList.contains("active")) {
                        toggleAccordion(item, { skipAutoScroll: true });
                    }
                },
            });
        });

        return plan;
    };

    const clearHighlight = () => {
        if (highlightedElement) {
            highlightedElement.classList.remove("guide-highlight");
            highlightedElement = null;
        }
    };

    const clearAutoGuideTimer = () => {
        if (autoGuideTimer) {
            clearTimeout(autoGuideTimer);
            autoGuideTimer = null;
        }
    };

    const clearAutoGuideCloseTimer = () => {
        if (autoGuideCloseTimer) {
            clearTimeout(autoGuideCloseTimer);
            autoGuideCloseTimer = null;
        }
    };

    const scheduleAutoAdvance = () => {
        clearAutoGuideTimer();
        if (!autoGuideRunning || !guideBot.classList.contains("show")) {
            return;
        }

        const currentStepDelay = guidePlan[stepIndex]?.delayMs || AUTO_GUIDE_STEP_DELAY_MS;
        const speedMultiplier = AUTO_GUIDE_SPEED_MULTIPLIER[selectedGuideSpeed] || AUTO_GUIDE_SPEED_MULTIPLIER.normal;
        const effectiveDelay = Math.max(900, Math.round(currentStepDelay * speedMultiplier));

        autoGuideTimer = setTimeout(() => {
            if (!autoGuideRunning || !guideBot.classList.contains("show")) {
                return;
            }
            stepIndex += 1;
            showGuideStep(stepIndex);
            if (autoGuideRunning) {
                scheduleAutoAdvance();
            }
        }, effectiveDelay);
    };

    const applyGuideSpeed = (speed, persist = false) => {
        if (!AUTO_GUIDE_SPEED_MULTIPLIER[speed]) {
            return;
        }

        selectedGuideSpeed = speed;
        guideSpeedButtons.forEach((chip) => {
            chip.classList.toggle("is-active", chip.getAttribute("data-guide-speed") === speed);
        });

        if (persist) {
            localStorage.setItem(GUIDE_SPEED_STORAGE_KEY, speed);
        }

        if (autoGuideRunning) {
            scheduleAutoAdvance();
        }
    };

    const showGuideStep = (index) => {
        if (index >= guidePlan.length) {
            clearHighlight();
            appendBotMessage(t("guide-complete"));
            appendBotMessage(t("guide-auto-close"));
            guideNext.hidden = true;
            autoGuideRunning = false;
            clearAutoGuideTimer();
            clearAutoGuideCloseTimer();

            autoGuideCloseTimer = setTimeout(() => {
                returnToHomepage();
                closeGuide();
            }, GUIDE_AUTO_CLOSE_DELAY_MS);
            return;
        }

        const step = guidePlan[index];
        step.run?.();
        focusTarget(step.target);
        window.ATEL_SERVICE_IMAGE_ROTATION?.focusByAccordion(step.target);
        updateGuideBackdropImage(step.target);
        appendBotMessage(step.message);
    };

    const openGuide = () => {
        clearAutoGuideCloseTimer();
        const feedbackBot = document.getElementById("feedback-bot");
        if (feedbackBot?.classList.contains("show")) {
            feedbackBot.classList.remove("show");
            feedbackBot.setAttribute("aria-hidden", "true");
        }
        window.ATEL_SERVICE_IMAGE_ROTATION?.pauseAll();
        updateGuideBackdropImage(guidePlan[0]?.target || null);
        guideBot.classList.add("show");
        guideBot.setAttribute("aria-hidden", "false");
    };

    const returnToHomepage = () => {
        document.querySelectorAll(".accordion-item.active").forEach((item) => {
            item.classList.remove("active");
        });

        closeLegalModal();

        const hero = document.querySelector(".hero");
        const rootStyles = getComputedStyle(document.documentElement);
        const navbarHeight = parseInt(rootStyles.getPropertyValue("--navbar-height"), 10) || 96;
        const targetTop = hero
            ? hero.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + 8)
            : 0;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    };

    const closeGuide = () => {
        guideBot.classList.remove("show");
        guideBot.setAttribute("aria-hidden", "true");
        guideBot.classList.remove("has-guide-backdrop");
        guideBot.style.removeProperty("--guide-bot-background-image");
        clearHighlight();
        guideNext.hidden = true;
        stepIndex = -1;
        autoGuideRunning = false;
        clearAutoGuideTimer();
        clearAutoGuideCloseTimer();
        window.ATEL_SERVICE_IMAGE_ROTATION?.resumeAll();
    };

    guideLauncher.addEventListener("click", () => {
        if (guideBot.classList.contains("show")) {
            closeGuide();
            return;
        }
        openGuide();
    });

    guideClose?.addEventListener("click", closeGuide);

    guideBrowse?.addEventListener("click", () => {
        autoGuideRunning = false;
        clearAutoGuideTimer();
        appendBotMessage(t("guide-msg-browse"));
        closeGuide();
    });

    guideStart?.addEventListener("click", () => {
        clearAutoGuideCloseTimer();
        guidePlan = buildGuidePlan();
        stepIndex = 0;
        autoGuideRunning = true;
        guideNext.hidden = false;
        resetGuideStream();
        appendBotMessage(t("guide-msg-started"));
        showGuideStep(stepIndex);
        scheduleAutoAdvance();
    });

    const savedGuideSpeed = localStorage.getItem(GUIDE_SPEED_STORAGE_KEY);
    const hasValidSavedSpeed = savedGuideSpeed && AUTO_GUIDE_SPEED_MULTIPLIER[savedGuideSpeed];
    const defaultGuideSpeed = "slow";
    applyGuideSpeed(hasValidSavedSpeed ? savedGuideSpeed : defaultGuideSpeed);

    guideSpeedButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const speed = button.getAttribute("data-guide-speed") || "normal";
            applyGuideSpeed(speed, true);
        });
    });

    guideNext?.addEventListener("click", () => {
        clearAutoGuideTimer();
        stepIndex += 1;
        showGuideStep(stepIndex);
        if (autoGuideRunning) {
            scheduleAutoAdvance();
        }
    });

    document.addEventListener("atel:language-changed", () => {
        if (!guideBot.classList.contains("show")) {
            return;
        }

        guidePlan = buildGuidePlan();

        if (!autoGuideRunning) {
            resetGuideStream();
        }
    });
}

function parseBackgroundImageUrls(backgroundImageValue) {
    const raw = String(backgroundImageValue || "");
    const matches = Array.from(raw.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\)]+))\s*\)/gi));
    return matches
        .map((match) => match[1] || match[2] || match[3] || "")
        .map((value) => value.trim())
        .filter(Boolean);
}

// Soporta listas de imagenes separadas por comas en src (legacy contenido).
// Carga la primera ruta valida para evitar bloques vacios en los acordeones.
function resolveCommaSeparatedImageSources() {
    const images = Array.from(document.querySelectorAll("img[src*=',']"));
    if (!images.length) {
        return;
    }

    images.forEach((img) => {
        const raw = img.getAttribute("src") || "";
        const candidates = raw
            .split(",")
            .map((value) => value.trim().replace(/\/+$/g, ""))
            .filter(Boolean);

        if (!candidates.length) {
            return;
        }

        let index = 0;

        const tryNextCandidate = () => {
            if (index >= candidates.length) {
                return;
            }

            const candidate = candidates[index];
            const probe = new Image();

            probe.addEventListener("load", () => {
                img.setAttribute("src", candidate);
                img.setAttribute("data-gallery-sources", candidates.join(","));
            });

            probe.addEventListener("error", () => {
                index += 1;
                tryNextCandidate();
            });

            probe.src = candidate;
        };

        tryNextCandidate();
    });
}

function initHeroAutoFit() {
    const tiles = Array.from(document.querySelectorAll(".hero-tile"));
    if (!tiles.length) {
        return;
    }

    const imageCache = new Map();

    const extractBackgroundUrl = (element) => {
        const imgChild = element.querySelector("img");
        if (imgChild) return imgChild.src;
        
        const raw = window.getComputedStyle(element).backgroundImage || "";
        const urls = parseBackgroundImageUrls(raw);
        return urls.length ? urls[0] : "";
    };

    const decideFit = (tile, imgRatio) => {
        const width = tile.clientWidth || 1;
        const height = tile.clientHeight || 1;
        const boxRatio = width / height;
        const ratioDelta = Math.abs(imgRatio - boxRatio);
        const isMobile = window.innerWidth <= 768;

        // Si la proporción difiere demasiado, evitamos recortes agresivos con contain.
        const useContain = !isMobile && ratioDelta > 0.65;

        tile.classList.toggle("auto-contain", useContain);
        tile.classList.toggle("auto-cover", !useContain);
    };

    const applyAutoFit = () => {
        tiles.forEach((tile) => {
            const imgUrl = extractBackgroundUrl(tile);
            if (!imgUrl) {
                return;
            }

            const cachedRatio = imageCache.get(imgUrl);
            if (cachedRatio) {
                decideFit(tile, cachedRatio);
                return;
            }

            const preload = new Image();
            preload.addEventListener("load", () => {
                const ratio = preload.naturalWidth / Math.max(preload.naturalHeight, 1);
                imageCache.set(imgUrl, ratio);
                decideFit(tile, ratio);
            });
            preload.src = imgUrl;
        });
    };

    applyAutoFit();
    window.addEventListener("resize", applyAutoFit);
}

function initHeroMobileControls() {
    const mosaic = document.querySelector(".hero-mosaic");
    const prevButton = document.getElementById("hero-prev");
    const nextButton = document.getElementById("hero-next");
    const dots = Array.from(document.querySelectorAll(".hero-dot"));

    if (!mosaic || !prevButton || !nextButton || !dots.length) {
        return;
    }

    const slides = Array.from(mosaic.querySelectorAll(".hero-tile"));
    if (!slides.length) {
        return;
    }

    let currentIndex = 0;

    const updateDots = (index) => {
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const setManualSlide = (targetIndex) => {
        currentIndex = (targetIndex + slides.length) % slides.length;
        mosaic.classList.add("hero-manual");

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        updateDots(currentIndex);
    };

    prevButton.addEventListener("click", () => {
        setManualSlide(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        setManualSlide(currentIndex + 1);
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.getAttribute("data-hero-index"));
            if (!Number.isFinite(index)) {
                return;
            }
            setManualSlide(index);
        });
    });

    updateDots(0);

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            mosaic.classList.remove("hero-manual");
            slides.forEach((slide) => slide.classList.remove("is-active"));
            updateDots(0);
            currentIndex = 0;
        }
    });
}

function initHeroImageLightbox() {
    // CHISTE DEV: ¿Por qué los programadores confunden Halloween con Navidad?
    // Porque Oct 31 == Dec 25.
    // Moraleja: Comprueba siempre las conversiones de arrays e ids que estás usando.
    const lightbox = document.getElementById("hero-lightbox");
    const lightboxImage = document.getElementById("hero-lightbox-image");
    const lightboxClose = document.getElementById("hero-lightbox-close");
    const heroTiles = Array.from(document.querySelectorAll(".hero-tile"));
    const pageImages = Array.from(document.querySelectorAll("img")).filter((img) => {
        const isLightboxImage = img.id === "hero-lightbox-image" || !!img.closest("#hero-lightbox");
        const isBrandLogo = !!img.closest(".logo, .navbar-brand, .footer-logo");
        const isHeroTileImage = !!img.closest(".hero-tile");
        const isLogoLightboxOptIn = img.hasAttribute("data-lightbox-logo");
        const isExcluded = img.hasAttribute("data-no-lightbox");
        return !isLightboxImage && !isExcluded && !isHeroTileImage && (!isBrandLogo || isLogoLightboxOptIn);
    });

    if (!lightbox || !lightboxImage || !lightboxClose || (!heroTiles.length && !pageImages.length)) {
        return;
    }

    const extractPrimaryImageUrl = (element) => {
        const img = element.querySelector("img");
        if (img) return img.src;
        
        const style = window.getComputedStyle(element).backgroundImage || "";
        const urls = parseBackgroundImageUrls(style);
        return urls.length ? urls[0] : "";
    };

    const getVisibleHeroTile = () => {
        const activeTile = heroTiles.find((tile) => tile.classList.contains("is-active"));
        if (activeTile) {
            return activeTile;
        }

        let bestTile = heroTiles[0] || null;
        let bestOpacity = -1;

        heroTiles.forEach((tile) => {
            const opacity = Number.parseFloat(window.getComputedStyle(tile).opacity || "0");
            if (opacity > bestOpacity) {
                bestOpacity = opacity;
                bestTile = tile;
            }
        });

        return bestTile;
    };

    const extractImgUrl = (img) => {
        return img.currentSrc || img.getAttribute("src") || "";
    };

    const openLightbox = (imageUrl, options = {}) => {
        if (!imageUrl) {
            return;
        }
        const fromHero = Boolean(options.fromHero);
        lightboxImage.setAttribute("src", imageUrl);
        lightbox.classList.toggle("lightbox-from-hero", fromHero);
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        const applyMobileRotationFit = () => {
            const isMobile = window.innerWidth <= 768;
            const isPortraitViewport = window.innerHeight > window.innerWidth;
            const imageRatio = (lightboxImage.naturalWidth || 0) / Math.max(lightboxImage.naturalHeight || 1, 1);
            const shouldRotate = false;
            lightbox.classList.toggle("lightbox-mobile-rotated", shouldRotate);
        };

        if (lightboxImage.complete) {
            applyMobileRotationFit();
        } else {
            lightboxImage.addEventListener("load", applyMobileRotationFit, { once: true });
        }
    };

    const closeLightbox = () => {
        lightbox.classList.remove("open");
        lightbox.classList.remove("lightbox-from-hero");
        lightbox.classList.remove("lightbox-mobile-rotated");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.setAttribute("src", "");
        document.body.style.overflow = "";
    };

    heroTiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            openLightbox(extractPrimaryImageUrl(tile), { fromHero: true });
        });
    });

    pageImages.forEach((img) => {
        img.classList.add("zoomable-image");
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", `Ampliar imagen: ${img.alt || "imagen"}`);
        img.addEventListener("click", () => {
            openLightbox(extractImgUrl(img));
        });
        img.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(extractImgUrl(img));
            }
        });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxImage.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.classList.contains("open")) {
            closeLightbox();
        }
    });

    window.addEventListener("resize", () => {
        if (!lightbox.classList.contains("open")) {
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const isPortraitViewport = window.innerHeight > window.innerWidth;
        const imageRatio = (lightboxImage.naturalWidth || 0) / Math.max(lightboxImage.naturalHeight || 1, 1);
        const shouldRotate = false;
        lightbox.classList.toggle("lightbox-mobile-rotated", shouldRotate);
    });
}

resolveCommaSeparatedImageSources();
initHeroMobileControls();
initHeroAutoFit();
initHeroImageLightbox();

function initContactOfficeSelector() {
    const selectorButtons = Array.from(document.querySelectorAll(".contact-selector-btn"));
    const officePanels = Array.from(document.querySelectorAll(".contact-office[data-office-panel]"));
    const mapFrame = document.getElementById("contact-map");
    const mapLinks = Array.from(document.querySelectorAll("[data-map-link]"));
    const configuredMaps = (window.ATEL_CONFIG && window.ATEL_CONFIG.MAPS) || {};

    if (!selectorButtons.length || !officePanels.length) {
        return;
    }

    const availableOffices = new Set(officePanels.map((panel) => panel.dataset.officePanel));
    const mapSources = {
        malaga: configuredMaps.embedMalaga || mapFrame?.dataset.mapMalaga || "",
        marbella: configuredMaps.embedMarbella || mapFrame?.dataset.mapMarbella || "",
    };
    const locationLinks = {
        malaga: configuredMaps.linkMalaga || "",
        marbella: configuredMaps.linkMarbella || "",
    };

    mapLinks.forEach((link) => {
        const office = link.getAttribute("data-map-link") || "";
        const targetUrl = locationLinks[office] || "#";
        link.setAttribute("href", targetUrl);
    });

    const setActiveOffice = (requestedOffice, shouldTrack = false) => {
        const office = availableOffices.has(requestedOffice)
            ? requestedOffice
            : (officePanels[0].dataset.officePanel || "malaga");

        selectorButtons.forEach((button) => {
            const isActive = button.dataset.office === office;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        officePanels.forEach((panel) => {
            panel.hidden = panel.dataset.officePanel !== office;
        });

        if (mapFrame) {
            const nextSrc = mapSources[office] || "";
            if (nextSrc && mapFrame.getAttribute("src") !== nextSrc) {
                mapFrame.setAttribute("src", nextSrc);
            }
            mapFrame.setAttribute("title", office === "marbella" ? "Mapa oficina Marbella" : "Mapa sede central Málaga");
        }

        if (shouldTrack) {
            trackEvent("contact_office_change", {
                elementId: "contact-office-selector",
                elementText: office,
            });
        }
    };

    selectorButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveOffice(button.dataset.office || "malaga", true);
        });
    });

    const initialOffice = selectorButtons.find((button) => button.classList.contains("is-active"))?.dataset.office
        || selectorButtons[0]?.dataset.office
        || "malaga";

    setActiveOffice(initialOffice, false);
}

initContactOfficeSelector();

function initIntentPersonalization() {
    const intentButtons = Array.from(document.querySelectorAll(".intent-chip[data-intent]"));
    const floatingBudget = document.querySelector(".floating-budget");
    if (!intentButtons.length || !floatingBudget) {
        updateFloatingBudgetByIntent(getStoredIntent() || "budget", false);
        return;
    }

    const applyIntent = (intent, shouldTrack = false) => {
        const normalizedIntent = ["budget", "maintenance", "consulting"].includes(intent) ? intent : "budget";
        localStorage.setItem(INTENT_STORAGE_KEY, normalizedIntent);
        updateIntentButtonsState(normalizedIntent);
        updateIntentHelperText(normalizedIntent);
        updateFloatingBudgetByIntent(normalizedIntent, shouldTrack);
        if (shouldTrack) {
            trackEvent("intent_selected", {
                elementId: "hero-intent",
                elementText: normalizedIntent,
            });
        }
    };

    let intentToastTimer = null;

    const showIntentToast = (text) => {
        if (!text) {
            return;
        }

        let toast = document.getElementById("intent-action-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "intent-action-toast";
            toast.className = "intent-action-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        toast.classList.add("is-visible");

        if (intentToastTimer) {
            window.clearTimeout(intentToastTimer);
        }

        intentToastTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 1500);
    };

    const emphasizeTarget = (target) => {
        if (!target) {
            return;
        }

        target.classList.remove("intent-target-highlight");
        void target.offsetWidth;
        target.classList.add("intent-target-highlight");

        window.setTimeout(() => {
            target.classList.remove("intent-target-highlight");
        }, 1400);
    };

    const scrollToSection = (selector) => {
        const target = document.querySelector(selector);
        if (!target) {
            return;
        }

        centerElementInViewport(target);
    };

    const runIntentAction = (intent) => {
        const lang = getCurrentLanguageForDynamicText();
        const config = getIntentConfig(intent);
        const translatedAction = translateKey(lang, config.ctaKey);
        const actionLabel = translatedAction === config.ctaKey
            ? translateKey(lang, "hero-cta")
            : translatedAction;
        showIntentToast(actionLabel);

        if (intent === "budget") {
            const budgetTarget = document.querySelector("#hero-intent") || document.querySelector(".floating-budget") || document.body;
            centerElementInViewport(budgetTarget);

            window.setTimeout(() => {
                window.location.href = "presupuesto/";
            }, 320);
            return;
        }

        if (intent === "maintenance") {
            const maintenanceAccordion = document.querySelector("#service-maintenance-update");
            const fallbackAccordion = document.querySelector("#servicios .accordion-item");
            const targetAccordion = maintenanceAccordion || fallbackAccordion;

            if (targetAccordion && !targetAccordion.classList.contains("active")) {
                toggleAccordion(targetAccordion);
            } else {
                centerElementInViewport(targetAccordion || document.querySelector("#servicios"));
            }

            emphasizeTarget(targetAccordion || document.querySelector("#servicios"));
            return;
        }

        if (intent === "consulting") {
            scrollToSection("#contacto");

            const activeOfficeButton = document.querySelector(".contact-selector-btn.is-active");
            activeOfficeButton?.click();
            emphasizeTarget(document.querySelector("#contacto"));
        }
    };

    const storedIntent = getStoredIntent() || "budget";
    applyIntent(storedIntent, false);

    intentButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const intent = button.getAttribute("data-intent") || "budget";
            applyIntent(intent, true);
            runIntentAction(intent);
        });
    });

    floatingBudget.addEventListener("click", () => {
        const activeIntent = floatingBudget.dataset.intent || getStoredIntent() || "budget";
        trackEvent("personalized_cta_click", {
            elementId: "floating-budget",
            elementText: activeIntent,
            metadata: {
                href: floatingBudget.getAttribute("href") || "presupuesto/",
            },
        });
    });
}

initIntentPersonalization();
initFeedbackBot();
initGuideBot();

// ==========================
// Modal de avisos legales
// Gestiona apertura/cierre y selección de sección sin recargar página.
// ==========================
const legalModal = document.getElementById("legal-modal");
const legalBackdrop = document.getElementById("legal-modal-backdrop");
const legalClose = document.getElementById("legal-modal-close");
const legalLinks = document.querySelectorAll(".legal-link");
const legalSections = document.querySelectorAll(".legal-section");

function showLegalSection(sectionId) {
    legalSections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });
}

function openLegalModal(sectionId) {
    if (!legalModal) return;
    showLegalSection(sectionId || "legal-aviso");
    legalModal.classList.add("open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLegalModal() {
    if (!legalModal) return;
    legalModal.classList.remove("open");
    legalModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (legalLinks.length && legalModal) {
    legalLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            trackEvent("legal_open", {
                elementId: link.getAttribute("data-legal-target") || "legal-link",
                elementText: link.textContent || "",
            });
            openLegalModal(link.getAttribute("data-legal-target"));
        });
    });

    if (legalBackdrop) {
        legalBackdrop.addEventListener("click", closeLegalModal);
    }

    if (legalClose) {
        legalClose.addEventListener("click", closeLegalModal);
    }
}

// ==========================
// Animación logo de fondo Contacto
// ==========================
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
}

const contactInfoLogo = document.querySelector('.contact-info.contact-info-logo');

function checkLogoAnimation() {
    if(contactInfoLogo && isInViewport(contactInfoLogo)){
        contactInfoLogo.classList.add('visible');
        window.removeEventListener('scroll', checkLogoAnimation);
    }
}

function initInteractionSelectionFix() {
    const pointerInteractiveSelector = [
        "a",
        "button",
        "[role='button']",
        ".intent-chip",
        ".feedback-chip",
        ".contact-selector-btn",
        ".service-image-nav",
        ".service-image-dot",
        ".hero-dot",
        ".feedback-star"
    ].join(",");

    document.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
    });

    document.addEventListener("dragstart", (event) => {
        if (event.target instanceof HTMLImageElement) {
            event.preventDefault();
        }
    });

    document.addEventListener("pointerup", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const interactiveTarget = event.target.closest(pointerInteractiveSelector);
        if (!(interactiveTarget instanceof HTMLElement)) {
            return;
        }

        window.requestAnimationFrame(() => {
            interactiveTarget.blur();
        });
    });
}

window.addEventListener('scroll', checkLogoAnimation);
checkLogoAnimation();
initInteractionSelectionFix();

// ==========================
// Menú hamburguesa móvil
// ==========================
const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector(".nav-menu");

if(hamburger && navMenu){
    hamburger.addEventListener("click", () => {
        const isOpen = hamburger.classList.toggle("active");
        const currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "es";
        navMenu.classList.toggle("mobile", isOpen);
        navMenu.classList.toggle("show", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        hamburger.setAttribute("aria-label", isOpen ? translateKey(currentLang, "menu-close-aria") : translateKey(currentLang, "menu-open-aria"));
        hamburger.setAttribute("data-i18n-aria-label", isOpen ? "menu-close-aria" : "menu-open-aria");
        trackEvent("mobile_menu_toggle", {
            elementId: "hamburger",
            metadata: { open: isOpen },
        });
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("mobile");
            navMenu.classList.remove("show");
            hamburger.setAttribute("aria-expanded", "false");
            const currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "es";
            hamburger.setAttribute("aria-label", translateKey(currentLang, "menu-open-aria"));
            hamburger.setAttribute("data-i18n-aria-label", "menu-open-aria");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hamburger.classList.remove("active");
            navMenu.classList.remove("mobile");
            navMenu.classList.remove("show");
            hamburger.setAttribute("aria-expanded", "false");
            const currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "es";
            hamburger.setAttribute("aria-label", translateKey(currentLang, "menu-open-aria"));
            hamburger.setAttribute("data-i18n-aria-label", "menu-open-aria");
            closeLegalModal();
        }
    });
}

// Captura clics globales para analítica de CTA clave.
document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const ctaLink = target.closest('a[href="/presupuesto"], .nav-cta a, .mobile-navbar-cta');
    if (ctaLink instanceof Element) {
        trackEvent("cta_click", {
            elementId: ctaLink.id || "cta-presupuesto",
            elementText: ctaLink.textContent || "",
        });
    }

    const whatsappLink = target.closest(".whatsapp-float");
    if (whatsappLink instanceof Element) {
        trackEvent("whatsapp_click", {
            elementId: "whatsapp-float",
            elementText: "whatsapp",
        });
    }
});

// -------------------------------------------------------------
// SISTEMA DE PORTAFOLIO INTERACTIVO (MODAL DE CLIENTES)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const clientsData = [
        { key: "alhaurin" },
        { key: "avra" },
        { key: "gobierno" },
        { key: "rincon" },
        { key: "buchinger" },
        { key: "baviera" },
        { key: "pilar" },
        { key: "larios" },
        { key: "vuitton" },
        { key: "mcarthurglen" },
        { key: "mercadona" },
        { key: "aldi" },
        { key: "helicopteros" },
        { key: "mshoteles" },
        { key: "revello" },
        { key: "nube" },
        { key: "plazamayor" },
        { key: "sohohotels" },
        { key: "teatrosoho" },
        { key: "malagatowers" },
        { key: "lagerfeld" }
    ];

    const sliderItems = document.querySelectorAll(".logo-slider-item");
    const detailModal = document.getElementById("client-detail-modal");
    if (!detailModal) return;

    const modalOverlay = detailModal.querySelector(".client-modal-overlay");
    const modalClose = document.getElementById("client-modal-close");
    const modalLogoContainer = document.getElementById("client-modal-logo-container");
    const modalTitle = document.getElementById("client-modal-title");
    const modalDesc = document.getElementById("client-modal-desc");

    // Abrir modal de detalles
    sliderItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            const clientIndex = index % clientsData.length;
            const client = clientsData[clientIndex];
            const svgClone = item.querySelector("svg").cloneNode(true);

            // Restablecer estilos en el clon para que se vea coloreado e interactivo
            svgClone.style.filter = "grayscale(0%) opacity(1)";
            svgClone.style.transform = "none";

            // Rellenar modal con seguridad XSS
            modalLogoContainer.textContent = "";
            modalLogoContainer.appendChild(svgClone);

            const currentLang = getCurrentLanguageForDynamicText();
            const titleText = item.getAttribute("aria-label") || (svgClone.querySelector("text") ? svgClone.querySelector("text").textContent : "Cliente");
            modalTitle.textContent = titleText;

            // Cargar descripción traducida
            const descKey = `client-desc-${client.key}`;
            modalDesc.textContent = translateKey(currentLang, descKey);

            // Mostrar modal
            detailModal.classList.add("is-active");
            detailModal.setAttribute("aria-hidden", "false");
        });
    });

    // Cerrar modal de detalles
    const closeDetailModal = () => {
        detailModal.classList.remove("is-active");
        detailModal.setAttribute("aria-hidden", "true");
    };

    if (modalClose) modalClose.addEventListener("click", closeDetailModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeDetailModal);
});

