document.addEventListener("DOMContentLoaded", () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = new Date().getFullYear();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const clickableElements = document.querySelectorAll("a, button");
  const animatePress = (element, pressed) => {
    if (reduceMotion || !window.gsap) return;
    gsap.to(element, {
      scale: pressed ? 0.96 : 1,
      duration: pressed ? 0.12 : 0.35,
      ease: pressed ? "power2.out" : "back.out(2)",
      overwrite: true,
    });
  };
  clickableElements.forEach((element) => {
    element.addEventListener("pointerdown", () => animatePress(element, true));
    element.addEventListener("pointerup", () => animatePress(element, false));
    element.addEventListener("pointercancel", () =>
      animatePress(element, false),
    );
    element.addEventListener("pointerleave", () =>
      animatePress(element, false),
    );
    element.addEventListener("blur", () => animatePress(element, false));
  });
  const revealItems = document.querySelectorAll(".section-reveal");
  const previewObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.querySelector("video").load();
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "120px 220px" },
        )
      : null;
  const modal = document.querySelector(".video-modal");
  const modalVideo = document.querySelector(".modal-video");
  const modalTitle = document.querySelector("#modal-title");
  const modalContext = document.querySelector(".modal-context");
  const modalProgress = document.querySelector(".modal-progress span");
  const closeButton = document.querySelector(".modal-close");
  const modalInner = document.querySelector(".modal-inner");
  const workSection = document.querySelector(".work");
  const reelHint = document.querySelector(".reel-hint");
  const openModal = (card) => {
    const startPlayback = () => modalVideo.play().catch(() => {});
    modalVideo.pause();
    modalVideo.src = card.dataset.video;
    modalVideo.load();
    modalVideo.addEventListener("loadeddata", startPlayback, { once: true });
    modalProgress.style.transform = "scaleX(0)";
    modalTitle.textContent = card.dataset.title;
    modalContext.textContent = card.dataset.context;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (!reduceMotion && window.gsap) {
      const cardBounds = card.getBoundingClientRect();
      const modalBounds = modalInner.getBoundingClientRect();
      const cardCenterX = cardBounds.left + cardBounds.width / 2;
      const cardCenterY = cardBounds.top + cardBounds.height / 2;
      const modalCenterX = modalBounds.left + modalBounds.width / 2;
      const modalCenterY = modalBounds.top + modalBounds.height / 2;
      gsap.fromTo(
        modalInner,
        {
          opacity: 0.55,
          x: cardCenterX - modalCenterX,
          y: cardCenterY - modalCenterY,
          scaleX: cardBounds.width / modalBounds.width,
          scaleY: cardBounds.height / modalBounds.height,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
        },
      );
    }
    closeButton.focus();
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalProgress.style.transform = "scaleX(0)";
    document.body.classList.remove("modal-open");
  };
  modalVideo.addEventListener("timeupdate", () => {
    const progress = modalVideo.duration
      ? modalVideo.currentTime / modalVideo.duration
      : 0;
    modalProgress.style.transform = `scaleX(${progress})`;
  });
  document.querySelectorAll(".film-card").forEach((card) => {
    const preview = card.querySelector("video");
    const trigger = card.querySelector(".play-mark");
    const loadingStartedAt = performance.now();
    const revealPreview = () => {
      const remaining = Math.max(
        0,
        1800 - (performance.now() - loadingStartedAt),
      );
      window.setTimeout(() => card.classList.remove("is-loading"), remaining);
    };
    const stopLoading = () => revealPreview();
    preview.addEventListener("loadeddata", stopLoading, { once: true });
    preview.addEventListener("error", stopLoading, { once: true });
    window.setTimeout(() => card.classList.remove("is-loading"), 8000);
    if (preview.readyState >= 2) revealPreview();
    if (previewObserver) previewObserver.observe(card);
    else preview.load();
    if (reduceMotion) card.classList.add("is-in-view");
    trigger.addEventListener("pointerdown", (event) => event.stopPropagation());
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      openModal(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
    card.addEventListener("mouseenter", () => preview.play().catch(() => {}));
    card.addEventListener("mouseleave", () => preview.pause());
  });
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open"))
      closeModal();
  });
  const reel = document.querySelector("[data-drag-scroll]");
  let isDown = false;
  let startX = 0;
  let lastX = 0;
  let lastTime = 0;
  let dragVelocity = 0;
  let scrollStart = 0;
  reel.addEventListener("pointerdown", (event) => {
    isDown = true;
    startX = event.clientX;
    lastX = event.clientX;
    lastTime = performance.now();
    dragVelocity = 0;
    scrollStart = reel.scrollLeft;
    reel.setPointerCapture(event.pointerId);
  });
  reel.addEventListener("pointermove", (event) => {
    if (isDown) {
      const now = performance.now();
      const elapsed = Math.max(1, now - lastTime);
      dragVelocity = (event.clientX - lastX) / elapsed;
      reel.scrollLeft = scrollStart - (event.clientX - startX) * 1.2;
      lastX = event.clientX;
      lastTime = now;
    }
  });
  reel.addEventListener("pointerup", () => {
    isDown = false;
    if (!reduceMotion && window.gsap && Math.abs(dragVelocity) > 0.05) {
      gsap.to(reel, {
        scrollLeft: reel.scrollLeft - dragVelocity * 260,
        duration: 0.75,
        ease: "power3.out",
        overwrite: true,
      });
    }
  });
  reel.addEventListener("pointercancel", () => {
    isDown = false;
  });
  const updateScrollbar = () => {
    const progress =
      reel.scrollWidth > reel.clientWidth
        ? reel.scrollLeft / (reel.scrollWidth - reel.clientWidth)
        : 0;
    document.querySelector(".reel-scrollbar span").style.left =
      `${progress * 84}%`;
  };
  reel.addEventListener("scroll", updateScrollbar, { passive: true });
  reel.addEventListener(
    "scroll",
    () => {
      if (reel.scrollLeft > 6 && !reel.classList.contains("has-scrolled")) {
        reel.classList.add("has-scrolled");
        if (reelHint) reelHint.textContent = "Keep exploring";
      }
    },
    { passive: true },
  );
  if (workSection && !reduceMotion) {
    workSection.addEventListener("pointermove", (event) => {
      const bounds = workSection.getBoundingClientRect();
      workSection.classList.add("is-pointer-active");
      if (window.gsap)
        gsap.to(workSection.querySelector(".work-spotlight"), {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });
    });
    workSection.addEventListener("pointerleave", () =>
      workSection.classList.remove("is-pointer-active"),
    );
  }
  revealItems.forEach((item) => {
    if (reduceMotion) item.classList.add("is-visible");
    else
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      ).observe(item);
  });
  const cardRevealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-in-view");
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.16 },
        )
      : null;
  document.querySelectorAll(".film-card").forEach((card) => {
    if (cardRevealObserver) cardRevealObserver.observe(card);
    else card.classList.add("is-in-view");
  });
  if (!reduceMotion && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  if (!reduceMotion && window.gsap) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const sectionColors = [
        [".hero", "#0b0a13"],
        [".shoots", "#161320"],
        [".work", "#0b0a13"],
        [".instagram-preview", "#0b0a13"],
        [".contact", "#3e63ff"],
      ];
      sectionColors.forEach(([selector, color]) => {
        ScrollTrigger.create({
          trigger: selector,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () =>
            gsap.to(document.body, {
              backgroundColor: color,
              duration: 0.8,
              overwrite: true,
            }),
          onEnterBack: () =>
            gsap.to(document.body, {
              backgroundColor: color,
              duration: 0.8,
              overwrite: true,
            }),
        });
      });
    }
    gsap.to(".phone-wrap", {
      y: -24,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.from(".hero-copy > *", {
      y: 24,
      opacity: 0,
      filter: "blur(8px)",
      duration: 0.9,
      stagger: 0.08,
      ease: "power2.out",
    });
  }
});
