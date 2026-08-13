/* ===================================================================
   ANTHIO — Front-end interactivity
=================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* -----------------------------------------------------------------
     Flavor data (single source of truth for shop grid + box builder)
  ----------------------------------------------------------------- */
  var FLAVORS = [
    {
      id: "immune",
      name: "Immune Support",
      tagline: "Naturally rich in vitamin C & antioxidants",
      desc: "A bright, citrus-forward blend crafted to give your immune system a natural boost — perfect for busy weeks when you need extra protection.",
      ingredients: ["Camu camu", "Orange", "Ginger", "Turmeric"],
      icon: "🛡️",
      accent: "var(--green)"
    },
    {
      id: "energy",
      name: "Energy",
      tagline: "Refreshing fruit blend for a natural lift",
      desc: "A vibrant mix of tropical fruits designed to refresh and energize — a natural alternative to sugary energy drinks, without the crash.",
      ingredients: ["Pineapple", "Mango", "Guarana", "Lemon"],
      icon: "⚡",
      accent: "var(--yellow)"
    },
    {
      id: "calm",
      name: "Calm & Relax",
      tagline: "Ingredients associated with relaxation",
      desc: "A soothing blend crafted to help you unwind, ease everyday stress, and support a calmer, more restful evening routine.",
      ingredients: ["Chamomile", "Lavender", "Blueberry", "Magnesium"],
      icon: "🌙",
      accent: "var(--deep-green)"
    },
    {
      id: "detox",
      name: "Detox & Hydration",
      tagline: "Fruit & vegetable blend for hydration",
      desc: "A refreshing fusion of hydrating fruits and vegetables that supports your body's natural detox process, sip by sip.",
      ingredients: ["Cucumber", "Green apple", "Mint", "Coconut water"],
      icon: "💧",
      accent: "var(--blue)"
    },
    {
      id: "antioxidant",
      name: "Antioxidant Boost",
      tagline: "Berries & antioxidant-rich ingredients",
      desc: "A rich berry blend packed with antioxidants to help protect your cells and support your long-term wellness.",
      ingredients: ["Blueberry", "Acai", "Blackberry", "Pomegranate"],
      icon: "🫐",
      accent: "var(--berry)"
    }
  ];

  /* -----------------------------------------------------------------
     Sticky nav shadow + mobile menu
  ----------------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  });

  navToggle.addEventListener("click", function () {
    var isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* -----------------------------------------------------------------
     Logo fallback: show text wordmark if logo.png hasn't been added yet
  ----------------------------------------------------------------- */
  var navLogo = document.getElementById("navLogo");
  var navWordmark = document.getElementById("navWordmark");
  navLogo.addEventListener("error", function () {
    navLogo.style.display = "none";
    navWordmark.style.display = "inline-block";
  });

  /* -----------------------------------------------------------------
     Scroll reveal animations
  ----------------------------------------------------------------- */
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("in-view"); });
  }

  /* -----------------------------------------------------------------
     Render flavor shop cards
  ----------------------------------------------------------------- */
  var flavorGrid = document.getElementById("flavorGrid");
  FLAVORS.forEach(function (flavor) {
    var card = document.createElement("article");
    card.className = "flavor-card reveal";
    card.setAttribute("data-flavor", flavor.id);
    card.innerHTML =
      '<div class="flavor-card__icon" style="--accent:' + flavor.accent + '">' + flavor.icon + "</div>" +
      "<h3>" + flavor.name + "</h3>" +
      "<p>" + flavor.tagline + "</p>" +
      '<span class="flavor-card__link">Learn more</span>';
    card.addEventListener("click", function () { openFlavorModal(flavor.id); });
    flavorGrid.appendChild(card);
  });
  if ("IntersectionObserver" in window) {
    flavorGrid.querySelectorAll(".reveal").forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* -----------------------------------------------------------------
     Flavor modal
  ----------------------------------------------------------------- */
  var modal = document.getElementById("flavorModal");
  var modalAccent = document.getElementById("modalAccent");
  var modalTag = document.getElementById("modalTag");
  var modalTitle = document.getElementById("modalTitle");
  var modalTagline = document.getElementById("modalTagline");
  var modalDesc = document.getElementById("modalDesc");
  var modalIngredients = document.getElementById("modalIngredients");
  var modalAddBtn = document.getElementById("modalAddBtn");
  var activeModalFlavor = null;

  function openFlavorModal(flavorId) {
    var flavor = FLAVORS.filter(function (f) { return f.id === flavorId; })[0];
    if (!flavor) return;
    activeModalFlavor = flavor;

    modalAccent.style.setProperty("--accent", flavor.accent);
    modalTag.textContent = flavor.icon + " Wellness Focus";
    modalTitle.textContent = flavor.name;
    modalTagline.textContent = flavor.tagline;
    modalDesc.textContent = flavor.desc;
    modalIngredients.innerHTML = "";
    flavor.ingredients.forEach(function (ing) {
      var li = document.createElement("li");
      li.textContent = ing;
      modalIngredients.appendChild(li);
    });

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeFlavorModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.getElementById("modalClose").addEventListener("click", closeFlavorModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeFlavorModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeFlavorModal();
  });

  modalAddBtn.addEventListener("click", function () {
    if (activeModalFlavor) {
      addToBuilder(activeModalFlavor.id, 1);
    }
    closeFlavorModal();
    document.getElementById("build-box").scrollIntoView({ behavior: "smooth" });
  });

  /* -----------------------------------------------------------------
     Build Your Box
  ----------------------------------------------------------------- */
  var boxSize = 20;
  var selection = {};
  FLAVORS.forEach(function (f) { selection[f.id] = 0; });

  var sizeToggle = document.getElementById("sizeToggle");
  var builderList = document.getElementById("builderList");
  var builderFill = document.getElementById("builderFill");
  var builderCount = document.getElementById("builderCount");
  var builderMix = document.getElementById("builderMix");
  var builderCta = document.getElementById("builderCta");
  var builderHint = document.getElementById("builderHint");

  FLAVORS.forEach(function (flavor) {
    var row = document.createElement("div");
    row.className = "flavor-row";
    row.innerHTML =
      '<span class="flavor-row__dot" style="--accent:' + flavor.accent + '"></span>' +
      '<span class="flavor-row__name">' + flavor.name + "</span>" +
      '<button type="button" class="flavor-row__btn" data-action="minus" data-id="' + flavor.id + '" aria-label="Remove ' + flavor.name + '">−</button>' +
      '<span class="flavor-row__count" id="count-' + flavor.id + '">0</span>' +
      '<button type="button" class="flavor-row__btn" data-action="plus" data-id="' + flavor.id + '" aria-label="Add ' + flavor.name + '">+</button>';
    builderList.appendChild(row);
  });

  builderList.addEventListener("click", function (e) {
    var btn = e.target.closest(".flavor-row__btn");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var delta = btn.getAttribute("data-action") === "plus" ? 1 : -1;
    addToBuilder(id, delta);
  });

  function totalSelected() {
    return Object.keys(selection).reduce(function (sum, key) { return sum + selection[key]; }, 0);
  }

  function addToBuilder(id, delta) {
    var current = selection[id] || 0;
    var total = totalSelected();

    if (delta > 0 && total >= boxSize) return;
    if (delta < 0 && current <= 0) return;

    selection[id] = current + delta;
    renderBuilder();
  }

  function renderBuilder() {
    var total = totalSelected();

    FLAVORS.forEach(function (flavor) {
      var countEl = document.getElementById("count-" + flavor.id);
      countEl.textContent = selection[flavor.id];

      var minusBtn = builderList.querySelector('[data-action="minus"][data-id="' + flavor.id + '"]');
      var plusBtn = builderList.querySelector('[data-action="plus"][data-id="' + flavor.id + '"]');
      minusBtn.disabled = selection[flavor.id] <= 0;
      plusBtn.disabled = total >= boxSize;
    });

    var pct = Math.min(100, Math.round((total / boxSize) * 100));
    builderFill.style.width = pct + "%";
    builderCount.textContent = total + " / " + boxSize + " sachets selected";

    builderMix.innerHTML = "";
    FLAVORS.forEach(function (flavor) {
      if (selection[flavor.id] > 0) {
        var chip = document.createElement("span");
        chip.className = "builder__chip";
        chip.innerHTML = '<span class="builder__chip-dot" style="--accent:' + flavor.accent + '"></span>' +
          selection[flavor.id] + "× " + flavor.name;
        builderMix.appendChild(chip);
      }
    });

    if (total === 0) {
      builderHint.textContent = "Select sachets to complete your box.";
      builderCta.disabled = true;
    } else if (total < boxSize) {
      builderHint.textContent = (boxSize - total) + " more sachet(s) to complete your box.";
      builderCta.disabled = true;
    } else {
      builderHint.textContent = "Your box is complete! Ready to subscribe and save.";
      builderCta.disabled = false;
    }
  }

  sizeToggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".size-toggle__btn");
    if (!btn) return;
    boxSize = parseInt(btn.getAttribute("data-size"), 10);

    sizeToggle.querySelectorAll(".size-toggle__btn").forEach(function (b) {
      b.classList.toggle("is-active", b === btn);
    });

    var total = totalSelected();
    if (total > boxSize) {
      FLAVORS.forEach(function (f) { selection[f.id] = 0; });
    }
    renderBuilder();
  });

  builderCta.addEventListener("click", function () {
    if (builderCta.disabled) return;
    var summary = FLAVORS
      .filter(function (f) { return selection[f.id] > 0; })
      .map(function (f) { return selection[f.id] + " " + f.name; })
      .join(", ");
    builderHint.textContent = "Box saved: " + summary + ". Redirecting to subscription plans…";
    setTimeout(function () {
      document.getElementById("subscription").scrollIntoView({ behavior: "smooth" });
    }, 500);
  });

  renderBuilder();

  /* -----------------------------------------------------------------
     Subscription price toggle
  ----------------------------------------------------------------- */
  var subToggle = document.getElementById("subToggle");
  var subPrice = document.getElementById("subPrice");
  var subNote = document.getElementById("subNote");

  var SUB_PLANS = {
    monthly: {
      price: "COP $109,900",
      note: "Billed monthly with full flexibility. Switch to the 6-month plan anytime to save COP $20,000 every month."
    },
    sixmonth: {
      price: "COP $89,900",
      note: "Billed across 6 months. Regular price is COP $109,900 — you save COP $20,000 every month."
    }
  };

  subToggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".sub-toggle__btn");
    if (!btn) return;
    var plan = btn.getAttribute("data-plan");

    subToggle.querySelectorAll(".sub-toggle__btn").forEach(function (b) {
      b.classList.toggle("is-active", b === btn);
    });

    subPrice.textContent = SUB_PLANS[plan].price;
    subNote.textContent = SUB_PLANS[plan].note;
  });

  /* -----------------------------------------------------------------
     Testimonial carousel
  ----------------------------------------------------------------- */
  var track = document.getElementById("testimonialTrack");
  var slides = track.querySelectorAll(".testimonial");
  var dotsWrap = document.getElementById("testimonialDots");
  var current = 0;

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
    dot.addEventListener("click", function () { goToSlide(i); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll("button");

  function goToSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) { slide.classList.toggle("is-active", i === current); });
    dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === current); });
  }

  document.getElementById("prevTestimonial").addEventListener("click", function () { goToSlide(current - 1); });
  document.getElementById("nextTestimonial").addEventListener("click", function () { goToSlide(current + 1); });

  goToSlide(0);
  setInterval(function () { goToSlide(current + 1); }, 7000);

  /* -----------------------------------------------------------------
     FAQ accordion
  ----------------------------------------------------------------- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var question = item.querySelector(".faq__question");
    var answer = item.querySelector(".faq__answer");

    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq__item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq__question").setAttribute("aria-expanded", "false");
        other.querySelector(".faq__answer").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* -----------------------------------------------------------------
     Newsletter form (front-end prototype — no backend connected)
  ----------------------------------------------------------------- */
  var newsletterForm = document.getElementById("newsletterForm");
  var newsletterMsg = document.getElementById("newsletterMsg");

  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var emailInput = document.getElementById("newsletterEmail");
    var email = emailInput.value.trim();
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      newsletterMsg.textContent = "Please enter a valid email address.";
      return;
    }

    newsletterMsg.textContent = "You're on the list! (Front-end prototype — no email service connected yet.)";
    newsletterForm.reset();
  });

});
