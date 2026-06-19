(function () {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector("#primary-navigation");
  const navLinks = Array.from(document.querySelectorAll(".primary-nav a[href^='#']"));
  const searchForm = document.querySelector("[data-search-form]");
  const searchStatus = document.querySelector("[data-search-status]");
  const filterChips = Array.from(document.querySelectorAll("[data-filter-chip]"));
  const cartCount = document.querySelector("[data-cart-count]");
  const cartLink = document.querySelector(".cart-link");
  const orderForm = document.querySelector("[data-order-form]");
  const orderStatus = document.querySelector("[data-order-status]");
  const hero = document.querySelector("[data-motion-hero]");
  const heroScene = hero?.querySelector(".hero-sticky");
  const heroBackgrounds = Array.from(hero?.querySelectorAll("[data-hero-bg]") || []);
  const heroCopy = hero?.querySelector("[data-hero-copy]");
  const heroEyebrow = hero?.querySelector("[data-hero-eyebrow]");
  const heroTitle = hero?.querySelector("[data-hero-title]");
  const heroBody = hero?.querySelector("[data-hero-body]");
  const heroCta = hero?.querySelector("[data-hero-cta]");
  const heroActions = hero?.querySelector(".hero-stage-actions");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const HERO_STAGE_SCROLL_VIEWPORTS = 3.8;
  const HERO_SECOND_STAGE_START = 0.22;

  const heroStages = [
    {
      state: "is-stage-one",
      eyebrow: "KW Publishers",
      title: "Knowledge with Substance for Defence, Diplomacy & Strategic Studies",
      body: "India-focused books, journals, monographs, and policy publications for scholars, practitioners, institutions, and serious readers.",
      cta: "Explore New Releases",
      href: "#new-releases",
    },
    {
      state: "is-stage-two",
      eyebrow: "Strategic Reading",
      title: "Books for the people shaping policy, security, and international affairs.",
      body: "Browse titles across defence studies, military strategy, China, South Asia, maritime security, air power, nuclear policy, and diplomacy.",
      cta: "Search the Catalogue",
      href: "#catalogue-search",
    },
    {
      state: "is-stage-three",
      eyebrow: "Institutional Knowledge",
      title: "Built for defence institutions, think tanks, universities, and libraries.",
      body: "Discover research-led publications, journals, monographs, and catalogues designed for professional and academic reading.",
      cta: "Request Institutional Order",
      href: "#orders",
    },
    {
      state: "is-stage-four",
      eyebrow: "New & Notable",
      title: "Current titles on China, Indo-Pacific strategy, drones, cyber power, diplomacy, and maritime security.",
      body: "Explore recent and high-signal publications from KW's strategic studies catalogue.",
      cta: "View Strategic Reading",
      href: "#new-releases",
    },
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const preloadHeroBackgrounds = () => {
    heroBackgrounds.forEach((background) => {
      const src = background.getAttribute("src");

      if (!src) {
        return;
      }

      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  };

  const setHeroBackground = (() => {
    let activeBackground = 0;

    return (index, instant = false) => {
      if (!heroBackgrounds.length) {
        return;
      }

      const nextBackground = Math.round(clamp(index, 0, heroBackgrounds.length - 1));

      if (nextBackground === activeBackground && !instant) {
        return;
      }

      activeBackground = nextBackground;

      heroBackgrounds.forEach((background, backgroundIndex) => {
        const isActive = backgroundIndex === nextBackground;
        background.classList.toggle("is-active", isActive);
      });
    };
  })();

  const setHeaderScrolled = (isScrolled) => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", Boolean(isScrolled));
  };

  const closeMenu = () => {
    if (!header || !navToggle) {
      return;
    }

    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (header && navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      setHeaderScrolled(isOpen || window.scrollY > 12);
    });

    navPanel.addEventListener("click", (event) => {
      const target = event.target;

      if (target instanceof HTMLAnchorElement && target.hash) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  if (navLinks.length && "IntersectionObserver" in window) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveLink(visible.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -60% 0px",
        threshold: [0.08, 0.22, 0.45],
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const isSelected = chip.classList.toggle("is-selected");
      chip.setAttribute("aria-pressed", String(isSelected));
    });
  });

  if (searchForm && searchStatus) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = searchForm.querySelector("input[type='search']");
      const query = input instanceof HTMLInputElement ? input.value.trim() : "";
      const selectedSubjects = filterChips
        .filter((chip) => chip.classList.contains("is-selected"))
        .map((chip) => chip.textContent.trim())
        .filter(Boolean);

      if (!query && !selectedSubjects.length) {
        searchStatus.textContent = "Enter a title, author, ISBN, subject, or region to search the catalogue.";
        input?.focus();
        return;
      }

      const terms = [query, ...selectedSubjects].filter(Boolean).join(", ");
      searchStatus.textContent = `Catalogue search prepared for: ${terms}.`;
    });
  }

  if (cartCount && cartLink) {
    cartLink.setAttribute("aria-label", "Cart, 0 items");
  }

  const setHeroStage = (() => {
    let activeStage = 0;
    let stageTween;
    let heroTransitionCopy;

    const getCopyMotionTargets = () =>
      [heroEyebrow, heroTitle, heroBody, heroActions].filter(Boolean);

    const getTransitionCopy = () => {
      if (!heroCopy) {
        return null;
      }

      if (heroTransitionCopy) {
        return heroTransitionCopy;
      }

      heroTransitionCopy = document.createElement("div");
      heroTransitionCopy.className = "hero-stage-transition-copy";
      heroTransitionCopy.setAttribute("aria-hidden", "true");
      heroTransitionCopy.innerHTML = [
        '<div class="hero-eyebrow"><span></span><p class="section-label"></p></div>',
        '<h2 class="hero-stage-title"></h2>',
        '<p class="hero-stage-body"></p>',
        '<div class="hero-stage-actions">',
        '<a class="button button-primary" href="#new-releases" tabindex="-1">Explore New Releases</a>',
        '<a class="button button-secondary" href="#catalogue" tabindex="-1">Download Catalogue</a>',
        "</div>",
      ].join("");
      heroCopy.append(heroTransitionCopy);

      return heroTransitionCopy;
    };

    const getTransitionMotionTargets = (transitionCopy) =>
      [
        transitionCopy?.querySelector(".hero-eyebrow"),
        transitionCopy?.querySelector(".hero-stage-title"),
        transitionCopy?.querySelector(".hero-stage-body"),
        transitionCopy?.querySelector(".hero-stage-actions"),
      ].filter(Boolean);

    const clearCopyMotion = () => {
      if (gsap) {
        gsap.set(getCopyMotionTargets(), {
          clearProps: "opacity,visibility,transform,filter",
        });

        if (heroTransitionCopy) {
          gsap.set(heroTransitionCopy, { autoAlpha: 0 });
          gsap.set(getTransitionMotionTargets(heroTransitionCopy), {
            clearProps: "opacity,visibility,transform,filter",
          });
        }
      }
    };

    const applyStageState = (index) => {
      const stage = heroStages[index];

      if (!stage || !hero) {
        return;
      }

      heroStages.forEach(({ state }) => hero.classList.remove(state));
      hero.classList.add(stage.state);
      setHeroBackground(index);
    };

    const applyStageContent = (index) => {
      const stage = heroStages[index];

      if (!stage || !heroEyebrow || !heroTitle || !heroBody || !heroCta) {
        return;
      }

      heroEyebrow.textContent = stage.eyebrow;
      heroTitle.textContent = stage.title;
      heroBody.textContent = stage.body;
      heroCta.textContent = stage.cta;
      heroCta.setAttribute("href", stage.href);
    };

    const populateTransitionCopy = (transitionCopy, index) => {
      const stage = heroStages[index];

      if (!stage || !transitionCopy) {
        return;
      }

      const eyebrow = transitionCopy.querySelector(".hero-eyebrow .section-label");
      const title = transitionCopy.querySelector(".hero-stage-title");
      const body = transitionCopy.querySelector(".hero-stage-body");
      const cta = transitionCopy.querySelector(".button-primary");

      if (eyebrow) {
        eyebrow.textContent = stage.eyebrow;
      }

      if (title) {
        title.textContent = stage.title;
      }

      if (body) {
        body.textContent = stage.body;
      }

      if (cta) {
        cta.textContent = stage.cta;
        cta.setAttribute("href", stage.href);
      }
    };

    const applyStage = (index) => {
      applyStageState(index);
      applyStageContent(index);
    };

    applyStage(0);

    return (index, instant = false) => {
      const nextStage = Math.round(clamp(index, 0, heroStages.length - 1));

      if (nextStage === activeStage && !instant) {
        return;
      }

      activeStage = nextStage;

      if (stageTween) {
        stageTween.kill();
        stageTween = null;
      }

      if (!heroCopy || instant || reduceMotion.matches || !gsap) {
        applyStage(nextStage);
        clearCopyMotion();
        return;
      }

      const copyTargets = getCopyMotionTargets();
      const transitionCopy = getTransitionCopy();
      const incomingTargets = getTransitionMotionTargets(transitionCopy);

      if (!copyTargets.length || !transitionCopy || !incomingTargets.length) {
        applyStage(nextStage);
        return;
      }

      populateTransitionCopy(transitionCopy, nextStage);
      applyStageState(nextStage);
      gsap.set(transitionCopy, { autoAlpha: 1 });
      gsap.set(incomingTargets, {
        autoAlpha: 0,
        y: 14,
        filter: "blur(5px)",
      });

      stageTween = gsap
        .timeline({
          defaults: { overwrite: true },
          onComplete: () => {
            applyStageContent(nextStage);
            gsap.set(copyTargets, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              clearProps: "opacity,visibility,transform,filter",
            });
            gsap.set(transitionCopy, { autoAlpha: 0 });
            stageTween = null;
          },
          onInterrupt: () => gsap.set(transitionCopy, { autoAlpha: 0 }),
        })
        .to(copyTargets, {
          autoAlpha: 0,
          y: -10,
          filter: "blur(4px)",
          duration: 0.34,
          stagger: 0.032,
          ease: "power2.inOut",
        }, 0)
        .to(incomingTargets, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.68,
          stagger: 0.038,
          ease: "power3.out",
        }, 0.34);
    };
  })();

  const getStageFromProgress = (progress) => {
    if (progress >= 0.75) {
      return 3;
    }

    if (progress >= 0.5) {
      return 2;
    }

    if (progress >= HERO_SECOND_STAGE_START) {
      return 1;
    }

    return 0;
  };

  const initNativeHeroStageProgress = () => {
    let ticking = false;

    const updateHeroProgress = () => {
      if (!hero) {
        return;
      }

      const scrollRange = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-hero.getBoundingClientRect().top / scrollRange);
      setHeroStage(getStageFromProgress(progress), reduceMotion.matches);
    };

    const requestHeroProgressUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        updateHeroProgress();
      });
    };

    updateHeroProgress();
    window.addEventListener("scroll", requestHeroProgressUpdate, { passive: true });
    window.addEventListener("resize", requestHeroProgressUpdate);
    window.addEventListener("pageshow", requestHeroProgressUpdate);
    window.setTimeout(requestHeroProgressUpdate, 0);
    window.setTimeout(requestHeroProgressUpdate, 250);
  };

  const initHeroMotion = async () => {
    if (!hero || !heroScene) {
      return;
    }

    document.documentElement.classList.add("motion-ready");
    preloadHeroBackgrounds();
    setHeroBackground(0, true);
    setHeroStage(0, true);

    if (!gsap || !ScrollTrigger || reduceMotion.matches) {
      initNativeHeroStageProgress();
      return;
    }

    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: () =>
        `+=${Math.max(
          window.innerHeight * HERO_STAGE_SCROLL_VIEWPORTS,
          hero.offsetHeight - window.innerHeight
        )}`,
      pin: heroScene,
      pinSpacing: false,
      scrub: 0.75,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = clamp(self.progress);
        setHeroStage(getStageFromProgress(progress));
      },
    });

    ScrollTrigger.create({
      trigger: document.body,
      start: "top -12",
      end: "bottom bottom",
      onUpdate: (self) => setHeaderScrolled(self.scroll() > 12),
      onRefresh: (self) => setHeaderScrolled(self.scroll() > 12),
    });
  };

  const initRevealMotion = () => {
    const revealGroups = [
      ".search-panel",
      ".section-intro",
      ".book-grid",
      ".subject-grid",
      ".author-grid",
      ".publication-grid",
      ".catalogue-grid",
      ".orders-copy",
      ".order-form",
      ".site-footer",
    ];

    const revealItems = [];

    revealGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (element.matches(".journals-intro")) {
          return;
        }

        if (
          element.matches(".book-grid, .subject-grid, .author-grid, .publication-grid")
        ) {
          Array.from(element.children).forEach((child, index) => {
            child.classList.add("reveal-on-scroll");
            child.style.setProperty("--reveal-index", String(index));
            revealItems.push(child);
          });
          return;
        }

        element.classList.add("reveal-on-scroll");
        element.style.setProperty("--reveal-index", "0");
        revealItems.push(element);
      });
    });

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18,
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  };

  const initGsapEnhancements = () => {
    if (!gsap || !ScrollTrigger || reduceMotion.matches) {
      return;
    }

    gsap.utils.toArray(".book-cover").forEach((element) => {
      gsap.fromTo(
        element,
        { scale: 0.92, opacity: 0.68 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top 92%",
            end: "center 58%",
            scrub: 1,
          },
        }
      );

      gsap.to(element, {
        opacity: 0.34,
        filter: "brightness(0.76)",
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "bottom 24%",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    gsap.to(".catalogue-download", {
      "--parallax-y": "48px",
      ease: "none",
      scrollTrigger: {
        trigger: ".catalogue-download",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  };

  const initHoverPhysics = () => {
    if (!gsap || reduceMotion.matches || !finePointer.matches) {
      return;
    }

    const cards = gsap.utils.toArray(".book-card, .subject-card, .author-card");

    cards.forEach((card) => {
      const rotateX = gsap.quickTo(card, "rotationX", {
        duration: 0.42,
        ease: "power3.out",
      });
      const rotateY = gsap.quickTo(card, "rotationY", {
        duration: 0.42,
        ease: "power3.out",
      });
      const scale = gsap.quickTo(card, "scale", {
        duration: 0.42,
        ease: "power3.out",
      });

      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        rotateX(y * -4);
        rotateY(x * 4);
        scale(1.012);
      });

      card.addEventListener("pointerleave", () => {
        rotateX(0);
        rotateY(0);
        scale(1);
      });
    });
  };

  initHeroMotion();
  initRevealMotion();
  initGsapEnhancements();
  initHoverPhysics();

  if (orderForm && orderStatus) {
    orderForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = orderForm.querySelector("#order-name");
      const email = orderForm.querySelector("#order-email");
      const interest = orderForm.querySelector("#order-interest");
      const requiredFields = [name, email].filter(Boolean);

      requiredFields.forEach((field) => field.removeAttribute("aria-invalid"));

      if (!(name instanceof HTMLInputElement) || !name.value.trim()) {
        orderStatus.textContent = "Enter your name so the enquiry can be addressed correctly.";
        name?.setAttribute("aria-invalid", "true");
        name?.focus();
        return;
      }

      if (!(email instanceof HTMLInputElement) || !email.value.trim() || !email.checkValidity()) {
        orderStatus.textContent = "Enter a valid email address for the order response.";
        email?.setAttribute("aria-invalid", "true");
        email?.focus();
        return;
      }

      const selectedInterest = interest instanceof HTMLSelectElement ? interest.value : "institutional order";
      orderStatus.textContent = `Thank you, ${name.value.trim()}. KW Publishers will respond with details for ${selectedInterest}.`;
      orderForm.reset();
    });
  }
})();
