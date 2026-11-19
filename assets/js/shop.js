/* Stuff'd. — shop: product grid, Flip filters, Flip quick view */
STUFFD.page(function (S) {
  const { PRODUCTS, biteSVG, byId } = S;
  const grid = document.getElementById("products");

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product" data-cat="${p.cat}" data-reveal>
      <div class="product-art" style="--panel:${p.panel}" data-flip-id="art-${p.id}" data-cursor="View" data-open="${p.id}" role="button" tabindex="0" aria-label="Quick view ${p.name}">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        ${biteSVG(p, { cut: true, cls: "bite-main" })}
        ${biteSVG(p, { cut: false, cls: "bite-alt" })}
        <button class="product-add" data-add="${p.id}">Add to bag</button>
      </div>
      <div class="product-info">
        <div><h3>${p.name}</h3><p>${p.sub}</p><span class="small muted">POS ${p.sku}</span></div>
        <span class="product-price">$${p.price.toFixed(2)}</span>
      </div>
    </article>`).join("");

  // live count after filtering
  const countEl = document.getElementById("productCount");
  const updateCount = () => {
    const n = grid.querySelectorAll(".product:not(.is-hidden)").length;
    gsap.to(countEl, { duration: 0.6, text: n + (n === 1 ? " product" : " products"), ease: "none" });
  };
  document.querySelectorAll(".filters .chip").forEach(c => c.addEventListener("click", () => setTimeout(updateCount, 20)));
  updateCount();
  if (location.hash === "#boxes") setTimeout(() => document.querySelector('[data-filter="boxes"]').click(), 900);

  // ---------- quick view (Flip from card art) ----------
  const qv = document.getElementById("qv");
  const qvArt = document.getElementById("qvArt");
  const qty = document.getElementById("qvQty");
  let current = null, sourceArt = null;

  function open(id, art) {
    const p = byId(id);
    current = p; sourceArt = art;
    qvArt.style.setProperty("--panel", p.panel);
    qvArt.innerHTML = biteSVG(p, { cut: true });
    document.getElementById("qvSub").textContent = p.kind === "flavor" ? p.sub : p.sub;
    document.getElementById("qvTitle").innerHTML = p.html;
    document.getElementById("qvDesc").textContent = p.desc;
    document.getElementById("qvNotes").innerHTML = p.notes.map(n => `<li>${n}</li>`).join("");
    document.getElementById("qvNutri").innerHTML = `<div><b>${p.sku}</b><span class="small">POS item</span></div>`;
    qty.textContent = "1";
    document.getElementById("qvAdd").dataset.add = p.id;
    document.getElementById("qvAdd").dataset.qty = "1";
    document.getElementById("qvPrice").textContent = "$" + p.price.toFixed(2);

    const state = Flip.getState(art);
    qvArt.dataset.flipId = art.dataset.flipId;
    qv.setAttribute("aria-hidden", "false");
    gsap.set(qv, { visibility: "visible" });
    S.smoother && S.smoother.paused(true);
    Flip.from(state, { targets: qvArt, duration: 0.85, ease: "power3.inOut", scale: true, absolute: true, zIndex: 5 });
    gsap.to(".qv-scrim", { opacity: 1, duration: 0.5 });
    gsap.fromTo(".qv-panel", { backgroundColor: "rgba(255,249,244,0)" }, { backgroundColor: "rgba(255,249,244,1)", duration: 0.5, delay: 0.3 });
    gsap.from(".qv-body > *", { y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.35 });
    gsap.from(qvArt.querySelector(".bite"), { rotation: -25, scale: 0.7, duration: 1.2, ease: "elastic.out(1,0.5)", delay: 0.4 });
    setTimeout(() => qv.querySelector(".qv-close").focus(), 50);
  }
  function close() {
    gsap.timeline({ onComplete: () => { gsap.set(qv, { visibility: "hidden" }); qv.setAttribute("aria-hidden", "true"); S.smoother && S.smoother.paused(false); sourceArt && sourceArt.focus({ preventScroll: true }); } })
      .to(".qv-body > *", { y: -20, autoAlpha: 0, stagger: 0.03, duration: 0.3 }, 0)
      .to(".qv-panel", { scale: 0.94, autoAlpha: 0, duration: 0.45, ease: "power3.in" }, 0.1)
      .to(".qv-scrim", { opacity: 0, duration: 0.4 }, 0.15)
      .set([".qv-panel", ".qv-body > *"], { clearProps: "all" });
  }
  grid.addEventListener("click", e => {
    if (e.target.closest("[data-add]")) return;
    const art = e.target.closest("[data-open]");
    if (art) open(art.dataset.open, art);
  });
  grid.addEventListener("keydown", e => {
    const art = e.target.closest("[data-open]");
    if (art && (e.key === "Enter" || e.key === " ") && !e.target.closest("[data-add]")) { e.preventDefault(); open(art.dataset.open, art); }
  });
  qv.addEventListener("click", e => {
    if (e.target.closest("[data-qv-close]")) close();
    const q = e.target.closest("[data-qty]");
    if (q) {
      const n = Math.max(1, Math.min(24, parseInt(qty.textContent, 10) + parseInt(q.dataset.qty, 10)));
      qty.textContent = n;
      document.getElementById("qvAdd").dataset.qty = String(n);
      gsap.fromTo(qty, { yPercent: q.dataset.qty > 0 ? 60 : -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(3)" });
      gsap.to("#qvPrice", { duration: 0.4, text: "$" + (n * current.price).toFixed(2), ease: "none" });
    }
    if (e.target.closest("#qvAdd")) setTimeout(close, 900);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && qv.getAttribute("aria-hidden") === "false") close(); });
});
