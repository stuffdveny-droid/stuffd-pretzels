/* =========================================================
   Stuff'd. — shared site engine (GSAP 3.13, every plugin)
   ========================================================= */
(function () {
  "use strict";

  gsap.registerPlugin(
    ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, ScrambleTextPlugin, TextPlugin,
    DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Flip, Draggable, InertiaPlugin, Observer,
    Physics2DPlugin, PhysicsPropsPlugin, CustomEase, CustomBounce, CustomWiggle,
    ExpoScaleEase, RoughEase, SlowMo
  );

  // ---------- signature eases ----------
  CustomEase.create("lux", "0.7,0,0.2,1");
  CustomEase.create("silk", "M0,0 C0.14,0 0.24,0.62 0.42,0.86 0.58,1.06 0.76,1 1,1");
  CustomBounce.create("pretzelBounce", { strength: 0.55, squash: 2.4, squashID: "pretzelBounce-squash" });
  CustomWiggle.create("bagWiggle", { wiggles: 7, type: "easeOut" });
  gsap.defaults({ ease: "expo.out", duration: 1 });

  const ARRIVED_VIA_NAV = document.documentElement.classList.contains("is-nav");
  try { sessionStorage.setItem("stuffd-nav", "0"); } catch (e) {}
  const mm = gsap.matchMedia();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- catalogue ----------
  const FLAVORS = [
    { id: "cheese", name: "Cheese", html: "Cheese", fill: "#F5C24C", panel: "#F7D98A", cat: "savory", price: 14.99, sku: "989750284", filling: "Cheese", notes: ["Current POS flavor"], desc: "A savory Stuff’d staple pouch from the current menu." },
    { id: "chocolate", name: "Chocolate", html: "Chocolate", fill: "#7A4128", panel: "#E9C9B5", cat: "sweet", price: 14.99, sku: "362719376", filling: "Chocolate", notes: ["Current POS flavor"], desc: "A sweet Stuff’d staple pouch from the current menu." },
    { id: "cinnamon-roll", name: "Cinnamon Roll", html: "Cinnamon <em>Roll</em>", fill: "#F1DEC4", swirl: true, panel: "#EED9B3", cat: "sweet", price: 14.99, sku: "097506328", filling: "Cinnamon Roll", notes: ["Current POS flavor"], desc: "A cinnamon-roll-inspired Stuff’d staple pouch from the current menu." },
    { id: "everything-cream-cheese", name: "Everything Cream Cheese", html: "Everything <em>Cream Cheese</em>", fill: "#F3EFE6", seeds: true, panel: "#E6E1D6", cat: "savory", price: 14.99, sku: "192038475", filling: "Everything Cream Cheese", notes: ["Current POS flavor"], desc: "A savory Stuff’d staple pouch from the current menu." },
    { id: "garlic-parm", name: "Garlic Parm", html: "Garlic <em>Parm</em>", fill: "#E3C59A", flecks: "#8B5A32", panel: "#EED9B3", cat: "savory", price: 14.99, sku: "564873690", filling: "Garlic Parm", notes: ["Current POS flavor"], desc: "A savory Stuff’d staple pouch from the current menu." },
    { id: "seasonal", name: "Seasonal", html: "The <em>Seasonal</em>", fill: "#CFDB8E", flecks: "#5E8B2E", panel: "#DCE6B4", cat: "seasonal", price: 14.99, sku: "749874638", filling: "Seasonal", notes: ["Rotating current POS flavor"], desc: "The rotating Stuff’d staple pouch listed as Seasonal on the current menu." },
    { id: "smores", name: "S’mores", html: "S’mores", fill: "#FFF1DE", sprinkles: true, panel: "#F4A6C6", cat: "sweet", price: 14.99, sku: "463829108", filling: "S’mores", notes: ["Current POS flavor"], desc: "A sweet Stuff’d staple pouch from the current menu." }
  ];
  const PRODUCTS = FLAVORS.map(f => ({ ...f, kind: "flavor", sub: "Stuff’d staple pouch" })).concat([
    { id: "party-24", name: "Party Box · 24 Count", html: "Party Box <em>24 Count</em>", fill: "#F5C24C", panel: "#F4A6C6", cat: "boxes", price: 32.99, sku: "324908276", kind: "box", sub: "24 count · POS 324908276",
      desc: "The 24-count Stuff’d Party Box from the current menu.", notes: ["24 count", "POS item 324908276"] },
    { id: "party-48", name: "Party Box · 48 Count", html: "Party Box <em>48 Count</em>", fill: "#7A4128", panel: "#EED9B3", cat: "boxes", price: 49.99, sku: "153286592", kind: "box", sub: "48 count · POS 153286592",
      desc: "The 48-count Stuff’d Party Box from the current menu.", notes: ["48 count", "POS item 153286592"] }
  ]);
  const veSlug = value => value.toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const veBuyUrl = (name, sku) => `https://portal.veinternational.org/buybuttons/us0111241/btn/${veSlug(name)}-${sku}/`;
  PRODUCTS.forEach(p => { p.veUrl = veBuyUrl(p.kind === "box" ? `Stuff'd ${p.name}` : `Stuff'd staple pouch - ${p.name}`, p.sku); });
  FLAVORS.forEach(f => { f.veUrl = PRODUCTS.find(p => p.id === f.id).veUrl; });
  const byId = id => PRODUCTS.find(p => p.id === id);

  // ---------- svg art ----------
  const PRETZEL_D = "M62,150 C90,120 120,90 135,60 C148,34 182,44 182,82 C182,135 140,165 100,165 C60,165 18,135 18,82 C18,44 52,34 65,60 C80,90 110,120 138,150";
  const SPRITE = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="gCrust" cx="45%" cy="30%" r="80%">
        <stop offset="0" stop-color="#E3974F"/><stop offset=".45" stop-color="#B9652A"/><stop offset="1" stop-color="#7A3410"/>
      </radialGradient>
      <linearGradient id="gSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE2B8" stop-opacity=".7"/><stop offset="1" stop-color="#FFE2B8" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gFillShine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gPretzel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D98B45"/><stop offset="1" stop-color="#9C4A1C"/>
      </linearGradient>
      <symbol id="pretzel" viewBox="6 26 188 152">
        <path d="${PRETZEL_D}" fill="none" stroke="#3A1A0E" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${PRETZEL_D}" fill="none" stroke="url(#gPretzel)" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
        <g fill="#FFF9F4"><circle cx="40" cy="70" r="3.2"/><circle cx="160" cy="70" r="3.2"/><circle cx="100" cy="160" r="3.2"/><circle cx="62" cy="128" r="2.6"/><circle cx="140" cy="128" r="2.6"/><circle cx="100" cy="102" r="2.6"/></g>
      </symbol>
      <symbol id="salt" viewBox="-6 -6 12 12"><path d="M0,-5.5 L5,-1.6 L3.2,4.8 L-3.2,4.8 L-5,-1.6Z" fill="#FFFDF9" stroke="rgba(58,26,14,.25)" stroke-width=".8"/></symbol>
      <symbol id="star" viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7z" fill="currentColor"/></symbol>
      <symbol id="spark" viewBox="0 0 40 40"><path d="M20 0 C21 13 27 19 40 20 C27 21 21 27 20 40 C19 27 13 21 0 20 C13 19 19 13 20 0Z" fill="currentColor"/></symbol>
      <symbol id="recycle" viewBox="-50 -50 100 100">
        <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3,-35.5 A36,36 0 0 1 34.8,9.3"/><path d="M44.3,0.5 L34.8,9.3 L31.0,-3.1"/><path d="M27.6,23.1 A36,36 0 0 1 -25.5,25.5"/><path d="M-22.5,38.1 L-25.5,25.5 L-12.8,28.4"/><path d="M-33.8,12.3 A36,36 0 0 1 -9.3,-34.8"/><path d="M-21.7,-38.6 L-9.3,-34.8 L-18.2,-25.3"/></g>
      </symbol>
    </defs>
  </svg>`;

  const SALT_TOP = [[72, 50, 0], [104, 36, -20], [138, 46, 30], [170, 58, 10], [90, 70, 40], [156, 82, -15], [122, 64, 5], [60, 84, 25], [186, 92, -30]];
  const SALT_CUT = [[64, 38, 0], [100, 30, 20], [140, 32, -15], [176, 40, 30], [52, 58, 10], [196, 60, -20]];
  function saltMarkup(list) {
    return list.map(([x, y, r]) => `<use href="#salt" x="${x - 6}" y="${y - 6}" width="12" height="12" transform="rotate(${r} ${x} ${y})"/>`).join("");
  }
  function sprinkles() {
    const cols = ["#E7799F", "#7FC8E8", "#F5C24C", "#9ED7A5", "#B79BEA", "#F28A5B"];
    let out = "";
    for (let i = 0; i < 16; i++) {
      const x = 82 + (i * 37) % 80, y = 74 + (i * 23) % 48, r = (i * 47) % 180;
      out += `<rect x="${x}" y="${y}" width="10" height="3.4" rx="1.7" fill="${cols[i % cols.length]}" transform="rotate(${r} ${x + 5} ${y + 1.7})"/>`;
    }
    return out;
  }
  function seeds() {
    let out = "";
    for (let i = 0; i < 26; i++) {
      const x = 56 + (i * 53) % 130, y = 30 + (i * 29) % 30, dark = i % 3 === 0;
      out += `<ellipse cx="${x}" cy="${y}" rx="${dark ? 1.6 : 2.6}" ry="${dark ? 1.6 : 1.3}" fill="${dark ? "#2B1A12" : "#F7EBD2"}" transform="rotate(${(i * 31) % 180} ${x} ${y})"/>`;
    }
    return out;
  }
  function flecks(color) {
    let out = "";
    for (let i = 0; i < 12; i++) {
      const x = 84 + (i * 41) % 74, y = 76 + (i * 19) % 44;
      out += `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="${color}" opacity=".85"/>`;
    }
    return out;
  }
  /** Stuffed pretzel bite. cut=true shows the cross-section with the filling. */
  function biteSVG(f, opts) {
    opts = opts || {};
    const cut = !!opts.cut;
    const cls = "bite " + (opts.cls || "");
    const body = "M28,58 C28,26 62,18 120,18 C178,18 212,26 212,58 L214,128 C214,158 180,166 120,166 C60,166 26,158 26,128 Z";
    let inner = "";
    if (cut) {
      inner = `
        <path d="M46,66 C46,48 70,44 120,44 C170,44 194,48 194,66 L195,122 C195,140 170,145 120,145 C70,145 45,140 45,122 Z" fill="#F7E2BC"/>
        <path d="M46,66 C46,48 70,44 120,44 C170,44 194,48 194,66 L194,74 C170,60 70,60 46,74Z" fill="#E9C48E" opacity=".7"/>
        <path d="M72,80 C72,66 92,63 120,63 C148,63 168,66 168,80 L169,112 C169,126 148,129 120,129 C92,129 71,126 71,112 Z" fill="${f.fill}"/>
        ${f.swirl ? `<path d="M90,96 C92,80 118,78 124,92 C130,106 108,114 104,102 C100,92 116,90 116,98" fill="none" stroke="#B87A45" stroke-width="5" stroke-linecap="round"/>` : ""}
        ${f.sprinkles ? sprinkles() : ""}${f.flecks ? flecks(f.flecks) : ""}
        <path d="M72,80 C72,66 92,63 120,63 C148,63 168,66 168,80 L168,90 C150,78 90,78 72,90Z" fill="url(#gFillShine)"/>
        ${f.id === "original" || f.id === "jalapeno" ? `<path d="M100,126 C100,140 104,150 108,150 C112,150 112,138 112,128Z" fill="${f.fill}"/>` : ""}`;
    } else {
      inner = `
        <path d="M44,40 C60,26 180,26 196,40 C200,54 186,58 120,58 C54,58 40,54 44,40Z" fill="url(#gSheen)"/>
        <path d="M64,92 C96,110 144,110 176,92" fill="none" stroke="#6E2D0C" stroke-width="5" stroke-linecap="round" opacity=".55"/>
        <path d="M64,92 C96,110 144,110 176,92" fill="none" stroke="#F0B47A" stroke-width="2" stroke-linecap="round" opacity=".45" transform="translate(0,-4)"/>
        ${f.seeds ? seeds() : saltMarkup(SALT_TOP)}`;
    }
    return `<svg class="${cls}" viewBox="0 0 240 190" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="174" rx="94" ry="11" fill="rgba(58,26,14,.2)"/>
      <path d="${body}" fill="url(#gCrust)"/>
      <path d="M28,128 C30,152 64,160 120,160 C176,160 210,152 212,128" fill="none" stroke="#5B220A" stroke-width="3" opacity=".35"/>
      ${inner}
      ${cut ? (f.seeds ? seeds() : saltMarkup(SALT_CUT)) : ""}
    </svg>`;
  }
  const PRETZEL_SVG = (cls) => `<svg class="${cls || ""}" viewBox="0 0 188 152" aria-hidden="true"><use href="#pretzel"/></svg>`;
  const LOGO = (cls) => `<span class="logo-mark ${cls || ""}">${PRETZEL_SVG("logo-pretzel")}<span class="logo-type">Stuff’d.</span></span>`;

  // ---------- chrome: header, menu, curtain, cursor, bag ----------
  const NAV = [
    ["index.html", "Home", "a"], ["shop.html", "Shop", "b"], ["flavors.html", "The Lineup", "c"],
    ["upcycled.html", "The Stuff’d Idea", "d"], ["story.html", "Our Story", "e"], ["journal.html", "Journal", "f"]
  ];
  function chrome() {
    document.body.insertAdjacentHTML("afterbegin", SPRITE + `
      <a class="sr-only" href="#main">Skip to content</a>
      <header class="site-header" id="siteHeader">
        <div class="h-left">
          <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu" data-magnetic=".25"><span class="bars"><i></i><i></i></span><span class="menu-word">Menu</span></button>
          <a class="h-link link-u" href="shop.html">Shop</a>
          <a class="h-link link-u" href="flavors.html">Flavors</a>
        </div>
        <a class="h-logo" href="index.html" aria-label="Stuff’d. home">${LOGO()}</a>
        <div class="h-right">
          <a class="h-link link-u" href="stockists.html">Find us</a>
          <a class="h-link link-u" href="shop.html#boxes" aria-label="Order Stuff’d through VE Hub">Order</a>
        </div>
      </header>
      <nav class="menu" id="menu" aria-label="Main">
        <ul class="menu-links">
          ${NAV.map(([h, l, g], i) => `<li><a href="${h}" data-preview="${i}"><span class="ml">${l}</span></a></li>`).join("")}
        </ul>
        <div class="menu-aside">
          <div class="menu-preview" id="menuPreview">${biteSVG(FLAVORS[0], { cut: true })}</div>
          <div class="menu-meta">
            <a class="link-u" href="stockists.html">Stockists</a>
            <a class="link-u" href="wholesale.html">Wholesale</a>
            <a class="link-u" href="faq.html">FAQ</a>
            <a class="link-u" href="contact.html">Contact</a>
            <a class="link-u" href="shop.html#boxes" style="margin-top:18px">Order through VE Hub ↗</a>
          </div>
        </div>
      </nav>
      <div class="curtain" id="curtain" aria-hidden="true"></div>
      <div class="cursor" aria-hidden="true"></div><div class="cursor-ring" aria-hidden="true"><span></span></div>
      `);

    document.querySelectorAll("[data-bite]").forEach(el => {
      el.innerHTML = biteSVG(byId(el.dataset.bite) || FLAVORS[0], { cut: el.hasAttribute("data-cut"), cls: el.dataset.biteClass || "" });
    });
    document.querySelectorAll("[data-pretzel]").forEach(el => { el.innerHTML = PRETZEL_SVG(); });

    const footerSlot = document.querySelector("[data-footer]");
    if (footerSlot) {
      footerSlot.outerHTML = `
      <footer class="site-footer" data-salt>
        <div class="wrap">
          <div class="f-top">
            <div class="f-col">
              <p class="f-lede">Soft pretzels. Big stuff inside.</p>
              <p class="small muted">The current menu is ready to order through VE Hub.</p>
              <a class="link-u" href="shop.html#boxes">Shop and order ↗</a>
            </div>
            <div class="f-col"><h4>Shop</h4><ul>
              <li><a class="link-u" href="shop.html">All bites</a></li><li><a class="link-u" href="flavors.html">The Lineup</a></li>
              <li><a class="link-u" href="shop.html#boxes">Boxes & gifts</a></li><li><a class="link-u" href="stockists.html">Stockists</a></li></ul></div>
            <div class="f-col"><h4>Stuff’d.</h4><ul>
              <li><a class="link-u" href="upcycled.html">The Stuff’d idea</a></li><li><a class="link-u" href="story.html">Our story</a></li>
              <li><a class="link-u" href="journal.html">Journal</a></li><li><a class="link-u" href="wholesale.html">Wholesale</a></li></ul></div>
            <div class="f-col"><h4>Help</h4><ul>
              <li><a class="link-u" href="faq.html">FAQ</a></li><li><a class="link-u" href="contact.html">Contact</a></li>
              <li><a class="link-u" href="https://instagram.com" rel="noopener">Instagram</a></li><li><a class="link-u" href="https://tiktok.com" rel="noopener">TikTok</a></li></ul></div>
          </div>
          <div class="f-bottom">
            <span>© 2026 Stuff’d. Soft pretzels. Good stuff inside.</span>
            <span class="idx">It’s what’s on the inside that counts</span>
            <button class="back-top link-u" data-top>Back to top</button>
          </div>
        </div>
        <div class="f-giant-wrap" aria-hidden="true"><div class="f-giant logo-type">Stuff’d.</div></div>
      </footer>`;
    }
  }

  // ---------- smooth scroll ----------
  let smoother = null;
  function initSmoother() {
    if (reduced || !document.querySelector("#smooth-wrapper")) return;
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper", content: "#smooth-content",
      smooth: 1.25, effects: true, smoothTouch: 0.1, normalizeScroll: false
    });
  }
  function scrollToTarget(target) {
    if (smoother) smoother.scrollTo(target, true, "top 80px");
    else gsap.to(window, { duration: 1.2, ease: "lux", scrollTo: { y: target, offsetY: 80 } });
  }

  // ---------- header behaviour ----------
  function initHeader() {
    const header = document.getElementById("siteHeader");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const y = self.scroll();
        header.classList.toggle("is-hidden", self.direction === 1 && y > 240 && !document.body.classList.contains("menu-open"));
      }
    });
    gsap.utils.toArray("[data-header='dark']").forEach(sec => {
      ScrollTrigger.create({
        trigger: sec, start: "top 40px", end: "bottom 40px",
        onToggle: self => header.classList.toggle("on-dark", self.isActive)
      });
    });
    if (document.body.dataset.header === "dark") header.classList.add("on-dark");
  }

  // ---------- menu ----------
  function initMenu() {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    const header = document.getElementById("siteHeader");
    const bars = btn.querySelectorAll(".bars i");
    const links = menu.querySelectorAll(".menu-links a");
    const preview = document.getElementById("menuPreview");
    const tl = gsap.timeline({ paused: true, defaults: { ease: "lux" },
      onReverseComplete: () => gsap.set(menu, { visibility: "hidden" }) })
      .set(menu, { visibility: "visible" })
      .fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 })
      .to(bars[0], { y: 4, rotation: 45, duration: 0.5 }, 0)
      .to(bars[1], { y: -4, rotation: -45, duration: 0.5 }, 0)
      .fromTo(links, { yPercent: 110, rotation: 3 }, { yPercent: 0, rotation: 0, stagger: 0.05, duration: 1, ease: "expo.out" }, 0.35)
      .fromTo(".menu-aside > *", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "expo.out" }, 0.45);
    const word = btn.querySelector(".menu-word");
    function toggle(open) {
      const isOpen = open ?? btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
      header.classList.toggle("on-dark", isOpen);
      gsap.to(word, { duration: 0.6, scrambleText: { text: isOpen ? "Close" : "Menu", chars: "lowerCase", speed: 0.6 } });
      if (isOpen) { tl.timeScale(1).play(); smoother && smoother.paused(true); }
      else { tl.timeScale(1.6).reverse(); smoother && smoother.paused(false); }
    }
    btn.addEventListener("click", () => toggle());
    document.addEventListener("keydown", e => { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") toggle(false); });
    links.forEach((a, i) => a.addEventListener("pointerenter", () => {
      const f = FLAVORS[i % FLAVORS.length];
      gsap.to(preview, { backgroundColor: f.panel, duration: 0.6, ease: "power2.out" });
      const old = preview.querySelector(".bite");
      preview.insertAdjacentHTML("beforeend", biteSVG(f, { cut: i % 2 === 0 }));
      const nu = preview.lastElementChild;
      gsap.set(nu, { position: "absolute", width: "70%" });
      gsap.fromTo(nu, { yPercent: 60, rotation: 25, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" });
      if (old) gsap.to(old, { yPercent: -60, rotation: -25, autoAlpha: 0, duration: 0.6, onComplete: () => old.remove() });
    }));
  }

  // ---------- custom cursor ----------
  function initCursor() {
    if (!finePointer || reduced) return;
    const dot = document.querySelector(".cursor"), ring = document.querySelector(".cursor-ring"), label = ring.querySelector("span");
    gsap.set([dot, ring], { xPercent: 0, yPercent: 0 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" }), dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
    window.addEventListener("pointermove", e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cursor], a, button, input, textarea, select, .marquee");
      if (!t) return;
      const text = t.dataset.cursor || (t.classList.contains("marquee") ? "Drag" : "");
      if (text) { label.textContent = text; ring.classList.add("has-label"); gsap.to(ring, { scale: 2.1, duration: 0.5, ease: "expo.out" }); gsap.to(dot, { scale: 0, duration: 0.3 }); }
      else gsap.to(ring, { scale: 1.45, duration: 0.5, ease: "expo.out" });
    });
    document.addEventListener("pointerout", e => {
      const t = e.target.closest("[data-cursor], a, button, input, textarea, select, .marquee");
      if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
      ring.classList.remove("has-label");
      gsap.to(ring, { scale: 1, duration: 0.5, ease: "expo.out" }); gsap.to(dot, { scale: 1, duration: 0.3 });
    });
    document.addEventListener("pointerdown", () => gsap.to(ring, { scale: "*=0.8", duration: 0.2, yoyo: true, repeat: 1 }));
  }

  // ---------- magnetic (21st.dev Magnetic Button, GSAP port) ----------
  function initMagnetic(root) {
    if (!finePointer || reduced) return;
    (root || document).querySelectorAll("[data-magnetic]").forEach(el => {
      if (el._mag) return; el._mag = true;
      const s = parseFloat(el.dataset.magnetic) || 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
      const label = el.querySelector(".btn-label");
      const lx = label && gsap.quickTo(label, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
      const ly = label && gsap.quickTo(label, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2), my = e.clientY - (r.top + r.height / 2);
        xTo(mx * s); yTo(my * s);
        if (label) { lx(mx * s * 0.4); ly(my * s * 0.4); }
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); if (label) { lx(0); ly(0); } });
    });
  }

  // ---------- page transitions ----------
  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  }
  function initTransitions() {
    const curtain = document.getElementById("curtain");
    gsap.set(curtain, { y: 0, yPercent: document.documentElement.classList.contains("is-nav") ? 0 : 100 });
    let leaving = false, leaveTl = null, leaveTimer = 0;
    document.addEventListener("click", e => {
      const a = e.target.closest("a");
      if (!isInternal(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      store.sset("stuffd-nav", "1");
      let went = false;
      const go = () => { if (went) return; went = true; location.href = a.href; };
      leaveTl = gsap.timeline({ onComplete: go })
        .set(curtain, { y: 0, yPercent: 100 })
        .to(curtain, { yPercent: 0, duration: 0.7, ease: "lux" });
      leaveTimer = setTimeout(go, 1200); // navigate even if animation frames are throttled
    });
    window.addEventListener("pageshow", e => {
      if (!e.persisted) return;
      // restored from the back/forward cache mid-transition: stop the exit and uncover the page
      if (leaveTl) { leaveTl.kill(); leaveTl = null; }
      clearTimeout(leaveTimer);
      gsap.killTweensOf(curtain);
      leaving = false;
      store.sset("stuffd-nav", "0");
      document.documentElement.classList.remove("is-nav");
      gsap.set(curtain, { y: 0, yPercent: 100 });
    });
  }
  let curtainPromise = null;
  function curtainOut() {
    if (curtainPromise) return curtainPromise;
    curtainPromise = new Promise(resolve => {
      const html = document.documentElement;
      const curtain = document.getElementById("curtain");
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      if (!curtain || !html.classList.contains("is-nav")) {
        html.classList.remove("is-nav");
        if (curtain) gsap.set(curtain, { y: 0, yPercent: 100 });
        finish();
        return;
      }
      gsap.set(curtain, { y: 0, yPercent: 0 });
      html.classList.remove("is-nav");
      const tl = gsap.timeline({ onComplete: () => { gsap.set(curtain, { yPercent: 100 }); finish(); } })
        .to(curtain, { yPercent: -100, duration: 0.85, ease: "lux" }, 0.05)
        .call(finish, null, 0.4);
      // never leave the page covered, even if the ticker stalls
      setTimeout(() => { if (tl.progress() < 1) tl.progress(1); finish(); }, 1600);
    });
    return curtainPromise;
  }

  // ---------- preloader (home) ----------
  function preloader() {
    return new Promise(resolve => {
      const pl = document.querySelector(".preloader");
      if (!pl) { resolve(); return; }
      const path = pl.querySelector(".pl-path");
      const shadow = pl.querySelector(".pl-shadow");
      const count = pl.querySelector(".pl-count");
      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: () => { pl.remove(); } });
      tl.fromTo([shadow, path], { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 2.1, ease: "power2.inOut", stagger: 0.08 })
        .to(counter, { v: 100, duration: 2.1, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
        .fromTo(pl.querySelectorAll(".pl-salt"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, stagger: 0.06, duration: 0.6, ease: "back.out(3)" }, 1.6)
        .to(pl.querySelector(".pl-word"), { duration: 1.2, scrambleText: { text: "Rescued. Stuffed. Baked twice.", chars: "Stufd'.", speed: 0.4 } }, 0.2)
        .to(path, { morphSVG: { shape: ".pl-target", type: "rotational" }, duration: 0.8, ease: "power3.inOut" }, 2.25)
        .to(shadow, { autoAlpha: 0, duration: 0.3 }, 2.25)
        .to([count, pl.querySelector(".pl-word"), pl.querySelectorAll(".pl-salt")], { autoAlpha: 0, y: -20, duration: 0.4, stagger: 0.04 }, 2.25)
        .to(pl.querySelector(".pl-blob"), { scale: () => Math.hypot(innerWidth, innerHeight) / 36, duration: 1.1, ease: "expoScale(1, 60, power2.inOut)" }, 2.75)
        .call(resolve, null, 3.25)
        .to(pl, { autoAlpha: 0, duration: 0.5 }, 3.6);
      // safety: never trap the visitor behind the preloader
      setTimeout(() => { if (document.body.contains(pl)) { gsap.to(pl, { autoAlpha: 0, duration: 0.4, onComplete: () => pl.remove() }); } resolve(); }, 6000);
    });
  }

  // ---------- text effects ----------
  // SplitText masks clip at the line box; give them room for descenders (g, y, p) and accents
  function padMasks(self) {
    if (self && self.masks && self.masks.length) {
      gsap.set(self.masks, { paddingTop: "0.06em", marginTop: "-0.06em", paddingBottom: "0.2em", marginBottom: "-0.2em" });
    }
  }
  function initSplits(root) {
    const scope = root || document;
    // masked line reveal (21st.dev Text Reveal Mask → SplitText port)
    scope.querySelectorAll("[data-split='lines']").forEach(el => {
      SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit(self) {
          padMasks(self);
          return gsap.from(self.lines, {
            yPercent: 112, duration: 1.3, ease: "expo.out", stagger: 0.09, delay: parseFloat(el.dataset.delay) || 0,
            scrollTrigger: el.hasAttribute("data-now") ? null : { trigger: el, start: "top 88%", once: true }
          });
        }
      });
    });
    // characters rise with a slight tilt
    scope.querySelectorAll("[data-split='chars']").forEach(el => {
      SplitText.create(el, {
        type: "words,chars", mask: "words", autoSplit: false,
        onSplit(self) {
          padMasks(self);
          return gsap.from(self.chars, {
            yPercent: 120, rotation: 6, duration: 1.2, ease: "expo.out", stagger: 0.025, delay: parseFloat(el.dataset.delay) || 0,
            scrollTrigger: el.hasAttribute("data-now") ? null : { trigger: el, start: "top 90%", once: true }
          });
        }
      });
    });
    // blur-and-slide words (21st.dev Text Reveal, GSAP port)
    scope.querySelectorAll("[data-split='blur']").forEach(el => {
      SplitText.create(el, {
        type: "words", autoSplit: false,
        onSplit(self) {
          return gsap.from(self.words, {
            autoAlpha: 0, y: 24, filter: "blur(12px)", duration: 1.1, ease: "power3.out", stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          });
        }
      });
    });
    // scroll-scrubbed word ink
    scope.querySelectorAll("[data-split='scrub']").forEach(el => {
      SplitText.create(el, {
        type: "words", autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(self.words, { opacity: 0.13 }, {
            opacity: 1, ease: "none", stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
          });
        }
      });
    });
    // scramble labels
    scope.querySelectorAll("[data-scramble]").forEach(el => {
      const text = el.dataset.scramble || el.textContent;
      ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: () => gsap.fromTo(el, { scrambleText: { text: " " } }, { duration: 1.3, scrambleText: { text, chars: "Stuffd'.✦", speed: 0.45, revealDelay: 0.2 } })
      });
    });
  }

  function initReveals(root) {
    const scope = root || document;
    const items = scope.querySelectorAll("[data-reveal]");
    if (items.length) {
      gsap.set(items, { autoAlpha: 0, y: 50 });
      ScrollTrigger.batch(items, {
        start: "top 90%", once: true, interval: 0.12, batchMax: 6,
        onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, overwrite: true })
      });
    }
    scope.querySelectorAll(".rule").forEach(r => gsap.from(r, { scaleX: 0, duration: 1.6, ease: "lux", scrollTrigger: { trigger: r, start: "top 92%", once: true } }));
    scope.querySelectorAll("[data-draw]").forEach(svg => {
      const paths = svg.querySelectorAll("path, line, circle, polyline");
      gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 2, ease: "power2.inOut", stagger: 0.1, scrollTrigger: { trigger: svg, start: "top 85%", once: true } });
    });
    scope.querySelectorAll("[data-count]").forEach(el => {
      const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      const o = { v: 0 };
      const fmt = v => pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      el.textContent = fmt(0);
      gsap.to(o, { v: end, duration: 2.4, ease: "power3.out", onUpdate: () => { el.textContent = fmt(o.v); },
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    scope.querySelectorAll("[data-spin]").forEach(el => {
      gsap.to(el, { rotation: 360 * (parseFloat(el.dataset.spin) || 1), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    scope.querySelectorAll("[data-float]").forEach((el, i) => {
      gsap.to(el, { y: "+=" + (14 + (i % 3) * 6), rotation: (i % 2 ? 1 : -1) * 4, duration: 2.6 + (i % 4) * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  }

  // ---------- marquee (21st.dev draggable Marquee → GSAP ticker + Draggable/Inertia) ----------
  function initMarquees(root) {
    (root || document).querySelectorAll(".marquee").forEach(m => {
      if (m._mq) return; m._mq = true;
      const track = m.querySelector(".marquee-track");
      const group = track.querySelector(".marquee-group");
      for (let i = 0; i < 2; i++) { const c = group.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.inert = true; track.appendChild(c); }
      const dir = m.dataset.direction === "right" ? 1 : -1;
      const speed = parseFloat(m.dataset.marqueeSpeed) || 70;
      let width = group.offsetWidth, x = 0, flip = 1, boost = 0, dragging = false, hover = false;
      const wrap = () => gsap.utils.wrap(-width, 0);
      let wrapX = wrap();
      const setX = gsap.quickSetter(track, "x", "px");
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3" });
      ScrollTrigger.addEventListener("refresh", () => { width = group.offsetWidth; wrapX = wrap(); });
      gsap.ticker.add((t, dt) => {
        if (!dragging && !reduced) x += dir * flip * speed * (1 + boost) * (hover ? 0.3 : 1) * dt / 1000;
        boost *= 0.94;
        setX(wrapX(x));
      });
      ScrollTrigger.create({
        trigger: m, start: "top bottom", end: "bottom top",
        onUpdate(self) {
          const v = self.getVelocity();
          flip = self.direction === 1 ? 1 : -1;
          boost = Math.max(boost, gsap.utils.clamp(0, 8, Math.abs(v) / 350));
          skewTo(gsap.utils.clamp(-10, 10, v / -260));
        },
        onScrubComplete: () => skewTo(0)
      });
      ScrollTrigger.addEventListener("scrollEnd", () => skewTo(0));
      m.addEventListener("pointerenter", () => { hover = !!m.dataset.slowHover; });
      m.addEventListener("pointerleave", () => { hover = false; });
      const proxy = document.createElement("div");
      let start = 0;
      Draggable.create(proxy, {
        type: "x", trigger: m, inertia: true, allowContextMenu: true,
        onPress() { start = x - this.x; dragging = true; m.classList.add("is-dragging"); },
        onDrag() { x = start + this.x; },
        onThrowUpdate() { x = start + this.x; },
        onRelease() { m.classList.remove("is-dragging"); if (!this.tween || !this.tween.isActive()) dragging = false; },
        onThrowComplete() { dragging = false; }
      });
    });
  }

  // ---------- salt burst (Physics2D + PhysicsProps) ----------
  function initSalt() {
    if (reduced) return;
    document.addEventListener("pointerdown", e => {
      const zone = e.target.closest("[data-salt]");
      if (!zone || e.target.closest("a, button, input, form")) return;
      for (let i = 0; i < 16; i++) {
        const s = document.createElement("i");
        s.className = "salt";
        document.body.appendChild(s);
        gsap.set(s, { x: e.clientX, y: e.clientY, scale: gsap.utils.random(0.6, 1.5) });
        gsap.to(s, {
          duration: gsap.utils.random(1.1, 1.8),
          physics2D: { velocity: gsap.utils.random(260, 620), angle: gsap.utils.random(200, 340), gravity: 1100 },
          physicsProps: { rotation: { velocity: gsap.utils.random(-720, 720), friction: 0.05 } },
          autoAlpha: 0, ease: "none", onComplete: () => s.remove()
        });
      }
    });
  }

  // ---------- reactive backgrounds: soft light that follows the pointer ----------
  function initReactive() {
    if (!finePointer || reduced) return;
    const sel = ".hero, .page-hero, .bg-pink, .bg-blush, .bg-cream, .bg-cocoa, .layers, .inside, .hz, .site-footer";
    document.querySelectorAll(sel).forEach(sec => {
      if (sec.querySelector(":scope > .r-glow")) return;
      if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
      sec.classList.add("is-reactive");
      const glow = document.createElement("div");
      glow.className = "r-glow";
      sec.prepend(glow);
      const pos = { x: 50, y: 50 };
      const apply = () => { glow.style.setProperty("--gx", pos.x + "%"); glow.style.setProperty("--gy", pos.y + "%"); };
      const xTo = gsap.quickTo(pos, "x", { duration: 0.9, ease: "power3", onUpdate: apply });
      const yTo = gsap.quickTo(pos, "y", { duration: 0.9, ease: "power3", onUpdate: apply });
      sec.addEventListener("pointermove", e => {
        const r = sec.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width) * 100);
        yTo(((e.clientY - r.top) / r.height) * 100);
      });
    });
  }

  // ---------- flip filter ----------
  function initFilters(root) {
    (root || document).querySelectorAll("[data-filter-group]").forEach(group => {
      const chips = group.querySelectorAll("[data-filter]");
      const target = document.querySelector(group.dataset.filterGroup);
      if (!target) return;
      chips.forEach(chip => chip.addEventListener("click", () => {
        chips.forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
        const f = chip.dataset.filter;
        const items = target.querySelectorAll("[data-cat]");
        const state = Flip.getState(items);
        items.forEach(it => it.classList.toggle("is-hidden", !(f === "all" || it.dataset.cat.split(" ").includes(f))));
        Flip.from(state, {
          duration: 0.8, ease: "power3.inOut", absolute: true, scale: true, stagger: 0.03,
          onEnter: els => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }),
          onLeave: els => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
          onComplete: () => ScrollTrigger.refresh()
        });
      }));
    });
  }

  // ---------- accordion ----------
  function initAccordions(root) {
    (root || document).querySelectorAll(".acc-item").forEach(item => {
      const btn = item.querySelector(".acc-btn"), panel = item.querySelector(".acc-panel");
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        gsap.to(panel, { height: open ? "auto" : 0, duration: 0.7, ease: "lux", onComplete: () => ScrollTrigger.refresh() });
        if (open) gsap.from(panel.querySelector("p"), { y: 16, autoAlpha: 0, duration: 0.8, ease: "expo.out", delay: 0.1 });
      });
    });
  }

  // ---------- fake forms ----------
  function initForms(root) {
    (root || document).querySelectorAll("[data-fake-form]").forEach(form => {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const msg = form.parentElement.querySelector(".form-msg") || form.querySelector(".form-msg");
        const text = form.dataset.success || "Thanks. We’ll be in touch.";
        const btn = form.querySelector("[type=submit]");
        gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.9, ease: "elastic.out(1,0.4)" });
        if (msg) gsap.to(msg, { duration: 1.2, scrambleText: { text, chars: "Stuffd'.✦", speed: 0.5 } });
        form.reset();
      });
    });
  }

  // ---------- bag ----------
  let bag = store.get("stuffd-bag", []);
  function bagCount() { return bag.reduce((n, l) => n + l.qty, 0); }
  function bagTotal() { return bag.reduce((n, l) => n + l.qty * (byId(l.id)?.price || 0), 0); }
  function renderBag() {
    const list = document.getElementById("bagItems");
    const count = document.getElementById("bagCount");
    count.textContent = bagCount();
    document.getElementById("bagTotal").textContent = "$" + bagTotal().toFixed(2);
    if (!bag.length) {
      list.innerHTML = `<li class="bag-empty" style="display:grid;grid-template-columns:1fr;border:0">${PRETZEL_SVG("ornament")}<p>Your bag is empty. The pretzels are getting lonely.</p><a class="btn btn--ghost" href="shop.html"><span class="btn-label">Shop the bites</span></a></li>`;
      return;
    }
    list.innerHTML = bag.map(l => {
      const p = byId(l.id); if (!p) return "";
      return `<li data-id="${p.id}"><div class="thumb" style="--panel:${p.panel}">${biteSVG(p, { cut: true })}</div>
        <div><strong>${p.name}</strong><span class="small muted">${l.qty} × $${p.price.toFixed(2)}</span></div>
        <button class="small link-u" data-remove="${p.id}">Remove</button></li>`;
    }).join("");
  }
  function openBag(open) {
    const el = document.getElementById("bag");
    el.setAttribute("aria-hidden", String(!open));
    if (open) {
      renderBag();
      smoother && smoother.paused(true);
      gsap.timeline()
        .set(el, { visibility: "visible" })
        .to(el.querySelector(".bag-scrim"), { opacity: 1, duration: 0.5 }, 0)
        .to(el.querySelector(".bag-panel"), { xPercent: 0, duration: 0.9, ease: "lux" }, 0)
        .from(el.querySelectorAll(".bag-items li"), { x: 40, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: "expo.out" }, 0.35);
    } else {
      smoother && smoother.paused(false);
      gsap.timeline({ onComplete: () => gsap.set(el, { visibility: "hidden" }) })
        .to(el.querySelector(".bag-panel"), { xPercent: 100, duration: 0.7, ease: "lux" }, 0)
        .to(el.querySelector(".bag-scrim"), { opacity: 0, duration: 0.5 }, 0.1);
    }
  }
  function addToBag(id, qty, fromEl) {
    qty = qty || 1;
    const line = bag.find(l => l.id === id);
    if (line) line.qty += qty; else bag.push({ id, qty });
    store.set("stuffd-bag", bag);
    const countEl = document.getElementById("bagCount");
    const fly = () => {
      countEl.textContent = bagCount();
      gsap.fromTo(countEl, { rotation: 0 }, { rotation: 18, duration: 0.9, ease: "bagWiggle" });
      gsap.fromTo(countEl, { scale: 1.5 }, { scale: 1, duration: 0.9, ease: "elastic.out(1,0.3)" });
      document.getElementById("siteHeader").classList.remove("is-hidden");
    };
    if (!fromEl || reduced) { fly(); return; }
    const p = byId(id);
    const a = fromEl.getBoundingClientRect(), b = countEl.getBoundingClientRect();
    const flyer = document.createElement("div");
    flyer.className = "flyer";
    flyer.innerHTML = biteSVG(p, { cut: true });
    document.body.appendChild(flyer);
    const sx = a.left + a.width / 2 - 35, sy = a.top + a.height / 2 - 28;
    const ex = b.left + b.width / 2 - 35, ey = b.top + b.height / 2 - 28;
    gsap.set(flyer, { x: sx, y: sy });
    gsap.timeline({ onComplete: () => { flyer.remove(); fly(); } })
      .fromTo(flyer, { scale: 0.4 }, { scale: 1.3, duration: 0.3, ease: "back.out(3)" })
      .to(flyer, {
        duration: 0.95, ease: "power2.inOut",
        motionPath: { path: [{ x: sx, y: sy }, { x: (sx + ex) / 2 - 120, y: Math.min(sy, ey) - 180 }, { x: ex, y: ey }], curviness: 1.4, autoRotate: false },
        rotation: 540, scale: 0.35
      }, 0.15);
  }
  function initBag() {
    gsap.set(".bag-panel", { x: 0, xPercent: 100 });
    renderBag();
    document.getElementById("bagBtn").addEventListener("click", () => openBag(true));
    document.getElementById("bag").addEventListener("click", e => {
      if (e.target.closest("[data-bag-close]")) openBag(false);
      const r = e.target.closest("[data-remove]");
      if (r) {
        const li = r.closest("li");
        gsap.to(li, { x: 60, autoAlpha: 0, height: 0, padding: 0, duration: 0.5, ease: "power3.in", onComplete: () => {
          bag = bag.filter(l => l.id !== r.dataset.remove); store.set("stuffd-bag", bag); renderBag();
        } });
      }
    });
    document.getElementById("checkoutBtn").addEventListener("click", e => {
      const lbl = e.currentTarget.querySelector(".btn-label");
      gsap.to(lbl, { duration: 1, scrambleText: { text: bag.length ? "Checkout opens at launch" : "Add a bite first", chars: "Stufd'.", speed: 0.5 } });
      gsap.to(lbl, { delay: 2.6, duration: 0.8, scrambleText: { text: "Check out", chars: "Stufd'." } });
    });
    document.addEventListener("click", e => {
      const add = e.target.closest("[data-add]");
      if (add) { e.preventDefault(); addToBag(add.dataset.add, parseInt(add.dataset.qty || "1", 10), add); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("bag").getAttribute("aria-hidden") === "false") openBag(false); });
  }

  // ---------- footer ----------
  function initFooter() {
    const giant = document.querySelector(".f-giant");
    if (giant) {
      // size the wordmark to the exact available width so it is never clipped
      const fit = () => {
        const wrap = giant.parentElement;
        const cs = getComputedStyle(wrap);
        const avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        giant.style.fontSize = "100px";
        const w = giant.scrollWidth;
        giant.style.fontSize = Math.floor((avail / w) * 100 * 0.98) + "px";
      };
      fit();
      let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { fit(); ScrollTrigger.refresh(); }, 150); });
      const split = SplitText.create(giant, { type: "chars" });
      gsap.from(split.chars, {
        yPercent: 105, ease: "power3.out", stagger: 0.06,
        scrollTrigger: { trigger: giant.parentElement, start: "top bottom", end: "bottom bottom", scrub: 1 }
      });
      if (finePointer && !reduced) split.chars.forEach(c => c.addEventListener("pointerenter", () => {
        gsap.fromTo(c, { yPercent: 0 }, { yPercent: -8, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 });
        gsap.fromTo(c, { rotation: 0 }, { rotation: 10, duration: 0.8, ease: "bagWiggle" });
      }));
    }
    document.querySelectorAll("[data-top]").forEach(b => b.addEventListener("click", () => {
      if (smoother) smoother.scrollTo(0, true); else gsap.to(window, { scrollTo: 0, duration: 1.6, ease: "lux" });
    }));
  }

  // ---------- anchor links ----------
  function initAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href^='#']");
      if (!a || a.getAttribute("href").length < 2) return;
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      scrollToTarget(t);
    });
  }

  // ---------- public api ----------
  const pageFns = [];
  const introFns = [];
  window.STUFFD = {
    FLAVORS, PRODUCTS, byId, biteSVG, PRETZEL_SVG, LOGO, PRETZEL_D, mm, reduced, finePointer, padMasks,
    get smoother() { return smoother; },
    page(fn) { pageFns.push(fn); },
    afterIntro(fn) { introFns.push(fn); },
    addToBag, openBag, initSplits, initReveals, initMagnetic, initMarquees, scrollToTarget
  };

  // ---------- boot ----------
  function safe(fn, label) {
    try { fn(); } catch (err) { console.error("[Stuff'd] " + (label || "init") + " failed", err); }
  }
  function boot() {
    safe(chrome, "chrome");
    // start the arrival transition first so nothing below can leave the page covered
    const pl = document.querySelector(".preloader");
    const firstVisit = store.sget("stuffd-seen") !== "1";
    const skipFlag = document.documentElement.classList.contains("skip-preloader");
    const showPreloader = !!pl && !ARRIVED_VIA_NAV && !skipFlag && firstVisit && !reduced;
    if (pl && !showPreloader) pl.remove();
    if (pl) store.sset("stuffd-seen", "1");
    safe(initTransitions, "transitions");

    safe(initSmoother, "smoother");
    safe(initHeader, "header");
    safe(initMenu, "menu");
    safe(initCursor, "cursor");
    safe(initAnchors, "anchors");
    safe(initSalt, "salt");
    // page-specific (pins) first so later triggers measure pin spacing correctly
    pageFns.forEach(fn => safe(() => fn(window.STUFFD), "page"));
    safe(initSplits, "splits");
    safe(initReveals, "reveals");
    safe(initMarquees, "marquees");
    safe(initMagnetic, "magnetic");
    safe(initFilters, "filters");
    safe(initAccordions, "accordions");
    safe(initForms, "forms");
    safe(initFooter, "footer");
    safe(initReactive, "reactive");
    safe(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, "refresh");

    const intro = showPreloader ? preloader() : curtainOut();
    intro.then(() => introFns.forEach(fn => safe(() => fn(window.STUFFD), "intro")));
    if (location.hash) {
      safe(() => {
        const t = document.querySelector(location.hash);
        if (t) setTimeout(() => scrollToTarget(t), 400);
      }, "hash");
    }
  }
  function ready() {
    const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
    fontsReady.then(boot);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
