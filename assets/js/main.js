/**
 * Kavin P — Portfolio interactions
 * No dependencies.
 */
(function () {
  "use strict";

  var doc = document;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = doc.getElementById("header");
  var navToggle = doc.getElementById("navToggle");
  var navMenu = doc.getElementById("navMenu");
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav__link"));
  var toTop = doc.getElementById("toTop");
  var toast = doc.getElementById("toast");
  var toastMessage = toast ? toast.querySelector(".toast__message") : null;
  var form = doc.getElementById("contactForm");
  var formNote = form ? form.querySelector(".form__note") : null;
  var year = doc.getElementById("year");

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function setYear() {
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  var toastTimer = null;

  function showToast(message, isError) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.toggle("is-error", Boolean(isError));
    toast.hidden = false;

    // Force a frame so the transition runs after `hidden` is removed.
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        toast.hidden = true;
      }, 400);
    }, 5000);
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("nav-open");
    doc.body.style.overflow = "";
  }

  function openMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    doc.body.classList.add("nav-open");
    doc.body.style.overflow = "hidden";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    doc.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("is-open")) return;
      if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
      closeMenu();
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------
     Header state + back to top
     ------------------------------------------------------------------ */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 12);
    }

    if (toTop) {
      if (y > 600) {
        toTop.hidden = false;
      } else {
        toTop.hidden = true;
      }
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(doc.querySelectorAll("[data-aos]"));

  function reveal(element) {
    var delay = Number(element.getAttribute("data-aos-delay") || 0);
    if (delay > 0 && !prefersReducedMotion) {
      element.style.transitionDelay = delay + "ms";
      window.setTimeout(function () {
        element.style.transitionDelay = "";
      }, delay + 800);
    }
    element.classList.add("is-visible");
  }

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------
     Active navigation link
     ------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(doc.querySelectorAll("main section[id]"));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute("data-section") === id;
      link.classList.toggle("is-active", match);
      if (match) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Map();
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        var bestId = null;
        var bestRatio = 0;
        visible.forEach(function (ratio, id) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId) setActiveLink(bestId);
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.15, 0.4, 0.75]
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     Animated stat counters
     ------------------------------------------------------------------ */
  function animateCounter(element) {
    var target = Number(element.getAttribute("data-count") || 0);
    var duration = 1400;
    var start = null;

    if (prefersReducedMotion) {
      element.textContent = String(target);
      return;
    }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ------------------------------------------------------------------
     Contact form
     ------------------------------------------------------------------ */
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setNote(message, isError) {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.classList.toggle("is-error", Boolean(isError));
  }

  function validateField(field) {
    var value = field.value.trim();
    var valid = value.length > 0;

    if (valid && field.type === "email") {
      valid = emailPattern.test(value);
    }

    field.classList.toggle("is-invalid", !valid);
    field.setAttribute("aria-invalid", valid ? "false" : "true");
    return valid;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll(".form__input, .form__textarea"));

    fields.forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var allValid = fields.every(validateField);

      if (!allValid) {
        setNote("Please complete every field with a valid value.", true);
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var name = doc.getElementById("name").value.trim();
      var email = doc.getElementById("email").value.trim();
      var subject = doc.getElementById("subject").value.trim();
      var message = doc.getElementById("message").value.trim();

      var body = [
        "Hi Kavin,",
        "",
        message,
        "",
        "—",
        name,
        email
      ].join("\n");

      var href =
        "mailto:kavin22cs024@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;

      setNote("Opening your email app with the message filled in…", false);
      showToast("Thanks, " + name.split(" ")[0] + ". Your email draft is ready to send.", false);
      form.reset();
      fields.forEach(function (field) {
        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
      });
    });
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  setYear();
  onScroll();
})();
