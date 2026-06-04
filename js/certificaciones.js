// ===================== CERTIFICACIONES.JS =====================
// Script para la página de certificaciones

const LANGUAGE_STORAGE_KEY = "atelLanguage";

// Sanitización HTML básica
function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function translateKey(lang, key) {
    if (translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    return key;
}

function setLanguage(lang) {
    // Traduce elementos con data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Traduce atributos aria-label
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        if (!key) return;
        el.setAttribute("aria-label", translateKey(lang, key));
    });

    // Ajusta dirección RTL para árabe
    if(lang === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
    } else {
        document.documentElement.setAttribute("dir", "ltr");
    }
}

// Manejo del selector de idioma
const langSelect = document.getElementById("language-select");
if(langSelect){
    langSelect.addEventListener("change", e => {
        const selectedLang = e.target.value;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLang);
        setLanguage(selectedLang);
    });

    // Inicializar idioma guardado o español por defecto
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const initialLang = savedLang && translations[savedLang] ? savedLang : (langSelect.value || "es");
    langSelect.value = initialLang;
    setLanguage(initialLang);
}

// Efecto de fadeIn al cargar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cert-row').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.6s ease forwards`;
        row.style.animationDelay = `${index * 0.1}s`;
    });
});

// Animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
