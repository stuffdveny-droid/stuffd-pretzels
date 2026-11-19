/* Stuff'd. — The Lineup: full-screen Observer slideshow */
STUFFD.page(function (S) {
  const { FLAVORS, biteSVG, byId } = S;
  const ROMAN = ["01", "02", "03", "04", "05", "06", "07", "08"];
  const main = document.getElementById("main");
  const total = FLAVORS.length + 1;

  main.innerHTML = FLAVORS.map((f, i) => `
    <section class="slide" id="${f.id}" aria-roledescription="slide" aria-label="${i + 1} of ${total}: ${f.name}">
      <div class="slide-outer"><div class="slide-inner">
        <div class="slide-bg" style="--slide:${f.panel}">
          <div class="slide-copy">
            <span class="slide-kicker">${f.cat === "sweet" ? "Sweet" : f.cat === "savory" ? "Savory" : "Seasonal"} flavor</span>
            <h2 class="slide-title">${f.html}</h2>
            <p class="body-l slide-desc"><strong>${f.filling}.</strong> ${f.desc}</p>
            <div class="slide-specs"><span><b>$${f.price.toFixed(2)}</b>Current pouch price</span><span><b>${f.sku}</b>POS item</span></div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
              <a class="btn" href="${f.veUrl}" target="_blank" rel="noopener noreferrer" data-ve-buy data-magnetic><span class="btn-label">Buy on VE Hub<span class="btn-price">$${f.price.toFixed(2)}</span></span></a>
              <a class="btn btn--ghost" href="shop.html#boxes" data-magnetic><span class="btn-label">Visit the shop</span></a>
            </div>
          </div>
          <div class="slide-art"><div class="disc"></div>${biteSVG(f, { cut: true })}</div>
        </div>
      </div></div>
    </section>`).join("") + `
    <section class="slide" id="party-24" aria-roledescription="slide" aria-label="${total} of ${total}: Party Box 24 Count">
      <div class="slide-outer"><div class="slide-inner">
        <div class="slide-bg" style="--slide:#3A1A0E;color:#F6EAD6">
          <div class="slide-copy">
            <span class="slide-kicker" style="color:var(--pink)">Made for sharing</span>
            <h2 class="slide-title">Party Box <em>24 Count.</em></h2>
            <p class="body-l slide-desc" style="color:rgba(246,234,214,.78)">The 24-count Stuff’d Party Box from the current POS menu.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
              <a class="btn btn--light" href="${byId("party-24").veUrl}" target="_blank" rel="noopener noreferrer" data-ve-buy data-magnetic><span class="btn-label">Buy on VE Hub<span class="btn-price">$32.99</span></span></a>
              <a class="link-u" href="index.html" style="font-weight:700">Back home</a>
              <a class="link-u" href="shop.html" style="font-weight:700">See all current products</a>
            </div>
          </div>
          <div class="slide-art" style="--disc:rgba(244,166,198,.9)"><div class="disc"></div>
            <div class="trio" style="position:relative;width:min(40vw,560px);aspect-ratio:1.2">
              ${["cheese", "chocolate", "smores"].map((id, k) => `<div style="position:absolute;width:62%;left:${[0, 38, 19][k]}%;top:${[4, 10, 44][k]}%;rotate:${[-12, 10, -3][k]}deg">${biteSVG(byId(id), { cut: k !== 0 })}</div>`).join("")}
            </div>
          </div>
        </div>
      </div></div>
    </section>`;

  const sections = gsap.utils.toArray(".slide");
  const outers = gsap.utils.toArray(".slide-outer");
  const inners = gsap.utils.toArray(".slide-inner");
  const arts = sections.map(s => s.querySelector(".slide-art"));
  const titles = sections.map(s => SplitText.create(s.querySelector(".slide-title"), { type: "chars,words", charsClass: "char" }));
  const indexNav = document.getElementById("slideIndex");
  const countEl = document.getElementById("slideCount");
  indexNav.innerHTML = sections.map((s, i) => `<button aria-label="Go to slide ${i + 1}"></button>`).join("");
  const dots = indexNav.querySelectorAll("button");
  const wrap = gsap.utils.wrap(0, sections.length);
  let current = -1, animating = false;

  gsap.set(outers, { yPercent: 100 });
  gsap.set(inners, { yPercent: -100 });
  sections.forEach(s => {
    const bite = s.querySelector(".slide-art > .bite, .trio");
    gsap.to(bite, { rotation: 6, y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
  });

  function go(index, dir) {
    index = wrap(index);
    if (index === current) return;
    animating = true;
    const f = dir === -1 ? -1 : 1;
    const tl = gsap.timeline({ defaults: { duration: 1.25, ease: "power1.inOut" }, onComplete: () => { animating = false; } });
    if (current >= 0) {
      gsap.set(sections[current], { zIndex: 0 });
      tl.to(arts[current], { yPercent: -18 * f, scale: 0.85 })
        .set(sections[current], { autoAlpha: 0 });
    }
    gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
    const s = sections[index];
    tl.fromTo([outers[index], inners[index]], { yPercent: i => i ? -100 * f : 100 * f }, { yPercent: 0 }, 0)
      .fromTo(arts[index], { yPercent: 18 * f, scale: 0.85 }, { yPercent: 0, scale: 1 }, 0)
      .fromTo(s.querySelector(".disc"), { scale: 0.3 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.25)
      .fromTo(s.querySelectorAll(".slide-art .bite"), { rotation: -60 * f, scale: 0.6 }, { rotation: 0, scale: 1, duration: 1.6, ease: "elastic.out(1, 0.6)", stagger: 0.08 }, 0.3)
      .fromTo(titles[index].chars, { autoAlpha: 0, yPercent: 150 * f }, { autoAlpha: 1, yPercent: 0, duration: 1, ease: "power2", stagger: { each: 0.02, from: "random" } }, 0.2)
      .fromTo(s.querySelectorAll(".slide-kicker, .slide-desc, .slide-specs, .slide-copy > div:last-child"), { autoAlpha: 0, y: 30 * f }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0.45)
      .add(() => {
        s.querySelectorAll("[data-num]").forEach(b => {
          const o = { v: 0 }, suf = b.dataset.suf || "";
          gsap.to(o, { v: +b.dataset.num, duration: 1.2, ease: "power3.out", onUpdate: () => { b.textContent = Math.round(o.v) + suf; } });
        });
      }, 0.6);
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === index)));
    gsap.to(countEl, { duration: 0.6, scrambleText: { text: String(index + 1).padStart(2, "0") + " / " + String(sections.length).padStart(2, "0"), chars: "0123456789", speed: 0.6 } });
    document.getElementById("siteHeader").classList.toggle("on-dark", s.id === "party-24");
    if (sections[index].id) history.replaceState(null, "", "#" + sections[index].id);
    current = index;
  }

  Observer.create({
    target: window, type: "wheel,touch,pointer", wheelSpeed: -1, tolerance: 12, preventDefault: true,
    ignore: ".menu, .bag, button, a",
    onDown: () => !animating && !document.body.classList.contains("menu-open") && go(current - 1, -1),
    onUp: () => !animating && !document.body.classList.contains("menu-open") && go(current + 1, 1)
  });
  document.addEventListener("keydown", e => {
    if (animating || document.body.classList.contains("menu-open")) return;
    if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(current + 1, 1); }
    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(current - 1, -1); }
  });
  dots.forEach((d, i) => d.addEventListener("click", () => !animating && go(i, i > current ? 1 : -1)));

  const start = Math.max(0, sections.findIndex(s => "#" + s.id === location.hash));
  S.afterIntro(() => go(start, 1));
});
