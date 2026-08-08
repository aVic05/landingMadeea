/* ==========================================================================
   MADEEA — main.js
   Comportamiento compartido: navbar, menú hamburguesa, animaciones al
   hacer scroll, header dinámico, lazy loading y utilidades de WhatsApp.
   ========================================================================== */

(function () {
  "use strict";

  const WHATSAPP_NUMBER = "573147027313";

  /* ---------------------------------------------------------------------
     1. Header dinámico: cambia de estilo al hacer scroll
     --------------------------------------------------------------------- */
  const navbar = document.querySelector(".navbar");

  function handleHeaderScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ---------------------------------------------------------------------
     2. Menú hamburguesa (mobile)
     --------------------------------------------------------------------- */
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     3. Animaciones al hacer scroll (IntersectionObserver)
     --------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealTargets.forEach((el, i) => {
      el.style.setProperty("--i", i % 8);
      revealObserver.observe(el);
    });
  } else {
    // Fallback: si no hay soporte, mostrar todo de inmediato
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
     4. Scroll suave para enlaces internos (#ancla)
     --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ---------------------------------------------------------------------
     5. Lazy loading de imágenes con atributo data-src
     --------------------------------------------------------------------- */
  const lazyImages = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window && lazyImages.length) {
    const imgObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            img.addEventListener("load", () => img.classList.add("loaded"));
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    lazyImages.forEach((img) => imgObserver.observe(img));
  } else {
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  /* ---------------------------------------------------------------------
     6. Utilidad global de WhatsApp (usada también en catalogo.js)
     --------------------------------------------------------------------- */
  window.MADEEA = window.MADEEA || {};
  window.MADEEA.whatsappNumber = WHATSAPP_NUMBER;
  window.MADEEA.whatsappLink = function (message) {
    const text = encodeURIComponent(message || "Hola, quiero más información sobre las molduras MADEEA.");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  };

  document.querySelectorAll("[data-wa-generic]").forEach((el) => {
    el.setAttribute("href", window.MADEEA.whatsappLink());
  });
})();
