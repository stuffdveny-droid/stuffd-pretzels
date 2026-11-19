/* Stuff'd. — home page choreography */
STUFFD.page(function (S) {
  const { FLAVORS, biteSVG, byId, mm } = S;
  const ROMAN = ["01", "02", "03", "04", "05", "06", "07", "08"];

  // ---------- render dynamic markup ----------
  const track = document.querySelector(".hz-track");
  track.querySelector(".hz-intro").dataset.panel = "#FCE3EC";
  FLAVORS.forEach((f, i) => track.insertAdjacentHTML("beforeend", `
    <article class="hz-panel" data-panel="${f.panel}">
      <div class="hz-art">${biteSVG(f, { cut: true })}</div>
      <div class="hz-copy">
        <h3 class="hz-name">${f.html}</h3>
        <p class="body-l">${f.desc}</p>
        <ul class="hz-notes">${f.notes.map(n => `<li>${n}</li>`).join("")}</ul>
        <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
          <a class="btn" href="${f.veUrl}" target="_blank" rel="noopener noreferrer" data-ve-buy data-magnetic><span class="btn-label">Buy on VE Hub<span class="btn-price">$${f.price.toFixed(2)}</span></span></a>
          <a class="link-u" href="flavors.html#${f.id}" style="font-weight:700">See details</a>
        </div>
      </div>
    </article>`));

  const tray = document.getElementById("boxTray");
  for (let i = 0; i < 24; i++) {
    tray.insertAdjacentHTML("beforeend", `<div class="slot${i >= 4 ? " is-off" : ""}">${biteSVG(FLAVORS[i % FLAVORS.length], { cut: i % 3 !== 1 })}</div>`);
  }

  // ======================================================
  // HERO
  // ======================================================
  const hero = document.getElementById("hero");
  const hw = hero.querySelector(".hw");
  const wordSplit = SplitText.create(hw, { type: "chars", charsClass: "char" });
  const tagSplit = SplitText.create(".hero-tag", { type: "words", wordsClass: "word" });
  const bites = gsap.utils.toArray(".hero-bite");

  gsap.set(wordSplit.chars, { autoAlpha: 0 });
  gsap.set(bites, { scale: 0, autoAlpha: 0 });
  gsap.set([".hero-tag", ".hero-cta > *"], { autoAlpha: 0 });
  gsap.set(".hero-frame", { clipPath: "inset(50% 50% 50% 50%)" });
  gsap.set([".hp-shadow", ".hp-path"], { drawSVG: "0%" });
  gsap.set(".hp-salt", { scale: 0, transformOrigin: "50% 50%" });

  S.afterIntro(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".hero-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "lux" }, 0)
      .fromTo(wordSplit.chars, { autoAlpha: 1, y: () => -innerHeight * 0.75, rotation: () => gsap.utils.random(-30, 30) },
        { y: 0, rotation: 0, duration: 1.6, ease: "pretzelBounce", stagger: 0.075 }, 0.1)
      .fromTo(wordSplit.chars, { scaleX: 1, scaleY: 1 },
        { scaleX: 1.28, scaleY: 0.74, transformOrigin: "50% 100%", duration: 1.6, ease: "pretzelBounce-squash", stagger: 0.075 }, 0.1)
      .to([".hp-shadow", ".hp-path"], { drawSVG: "100%", duration: 1.3, ease: "power2.inOut", stagger: 0.06 }, 0.9)
      .to(".hp-salt", { scale: 1, stagger: 0.07, duration: 0.6, ease: "back.out(4)" }, 1.9)
      .to(bites, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "elastic.out(1, 0.55)", stagger: { each: 0.09, from: "random" } }, 0.55)
      .set(".hero-tag", { autoAlpha: 1 }, 1.1)
      .from(tagSplit.words, { yPercent: 100, autoAlpha: 0, filter: "blur(10px)", stagger: 0.06, duration: 1.2 }, 1.1)
      .to(".hero-cta > *", { autoAlpha: 1, duration: 0.01 }, 1.45)
      .from(".hero-cta > *", { y: 34, stagger: 0.1, duration: 1.1 }, 1.45)
      .add(() => {
        // idle float on the inner svg so it never fights pointer parallax
        bites.forEach((b, i) => gsap.to(b.firstElementChild, { y: 14 + (i % 3) * 6, duration: 2.4 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      });
  });

  // pointer parallax + letter wiggle
  if (S.finePointer && !S.reduced) {
    const movers = bites.map(b => ({
      x: gsap.quickTo(b, "x", { duration: 1.4, ease: "power3" }),
      y: gsap.quickTo(b, "y", { duration: 1.4, ease: "power3" }),
      d: parseFloat(b.dataset.depth) || 1
    }));
    const wx = gsap.quickTo(".hero-center", "x", { duration: 1.6, ease: "power3" });
    const wy = gsap.quickTo(".hero-center", "y", { duration: 1.6, ease: "power3" });
    hero.addEventListener("pointermove", e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      movers.forEach(m => { m.x(nx * 70 * m.d); m.y(ny * 70 * m.d); });
      wx(nx * -14); wy(ny * -10);
    });
    wordSplit.chars.forEach(c => c.addEventListener("pointerenter", () => {
      gsap.fromTo(c, { rotation: 0 }, { rotation: 12, duration: 1, ease: "bagWiggle", overwrite: "auto" });
    }));
  }
  // flick a bite: PhysicsProps spin
  bites.forEach(b => b.addEventListener("click", () => {
    gsap.to(b.lastElementChild || b, { duration: 2.4, physicsProps: { rotation: { velocity: gsap.utils.random([-1, 1]) * gsap.utils.random(500, 1100), friction: 0.12 } } });
  }));

  // scroll-out
  gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
    .to(".hero-center", { yPercent: 28, scale: 0.88, autoAlpha: 0, ease: "none" }, 0)
    .to(bites, { yPercent: i => -70 - i * 30, rotation: i => (i % 2 ? 1 : -1) * 45, ease: "none" }, 0)
    .to(".hero-frame", { scale: 1.06, autoAlpha: 0, ease: "none" }, 0);

  // ======================================================
  // LAYERED PARALLAX — scroll depth + pointer depth
  // ======================================================
  const stage = document.getElementById("layersStage");
  const layerEls = gsap.utils.toArray(".layer", stage);
  layerEls.forEach(l => {
    const d = parseFloat(l.dataset.layer) || 1;
    gsap.fromTo(l, { yPercent: 12 * d }, { yPercent: -12 * d, ease: "none",
      scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.fromTo(".layers-word", { letterSpacing: "0.08em", opacity: 0.4 }, { letterSpacing: "-0.04em", opacity: 1, ease: "none",
    scrollTrigger: { trigger: stage, start: "top bottom", end: "center center", scrub: true } });
  gsap.utils.toArray(".layer .bite", stage).forEach((b, i) => gsap.to(b, { rotation: (i % 2 ? 1 : -1) * 30, ease: "none",
    scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 } }));
  if (S.finePointer && !S.reduced) {
    const movers = layerEls.map(l => ({ x: gsap.quickTo(l, "x", { duration: 1.2, ease: "power3" }), y: gsap.quickTo(l, "y", { duration: 1.2, ease: "power3" }), d: parseFloat(l.dataset.layer) || 1 }));
    document.getElementById("layers").addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      movers.forEach(m => { m.x(nx * 80 * m.d); m.y(ny * 50 * m.d); });
    });
    document.getElementById("layers").addEventListener("pointerleave", () => movers.forEach(m => { m.x(0); m.y(0); }));
  }

  // ======================================================
  // INSIDE — pinned split
  // ======================================================
  const insideSvg = document.querySelector(".inside-svg");
  mm.add("(max-width: 760px)", () => {
    insideSvg.setAttribute("viewBox", "190 40 520 500");
    return () => insideSvg.setAttribute("viewBox", "-170 30 1240 560");
  });
  const labels = gsap.utils.toArray(".in-label");
  gsap.set(labels, { autoAlpha: 0 });
  labels.forEach(l => gsap.set(l.querySelector("path"), { drawSVG: "0%" }));
  const strings = gsap.utils.toArray("#strings line");
  const word = document.getElementById("insideWord");

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ctx => {
    const still = ctx.conditions.still;
    const itl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "#inside", pin: true, start: "top top", end: still ? "+=10" : "+=3000", scrub: 1, anticipatePin: 1 }
    });
    itl.to(".inside-progress i", { scaleX: 1, duration: 10 }, 0)
      .to("#topHalf", { y: -115, rotation: -5, transformOrigin: "50% 100%", duration: 3, ease: "power2.inOut" }, 0.5)
      .to("#botHalf", { y: 48, rotation: 2, transformOrigin: "50% 0%", duration: 3, ease: "power2.inOut" }, 0.5)
      .to("#inShadow", { attr: { rx: 270 }, y: 50, duration: 3, ease: "power2.inOut" }, 0.5)
      .to("#filling", { morphSVG: { shape: "#fillingTarget", type: "linear" }, duration: 3.2, ease: "power2.inOut" }, 0.6)
      .to(word, { duration: 1.6, scrambleText: { text: "Molten inside.", chars: "lowerCase", speed: 0.6 } }, 1.2)
      .to("#insideCaption", { duration: 1, text: "Pulled apart at the seams" }, 1.4);
    strings.forEach((l, i) => {
      itl.to(l, { attr: { y1: 212 + (i % 2) * 6, y2: 372 - (i % 3) * 4 }, duration: 3, ease: "power2.inOut" }, 0.5)
        .to(l, { attr: { x1: "+=" + (i % 2 ? 8 : -8) }, duration: 2, ease: "sine.inOut" }, 2.2);
    });
    labels.forEach((l, i) => {
      const at = 3.6 + i * 0.8;
      itl.to(l, { autoAlpha: 1, duration: 0.2 }, at)
        .to(l.querySelector("path"), { drawSVG: "100%", duration: 0.6, ease: "power2.out" }, at)
        .from(l.querySelectorAll("text"), { x: i % 2 ? 30 : -30, duration: 0.7, ease: "power3.out", stagger: 0.1 }, at + 0.1);
    });
    itl.to("#topSalt use", { y: -10, stagger: 0.05, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 5)
      .to(word, { duration: 1.6, scrambleText: { text: "It’s what’s inside.", chars: "lowerCase", speed: 0.6 } }, 7.2)
      .to("#insideCaption", { duration: 1, text: "That’s the whole idea." }, 7.4)
      .to({}, { duration: 1.4 });
  });

  // ======================================================
  // IMAGE-IN-TEXT REVEAL (21st.dev ImgText Reveal, ported)
  // ======================================================
  const pills = gsap.utils.toArray(".imgtext-pill");
  mm.add({ desk: "(min-width: 768px)", mob: "(max-width: 767px)" }, ctx => {
    const revealW = ctx.conditions.desk ? 300 : 110;
    pills.forEach(p => gsap.fromTo(p, { width: 0 }, {
      width: () => Math.min(revealW, innerWidth * 0.24), ease: "none",
      scrollTrigger: { trigger: p.parentElement, start: "top 85%", end: "top 40%", scrub: 1, invalidateOnRefresh: true }
    }));
  });
  gsap.utils.toArray(".imgtext-line").forEach((line, i) => {
    gsap.from(line, { xPercent: i % 2 ? 8 : -8, opacity: 0.2, ease: "none", scrollTrigger: { trigger: line, start: "top 95%", end: "top 55%", scrub: 1 } });
  });
  const follower = document.querySelector(".imgtext-follower");
  document.body.appendChild(follower); // fixed elements must live outside the smoothed content
  gsap.set(follower, { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2, scale: 0.6, autoAlpha: 0 });
  const fx = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3" });
  const fy = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3" });
  window.addEventListener("pointermove", e => { fx(e.clientX); fy(e.clientY); });
  pills.forEach(p => {
    p.addEventListener("pointerenter", () => {
      const f = byId(p.dataset.follow);
      follower.innerHTML = biteSVG(f, { cut: true });
      gsap.to(follower, { backgroundColor: f.panel, autoAlpha: 1, scale: 1, rotation: gsap.utils.random(-6, 6), duration: 0.6, ease: "expo.out" });
      gsap.from(follower.firstElementChild, { rotation: -30, scale: 0.7, duration: 0.8, ease: "back.out(2)" });
    });
    p.addEventListener("pointerleave", () => gsap.to(follower, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "power2.in" }));
  });

  // ======================================================
  // HORIZONTAL FLAVORS (containerAnimation)
  // ======================================================
  const hz = document.getElementById("flavors");
  const hzPanels = gsap.utils.toArray(".hz-panel, .hz-intro", track);
  const hzNames = gsap.utils.toArray(".hz-name", track).map(el => { const split = SplitText.create(el, { type: "chars,words", mask: "words" }); S.padMasks(split); return { el, split }; });
  mm.add({ wide: "(min-width: 761px)", narrow: "(max-width: 760px)" }, ctx => {
    if (ctx.conditions.narrow) {
      // phones: stacked panels, simple reveals, no horizontal pin
      hzPanels.forEach(panel => {
        ScrollTrigger.create({ trigger: panel, start: "top 60%", end: "bottom 60%",
          onToggle: self => self.isActive && gsap.to(hz, { backgroundColor: panel.dataset.panel, duration: 0.8, overwrite: "auto" }) });
      });
      hzNames.forEach(n => gsap.from(n.split.chars, { yPercent: 110, stagger: 0.02, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: n.el, start: "top 85%", once: true } }));
      return;
    }
    const dist = () => track.scrollWidth - innerWidth;
    const hzTween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: hz, pin: true, start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => gsap.set(".hz-progress i", { scaleX: self.progress })
      }
    });
    hzPanels.forEach(panel => {
      ScrollTrigger.create({
        trigger: panel, containerAnimation: hzTween, start: "left 55%", end: "right 55%",
        onToggle: self => self.isActive && gsap.to(hz, { backgroundColor: panel.dataset.panel, duration: 0.9, ease: "power2.out", overwrite: "auto" })
      });
      if (!panel.classList.contains("hz-panel")) return;
      const art = panel.querySelector(".hz-art"), bite = art.querySelector(".bite");
      const name = hzNames[[...track.querySelectorAll(".hz-panel")].indexOf(panel)];
      gsap.fromTo(bite, { rotation: -40, x: 90 }, { rotation: 25, x: -70, ease: "none",
        scrollTrigger: { trigger: panel, containerAnimation: hzTween, start: "left right", end: "right left", scrub: true } });
      gsap.from(art, { scale: 0.55, ease: "none",
        scrollTrigger: { trigger: panel, containerAnimation: hzTween, start: "left right", end: "left 35%", scrub: true } });
      gsap.from(name.split.chars, { yPercent: 110, stagger: 0.025, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: panel, containerAnimation: hzTween, start: "left 70%", toggleActions: "play none none reverse" } });
      gsap.from(panel.querySelectorAll(".hz-notes li"), { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: "expo.out",
        scrollTrigger: { trigger: panel, containerAnimation: hzTween, start: "left 55%", toggleActions: "play none none reverse" } });
    });
  });

  // ======================================================
  // JOURNEY — DrawSVG + MotionPath, pinned
  // ======================================================
  const jp = document.getElementById("journeyPath");
  const stops = gsap.utils.toArray(".j-stop");
  const L = jp.getTotalLength();
  const stopT = stops.map(s => {
    const x = +s.dataset.x, y = +s.dataset.y; let best = 0, bd = Infinity;
    for (let i = 0; i <= 300; i++) { const p = jp.getPointAtLength(i / 300 * L); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i / 300; } }
    return best;
  });
  gsap.set(jp, { drawSVG: "0%" });
  gsap.set(stops, { autoAlpha: 0 });
  mm.add("(min-width: 761px)", () => {
  const jtl = gsap.timeline({ defaults: { ease: "none" },
    scrollTrigger: { trigger: "#journey", pin: true, start: "top top", end: "+=2400", scrub: 1, anticipatePin: 1 } });
  jtl.to(jp, { drawSVG: "100%", duration: 1 }, 0)
    .to("#rider", { duration: 1, motionPath: { path: jp, align: jp, alignOrigin: [0.5, 0.5] } }, 0)
    .to("#rider use", { rotation: 720, transformOrigin: "50% 50%", duration: 1 }, 0);
  stops.forEach((s, i) => {
    jtl.fromTo(s, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, Math.max(0, stopT[i] - 0.02))
      .fromTo(s.querySelector("circle"), { attr: { r: 0 } }, { attr: { r: 10 }, duration: 0.05, ease: "back.out(4)" }, Math.max(0, stopT[i] - 0.02));
  });
  jtl.to({}, { duration: 0.12 });
  });
  mm.add("(max-width: 760px)", () => {
    gsap.from(".journey-list li", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".journey-list", start: "top 85%", once: true } });
  });

  // ======================================================
  // TESTIMONIAL STACK — Draggable
  // ======================================================
  const stack = document.getElementById("stack");
  let cards = gsap.utils.toArray(".stack-card", stack);
  function layout(instant) {
    cards.forEach((c, i) => gsap.to(c, {
      x: 0, y: i * 16, scale: 1 - i * 0.045, rotation: i === 0 ? 0 : (i % 2 ? 2.5 : -2.5) * Math.min(i, 2),
      zIndex: cards.length - i, autoAlpha: i > 3 ? 0 : 1, duration: instant ? 0 : 0.8, ease: "expo.out", overwrite: "auto"
    }));
  }
  layout(true);
  function nextCard(card, dir) {
    gsap.to(card, { x: dir * innerWidth * 0.55, y: -80, rotation: dir * 28, autoAlpha: 0, duration: 0.55, ease: "power2.in", overwrite: "auto",
      onComplete() { cards.push(cards.shift()); gsap.set(card, { x: 0, y: cards.length * 16, rotation: 0 }); layout(); } });
  }
  Draggable.create(cards, {
    type: "x,y", zIndexBoost: false,
    onDrag() { gsap.set(this.target, { rotation: this.x / 16 }); },
    onRelease() {
      if (Math.abs(this.x) > 110) nextCard(this.target, Math.sign(this.x));
      else gsap.to(this.target, { x: 0, y: 0, rotation: 0, duration: 1, ease: "elastic.out(1, 0.45)" });
    }
  });
  document.getElementById("stackNext").addEventListener("click", () => nextCard(cards[0], 1));

  // ======================================================
  // BOX BUILDER — Flip + TextPlugin + ScrambleText
  // ======================================================
  const opts = document.querySelectorAll(".box-opt");
  const addBtn = document.getElementById("boxAdd");
  opts.forEach(o => o.addEventListener("click", () => {
    if (o.getAttribute("aria-pressed") === "true") return;
    opts.forEach(x => x.setAttribute("aria-pressed", String(x === o)));
    const size = +o.dataset.size;
    const slots = tray.querySelectorAll(".slot");
    const state = Flip.getState([tray, ...slots]);
    tray.dataset.size = size;
    slots.forEach((s, i) => s.classList.toggle("is-off", i >= size));
    Flip.from(state, {
      duration: 0.9, ease: "power3.inOut", absolute: true, nested: true, scale: true, stagger: 0.008,
      onEnter: els => gsap.fromTo(els, { scale: 0, rotation: -120, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.8, ease: "back.out(2)", stagger: 0.02, delay: 0.2 }),
      onLeave: els => gsap.to(els, { scale: 0, rotation: 90, autoAlpha: 0, duration: 0.4, stagger: 0.01 })
    });
    gsap.to("#boxPrice", { duration: 0.6, text: "$" + o.dataset.price, ease: "none" });
    gsap.to("#boxName", { duration: 0.8, scrambleText: { text: o.dataset.label, chars: "lowerCase", speed: 0.6 } });
    gsap.to("#boxLabel", { duration: 0.8, scrambleText: { text: o.dataset.label, chars: "Stuffd", speed: 0.6 } });
    addBtn.href = byId(o.dataset.id).veUrl;
  }));
});
