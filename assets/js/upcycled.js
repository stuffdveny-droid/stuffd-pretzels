/* Stuff'd. — Brand idea page */
STUFFD.page(function (S) {
  // ---------- pinned morph: crumbs → bite → heart ----------
  const title = document.getElementById("morphTitle");
  const copy = document.getElementById("morphCopy");
  const mtl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#morph", pin: true, start: "top top", end: "+=2200", scrub: 1, anticipatePin: 1 }
  });
  mtl.to("#morphBar", { scaleX: 1, duration: 6 }, 0)
    .to("#mCrumbs circle", { attr: { cy: 150 }, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "power2.in" }, 0.6)
    .to("#mShape", { morphSVG: { shape: "#mBite", type: "rotational" }, duration: 1.6, ease: "power2.inOut" }, 0.8)
    .to(title, { duration: 0.8, scrambleText: { text: "Flavor.", chars: "lowerCase", speed: 0.6 } }, 1)
    .to(copy, { duration: 0.8, text: "Choose a sweet, savory or seasonal favorite from the Stuff’d menu." }, 1.1)
    .to("#mSalt", { opacity: 1, duration: 0.4 }, 2.2)
    .from("#mSalt use", { y: -40, stagger: 0.08, duration: 0.6, ease: "bounce.out" }, 2.2)
    .to("#mSalt", { opacity: 0, duration: 0.4 }, 3.5)
    .to("#mShape", { morphSVG: { shape: "#mHeart", type: "rotational" }, duration: 1.6, ease: "power2.inOut" }, 3.6)
    .to(".morph-art", { backgroundColor: "#E7799F", duration: 1.4 }, 3.6)
    .to(title, { duration: 0.8, scrambleText: { text: "Shared.", chars: "lowerCase", speed: 0.6 } }, 3.8)
    .to(copy, { duration: 0.8, text: "A soft pretzel with something good tucked inside." }, 3.9)
    .to("#mShape", { scale: 1.08, transformOrigin: "50% 50%", duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, 5.2);

  // ---------- squiggle: DrawSVG + MotionPath rider ----------
  S.mm.add("(min-width: 761px)", () => {
    gsap.set("#sqPath", { drawSVG: "0%" });
    gsap.timeline({ defaults: { ease: "none" },
      scrollTrigger: { trigger: ".squiggle-svg", start: "top 60%", end: "bottom 60%", scrub: 1 } })
      .to("#sqPath", { drawSVG: "100%", duration: 1 }, 0)
      .to("#sqRider", { duration: 1, motionPath: { path: "#sqPath", align: "#sqPath", alignOrigin: [0.5, 0.5], autoRotate: true } }, 0);
  });

  // ---------- comparison bars ----------
  gsap.utils.toArray(".compare-bar i").forEach(bar => {
    gsap.to(bar, { scaleX: parseFloat(bar.dataset.w), duration: 1.8, ease: "expo.out",
      scrollTrigger: { trigger: bar, start: "top 88%", once: true } });
  });
});
