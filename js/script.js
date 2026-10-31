/* =========================================================
   FORM SETUP
   The contact form is handled by Netlify Forms. Netlify detects
   the form (data-netlify="true" in index.html) when the site is
   deployed. E-mail notifications are set in the Netlify dashboard:
   Project configuration → Notifications → Emails and webhooks →
   Form submission notifications.
   On a local server (localhost) nothing is sent – demo mode.
   ========================================================= */
const IS_LOCAL = ["localhost", "127.0.0.1", ""].includes(location.hostname);

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const closeMenu = () => {
    nav.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    // place the dropdown right under the header, wherever it currently sits
    nav.style.setProperty("--nav-top", header.getBoundingClientRect().bottom + "px");
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => { if (window.innerWidth > 960) closeMenu(); });

  /* ---------- Header shadow, back-to-top, active nav link ---------- */
  const sections = [...document.querySelectorAll("main section[id]")];
  // only in-page links (#…) are highlighted on scroll; links to other pages keep their own "active" class
  const navLinks = [...document.querySelectorAll(".nav__link")].filter((l) => l.getAttribute("href").startsWith("#"));

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 500);

    let current = "";
    sections.forEach((s) => { if (y >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll + counters ---------- */
  const formatNum = (n) => n.toLocaleString("en-US");

  const animateCounter = (el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        const num = entry.target.querySelector(".stat__num");
        if (num) animateCounter(num);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    document.querySelectorAll(".stat__num").forEach(animateCounter);
  }

  /* ---------- Cookie banner ---------- */
  const cookie = document.getElementById("cookie");
  const getConsent = () => { try { return localStorage.getItem("cookieConsent"); } catch { return null; } };
  const setConsent = (v) => { try { localStorage.setItem("cookieConsent", v); } catch { /* storage blocked */ } };

  if (!getConsent()) cookie.hidden = false;
  cookie.querySelectorAll("[data-cookie]").forEach((btn) =>
    btn.addEventListener("click", () => { setConsent(btn.dataset.cookie); cookie.hidden = true; })
  );
  document.getElementById("cookieSettings").addEventListener("click", (e) => {
    e.preventDefault();
    cookie.hidden = false;
  });

  /* ---------- Modals (Terms / Privacy) ---------- */
  document.querySelectorAll("[data-modal]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("modal-" + link.dataset.modal).hidden = false;
    });
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal__close")) modal.hidden = true;
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const message = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  if (!form) return; // page without the contact form (e.g. a product page)

  // pre-select the product when coming from a product page (?product=…)
  const wanted = new URLSearchParams(location.search).get("product");
  const productSelect = document.getElementById("product");
  if (wanted && [...productSelect.options].some((o) => o.value === wanted)) productSelect.value = wanted;

  message.addEventListener("input", () => { charCount.textContent = message.value.length; });

  const rules = {
    country: (v) => v.trim().length >= 2 || "Please enter your country.",
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address.",
    phone: (v) => v.trim() === "" || /^[+0-9 ()/-]{6,20}$/.test(v.trim()) || "Please enter a valid phone number.",
    product: (v) => v !== "" || "Please select a product.",
    privacy: (_, el) => el.checked || "Please agree to the privacy policy.",
  };

  const validateField = (id) => {
    const el = document.getElementById(id);
    const field = el.closest(".field");
    const result = rules[id](el.value, el);
    const ok = result === true;
    field.classList.toggle("invalid", !ok);
    field.querySelector(".error").textContent = ok ? "" : result;
    return ok;
  };

  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    const isChoice = el.type === "checkbox" || el.tagName === "SELECT";
    el.addEventListener(isChoice ? "change" : "blur", () => validateField(id));
    el.addEventListener("input", () => {
      if (el.closest(".field").classList.contains("invalid")) validateField(id);
    });
  });

  const showStatus = (type, text) => {
    status.className = "form__status field--full " + type;
    status.textContent = text;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status field--full";

    const allValid = Object.keys(rules).map(validateField).every(Boolean);
    if (!allValid) {
      form.querySelector(".field.invalid input, .field.invalid select")?.focus();
      showStatus("fail", "Please check the highlighted fields.");
      return;
    }

    // honeypot filled → silently pretend success for bots
    if (form["bot-field"].value) { form.reset(); return; }

    const body = new URLSearchParams(new FormData(form)).toString();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending …";

    try {
      if (!IS_LOCAL) {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) throw new Error("Send failed: " + res.status);
      } else {
        // demo mode: Netlify Forms only works on the deployed site
        console.info("Demo mode – form data that would be sent:", Object.fromEntries(new FormData(form)));
        await new Promise((r) => setTimeout(r, 800));
      }

      form.reset();
      charCount.textContent = "0";
      showStatus("success", "Thank you! Your request has been sent. We will get back to you as soon as possible.");
    } catch (err) {
      console.error(err);
      showStatus("fail", "Sorry, something went wrong. Please try again later or email us at info@cellfiberllc.com.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send request";
    }
  });
});
