/* ==========================================================================
   MADEEA — catalogo.js
   Buscador en tiempo real, filtros por categoría y generación dinámica
   de tarjetas de producto a partir de productos.js.
   ========================================================================== */

(function () {
  "use strict";

  if (typeof productos === "undefined") {
    console.error("productos.js no se cargó correctamente.");
    return;
  }

  const grid = document.getElementById("catalog-grid");
  const searchInput = document.getElementById("search-input");
  const chipsWrap = document.getElementById("filter-chips");
  const resultsCount = document.getElementById("results-count");

  let activeCategory = "todas";
  let searchTerm = "";
  let lazyObserver = null;

  /* ---------------------------------------------------------------------
     Construir chips de filtro dinámicamente a partir de las categorías
     --------------------------------------------------------------------- */
  function buildChips() {
    const cats = [...new Set(productos.map((p) => p.categoria))];
    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-chip";
      btn.dataset.cat = cat;
      btn.textContent = cat;
      chipsWrap.appendChild(btn);
    });

    chipsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      chipsWrap.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      render();
    });
  }

  /* ---------------------------------------------------------------------
     Buscador en tiempo real
     --------------------------------------------------------------------- */
  function normalize(str) {
    return str
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = normalize(searchInput.value.trim());
      render();
    });
  }

  /* ---------------------------------------------------------------------
     Lazy loading para el grid dinámico
     --------------------------------------------------------------------- */
  function observeLazyImages() {
    const imgs = grid.querySelectorAll("img[data-src]");
    if (!("IntersectionObserver" in window)) {
      imgs.forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        img.classList.add("loaded");
      });
      return;
    }
    if (lazyObserver) lazyObserver.disconnect();
    lazyObserver = new IntersectionObserver(
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
      { rootMargin: "250px 0px" }
    );
    imgs.forEach((img) => lazyObserver.observe(img));
  }

  /* ---------------------------------------------------------------------
     Render principal del catálogo
     --------------------------------------------------------------------- */
  function cardTemplate(p, index) {
    const dims = p.diametro
      ? `<span>Diámetro <strong>${p.diametro}</strong></span>`
      : `<span>Ancho <strong>${p.ancho}</strong></span><span>Espesor <strong>${p.espesor}</strong></span>`;

    const mensaje = `Hola, estoy interesado en la moldura Ref. ${p.ref}.`;
    const waLink = window.MADEEA ? window.MADEEA.whatsappLink(mensaje) : "#";

    return `
      <article class="catalog-card" style="animation-delay:${Math.min(index, 16) * 45}ms">
        <div class="catalog-photo">
          <span class="catalog-cat">${p.categoria}</span>
          <img data-src="${p.imagen}" alt="Moldura MADEEA referencia ${p.ref}, categoría ${p.categoria}" loading="lazy">
        </div>
        <div class="catalog-body">
          <h4>Ref. ${p.ref}</h4>
          <div class="catalog-dims">${dims}</div>
          <a class="btn btn-whatsapp" href="${waLink}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:15px;height:15px;"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.51 2 12.05 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.53 3.7-8.22 8.24-8.22 2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.53-3.7 8.2-8.24 8.2Z"/></svg>
            Consultar
          </a>
        </div>
      </article>
    `;
  }

  function render() {
    let list = productos;

    if (activeCategory !== "todas") {
      list = list.filter((p) => p.categoria === activeCategory);
    }
    if (searchTerm) {
      list = list.filter((p) => normalize(p.ref).includes(searchTerm) || normalize(p.categoria).includes(searchTerm));
    }

    if (resultsCount) {
      resultsCount.textContent = `${list.length} referencia${list.length === 1 ? "" : "s"}`;
    }

    if (!list.length) {
      grid.innerHTML = `
        <div class="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <p>No encontramos referencias que coincidan con "<strong>${searchInput ? searchInput.value : ""}</strong>".</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map((p, i) => cardTemplate(p, i)).join("");
    observeLazyImages();
  }

  buildChips();
  render();
})();
