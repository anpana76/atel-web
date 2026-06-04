// Premium Tech Effects: Collage Preloader, Particles Canvas, Spotlight, and Physics Smooth Scroll

document.addEventListener("DOMContentLoaded", () => {
    
    // ------------------------------------------------------------
    // 1. PREMIUM COLLAGE PRELOADER & LOGO SCROLL
    // ------------------------------------------------------------
    const initPremiumPreloader = () => {
        const preloader = document.createElement("div");
        preloader.id = "premium-preloader";
        
        preloader.innerHTML = `
            <div class="preloader-collage">
                <img class="preloader-collage-img" src="img/central.webp" alt="Sistemas Contra Incendios">
                <img class="preloader-collage-img" src="img/cctv(5).webp" alt="Videovigilancia CCTV">
                <img class="preloader-collage-img" src="img/access.webp" alt="Control de Accesos">
                <img class="preloader-collage-img" src="img/network.webp" alt="Redes de Voz y Datos">
                <img class="preloader-collage-img" src="img/portero1.webp" alt="Videoporteros">
                <img class="preloader-collage-img" src="img/equip.webp" alt="Mantenimiento Técnico">
            </div>
            <div class="preloader-overlay"></div>
            <div class="preloader-content">
                <div class="preloader-logo">ATEL <span>SISTEMS</span></div>
                <div class="preloader-bar-wrap">
                    <div class="preloader-bar" id="preloader-progress-bar"></div>
                </div>
                <div class="preloader-status" id="preloader-status-text">INICIALIZANDO SISTEMAS... 0%</div>
            </div>
        `;
        document.body.appendChild(preloader);
        
        // Disable scroll restoration during preloading to prevent snaps
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const bar = document.getElementById("preloader-progress-bar");
        const statusText = document.getElementById("preloader-status-text");

        let progress = 0;
        let isWindowLoaded = false;

        const handleLoad = () => {
            isWindowLoaded = true;
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
        }

        const progressInterval = setInterval(() => {
            const increment = isWindowLoaded ? Math.floor(Math.random() * 15) + 8 : Math.floor(Math.random() * 3) + 1;
            
            if (!isWindowLoaded && progress >= 90) {
                progress = 90;
            } else {
                progress += increment;
            }

            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                statusText.textContent = "CONEXIONES ESTABLES. DEPLOYING NODE...";
                
                setTimeout(() => {
                    document.body.classList.add("loaded");
                    preloader.style.opacity = "0";
                    preloader.style.visibility = "hidden";
                    setTimeout(() => {
                        preloader.remove();
                    }, 1000);
                }, 400);
            } else {
                statusText.textContent = `INICIALIZANDO SISTEMAS... ${progress}%`;
            }

            bar.style.width = `${progress}%`;
        }, 70);
    };
    initPremiumPreloader();

    const initLogoScroll = () => {
        const headerLogo = document.querySelector(".logo img");
        if (headerLogo) {
            headerLogo.addEventListener("click", () => {
                const pathname = window.location.pathname;
                const isHome = pathname === "/" || pathname === "/index.html" || pathname.endsWith("/index.html") || pathname === "";
                
                if (isHome) {
                    // Si estamos en la página principal, sube suavemente al inicio
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                } else {
                    // Si estamos en una subpágina, nos redirige al inicio de la página principal
                    // Se hace con un leve delay de 150ms para que se empiece a ver el aumento visual primero
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 150);
                }
            });
        }
    };
    initLogoScroll();

    // ------------------------------------------------------------
    // 2. HERO CONSTELLATION BACKGROUND
    // ------------------------------------------------------------
    const initHeroCanvas = () => {
        const hero = document.querySelector(".hero");
        if (!hero) return;

        const canvas = document.createElement("canvas");
        canvas.id = "hero-canvas";
        hero.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        let w = canvas.width = hero.offsetWidth;
        let h = canvas.height = hero.offsetHeight;

        window.addEventListener("resize", () => {
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        });

        const particles = [];
        const maxParticles = w < 768 ? 25 : 55;

        class Particle {
            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 255, 102, 0.4)";
                ctx.fill();
            }
        }

        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        let mouse = { x: -1000, y: -1000 };
        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        hero.addEventListener("mouseleave", () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        const drawLoop = () => {
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update();
                p1.draw();

                const dx = p1.x - mouse.x;
                const dy = p1.y - mouse.y;
                const distMouse = Math.sqrt(dx * dx + dy * dy);
                if (distMouse < 150) {
                    const force = (150 - distMouse) / 150;
                    p1.x += (dx / distMouse) * force * 2;
                    p1.y += (dy / distMouse) * force * 2;
                }

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const diffX = p1.x - p2.x;
                    const diffY = p1.y - p2.y;
                    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 255, 102, ${0.12 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawLoop);
        };

        drawLoop();
    };

    setTimeout(initHeroCanvas, 200);

    // ------------------------------------------------------------
    // 3. SPOTLIGHT CARD GLOW EFFECT
    // ------------------------------------------------------------
    const initSpotlight = () => {
        const cards = document.querySelectorAll(".accordion-item, .intent-strip-card, .cursos-panel");
        
        cards.forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            });
        });
    };

    initSpotlight();

    // ------------------------------------------------------------
    // 4. PHYSICS-BASED SMOOTH SCROLL (INERTIAL SCROLL)
    // ------------------------------------------------------------
    const initInertialScroll = () => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        let targetY = window.scrollY;
        let currentY = window.scrollY;
        const ease = 0.08;

        window.addEventListener("wheel", (e) => {
            if (document.body.style.overflow === "hidden") return;

            e.preventDefault();
            targetY += e.deltaY;
            targetY = Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight));
        }, { passive: false });

        const scrollLoop = () => {
            const diff = targetY - currentY;
            if (Math.abs(diff) > 0.3) {
                currentY += diff * ease;
                window.scrollTo(0, currentY);
            }
            requestAnimationFrame(scrollLoop);
        };
        
        scrollLoop();

        window.addEventListener("scroll", () => {
            if (Math.abs(window.scrollY - currentY) > 10) {
                targetY = window.scrollY;
                currentY = window.scrollY;
            }
        });
    };

    setTimeout(initInertialScroll, 400);
});