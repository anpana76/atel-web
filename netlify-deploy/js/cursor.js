// High-Tech Custom Cursor Logic with Smooth Lerp Trailing

document.addEventListener("DOMContentLoaded", () => {
    // Only initialize on desktop/mouse devices
    if (window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    // 1. Create Cursor Elements
    const dot = document.createElement("div");
    dot.id = "custom-cursor-dot";
    
    const ring = document.createElement("div");
    ring.id = "custom-cursor-ring";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // 2. Variables for tracking and Lerp
    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;

    // Track mouse coordinates
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 3. Smooth animation using Lerp (Linear Interpolation)
    const animateCursor = () => {
        // Inner dot follows mouse instantly
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;

        // Outer ring trails with more lag for high-tech feeling
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        requestAnimationFrame(animateCursor);
    };
    
    animateCursor();

    // 4. Click animations
    document.addEventListener("mousedown", () => {
        document.body.classList.add("cursor-clicking");
    });
    
    document.addEventListener("mouseup", () => {
        document.body.classList.remove("cursor-clicking");
    });

    // 5. Interactive elements hover states
    const updateHoverElements = () => {
        const interactiveSelectors = [
            "a", "button", "select", "input", "textarea", 
            "[role='button']", ".accordion-header", 
            ".service-image-nav", ".cookie-open-settings", 
            ".intent-chip", ".service-image-dot"
        ];

        document.querySelectorAll(interactiveSelectors.join(",")).forEach((el) => {
            // Avoid duplicate listeners
            if (el.dataset.cursorBound) return;
            el.dataset.cursorBound = "true";

            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover");
            });

            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover");
            });
        });
    };

    updateHoverElements();

    // Run again periodically to bind dynamically added elements
    const observer = new MutationObserver(() => {
        updateHoverElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 6. Magnetic Effect on Header Links (Optional Premium Touch)
    const applyMagneticEffect = () => {
        const magneticElements = document.querySelectorAll(".navbar-nav .nav-link, .intent-chip");
        magneticElements.forEach((el) => {
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Pull element slightly towards the mouse
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            el.addEventListener("mouseleave", () => {
                el.style.transform = "";
            });
        });
    };

    applyMagneticEffect();
});
