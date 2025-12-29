import AOS from "aos";
import "aos/dist/aos.css";

document.addEventListener("DOMContentLoaded", function () {
    const starsContainer = document.getElementById("stars");
    // If Vanta is active we skip the legacy star generator to avoid visual overlap
    if (starsContainer && !window._vantaFogInstance) {
        const STAR_COUNT = 120;
        for (let i = 0; i < STAR_COUNT; i++) {
            const s = document.createElement("span");
            s.className = "star";
            const size = Math.random() * 2 + 1; // 1-3px
            s.style.width = size + "px";
            s.style.height = size + "px";
            s.style.left = Math.random() * 100 + "%";
            s.style.top = Math.random() * 100 + "%";
            s.style.opacity = (Math.random() * 0.8 + 0.2).toString();
            s.style.transform = "translateZ(0)";
            s.style.animation = `twinkle ${
                2 + Math.random() * 3
            }s ease-in-out ${Math.random() * 3}s infinite`;
            starsContainer.appendChild(s);
        }
    }

    // Button interactions
    const btn = document.getElementById("startBtn");
    if (btn) {
        // navigation guard to avoid spam-click creating many history entries
        function safeNavigateButton(btnEl, navigateFn, opts = {}) {
            const delay = opts.delay || 260;
            const blockKey = "__isNavigating";
            if (window[blockKey]) return;
            window[blockKey] = true;
            try {
                btnEl.disabled = true;
                btnEl.setAttribute("aria-busy", "true");
            } catch (e) {}
            // small button press animation
            btn.animate(
                [
                    { transform: "scale(1)", opacity: 1 },
                    { transform: "scale(0.98)", opacity: 0.9 },
                    { transform: "scale(1)", opacity: 1 },
                ],
                { duration: 240 }
            );
            // replace current history state to avoid duplicate entries if needed
            try {
                window.history.replaceState(
                    { step: "welcome" },
                    "",
                    window.location.pathname
                );
            } catch (e) {}
            setTimeout(function () {
                try {
                    navigateFn();
                } finally {
                    window[blockKey] = false;
                }
            }, delay);
        }

        btn.addEventListener("click", function () {
            safeNavigateButton(btn, function () {
                window.location.href = "/pilih-layout";
            });
        });

        btn.addEventListener("mouseenter", function () {
            btn.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.05)" }],
                { duration: 180, fill: "forwards" }
            );
        });

        btn.addEventListener("mouseleave", function () {
            btn.animate(
                [{ transform: "scale(1.05)" }, { transform: "scale(1)" }],
                { duration: 180, fill: "forwards" }
            );
        });
    }

    // initialize AOS for elements with data-aos after DOM content ready
    if (AOS) {
        AOS.init({
            duration: 1100,
            easing: "ease-out-cubic",
            once: true,
            mirror: false,
        });
        AOS.refresh();
    }
});
