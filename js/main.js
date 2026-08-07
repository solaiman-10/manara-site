/* ============================================
   Madark للتدريب والتعليم — التفاعلات العامة
   ============================================ */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- الوضع الليلي ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("madark-theme", theme); } catch (e) {}
  }

  if (themeBtn) {
    const saved = (() => { try { return localStorage.getItem("madark-theme") || localStorage.getItem("noon-theme"); } catch (e) { return null; } })();
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- شريط التنقل ---------- */
  const header = $(".header");
  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open);
    });
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- الكشف عند الظهور ---------- */
  const revealEls = $$(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("visible"));
  }

  /* ---------- العدادات المتحركة ---------- */
  const counters = $$("[data-count]");
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    const duration = 1800;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (target * eased).toFixed(decimals);
      el.textContent = decimals ? val : Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  if ("IntersectionObserver" in window) {
    counters.forEach(c => counterObserver.observe(c));
  } else {
    counters.forEach(c => { c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || ""); });
  }

  /* ---------- أشرطة التقدم ---------- */
  const progressBars = $$(".progress > span[data-progress]");
  const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.getAttribute("data-progress") + "%";
        progressObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  if ("IntersectionObserver" in window) {
    progressBars.forEach(p => progressObserver.observe(p));
  } else {
    progressBars.forEach(p => p.style.width = p.getAttribute("data-progress") + "%");
  }

  /* ---------- سلايدر آراء الطلاب ---------- */
  function initSlider() {
    const slides = $(".t-slides");
    const dotsWrap = $(".t-dots");
    if (!slides || !dotsWrap) return;
    const items = $$(".t-slide", slides);
    let index = 0;
    const count = items.length;

    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "t-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "انتقال للشهادة " + (i + 1));
      dot.addEventListener("click", () => go(i));
      dotsWrap.appendChild(dot);
    });
    const dots = $$(".t-dot", dotsWrap);

    function go(i) {
      index = (i + count) % count;
      slides.style.transform = `translateX(${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
    }

    let timer = setInterval(() => go(index + 1), 6000);
    const sliderWrap = $(".t-slider");
    if (sliderWrap) {
      sliderWrap.addEventListener("mouseenter", () => clearInterval(timer));
      sliderWrap.addEventListener("mouseleave", () => { timer = setInterval(() => go(index + 1), 6000); });
    }
    $(".t-next")?.addEventListener("click", () => go(index + 1));
    $(".t-prev")?.addEventListener("click", () => go(index - 1));
  }
  initSlider();

  /* ---------- الأكورديون الأسئلة الشائعة ---------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach(item => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      faqItems.forEach(i => {
        i.classList.remove("open");
        $(".faq-a", i).style.maxHeight = "0px";
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- فلاتر الكورسات ---------- */
  const filterBar = $(".filter-bar");
  if (filterBar) {
    const chips = $$(".filter-chip", filterBar);
    const cards = $$("[data-category]");
    const searchInput = $(".filter-search input");

    function applyFilters() {
      const activeCat = $(".filter-chip.active", filterBar)?.getAttribute("data-filter") || "all";
      const term = (searchInput?.value || "").trim().toLowerCase();
      cards.forEach(card => {
        const cat = card.getAttribute("data-category") || "";
        const title = card.getAttribute("data-title") || "";
        const matchCat = activeCat === "all" || cat === activeCat;
        const matchTerm = !term || title.includes(term);
        card.style.display = matchCat && matchTerm ? "" : "none";
      });
    }

    chips.forEach(chip => chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilters();
    }));
    searchInput?.addEventListener("input", applyFilters);
  }

  /* ---------- المنهج الدراسي ---------- */
  $$(".cur-item").forEach(item => {
    const head = $(".cur-head", item);
    const body = $(".cur-body", item);
    head?.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".cur-item").forEach(i => {
        i.classList.remove("open");
        $(".cur-body", i).style.maxHeight = "0px";
      });
      if (!open) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ---------- تبويبات المصادقة ---------- */
  const authTabs = $$(".auth-tab").filter(t => ["login", "signup"].includes(t.getAttribute("data-tab")));
  const authForms = $$("[data-auth-form]");
  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      authForms.forEach(f => f.style.display = f.getAttribute("data-auth-form") === tab.getAttribute("data-tab") ? "" : "none");
    });
  });

  /* ---------- إظهار/إخفاء كلمة المرور ---------- */
  $$(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $("#" + btn.getAttribute("data-target"));
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  });

  /* ---------- النماذج ---------- */
  const forms = $$("form[data-validate]");
  forms.forEach(form => {
    form.addEventListener("submit", e => {
      const kind = form.getAttribute("data-auth-form");
      const email = $("input[type=email]", form);
      const pass = $("input[type=password], input[name=password]", form);
      const emailVal = email?.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        e.preventDefault();
        email.focus();
        toast("يرجى إدخال بريد إلكتروني صحيح", "error");
        return;
      }
      if (pass && pass.value.length < 6) {
        e.preventDefault();
        pass.focus();
        toast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
        return;
      }

      /* الدخول إلى المنصة بعد تسجيل الدخول أو إنشاء حساب */
      if (kind === "login" || kind === "signup") {
        e.preventDefault();
        const nameInput = $("input[type=text], #name", form);
        const user = {
          name: (nameInput && nameInput.value.trim()) || emailVal.split("@")[0],
          email: emailVal,
          at: Date.now()
        };
        try {
          if (kind === "signup") {
            const accounts = JSON.parse(localStorage.getItem("madark-accounts") || "[]");
            accounts.push(user);
            localStorage.setItem("madark-accounts", JSON.stringify(accounts));
          }
          localStorage.setItem("madark-user", JSON.stringify(user));
        } catch (err) {}
        const brand = (window.MadarkConfig && window.MadarkConfig.brand && window.MadarkConfig.brand.name) || "Madark";
        toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
        return;
      }

      toast("تم إرسال البيانات بنجاح 🎉", "success");
    });
  });

  /* ---------- إظهار بيانات المستخدم المسجل في لوحة التحكم ---------- */
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("madark-user")); } catch (e) { return null; } })();
  if (currentUser && currentUser.name) {
    const dpName = $(".dp-name");
    const dashGreet = $(".dash-head h1");
    if (dpName) dpName.textContent = currentUser.name;
    if (dashGreet) dashGreet.textContent = "أهلاً، " + currentUser.name.split(/\s+/)[0] + " 👋";
  }

  /* ---------- تسجيل الخروج ---------- */
  const logoutBtn = $("[data-logout]");
  logoutBtn?.addEventListener("click", () => {
    try { localStorage.removeItem("madark-user"); } catch (e) {}
  });

  /* ---------- النشرة البريدية ---------- */
  const nlForm = $(".newsletter");
  nlForm?.addEventListener("submit", e => {
    e.preventDefault();
    const input = $("input", nlForm);
    if (input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      toast("تم اشتراكك في النشرة البريدية بنجاح 🎉", "success");
      input.value = "";
    }
  });

  /* ---------- التنبيهات ---------- */
  let toastTimer;
  function toast(message, type = "info") {
    let box = $("#toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-box";
      Object.assign(box.style, {
        position: "fixed", bottom: "24px", right: "24px", zIndex: "9999",
        display: "flex", flexDirection: "column", gap: "10px"
      });
      document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.style.cssText = `
      background: ${type === "error" ? "#ef4444" : "#10b981"};
      color: #fff; padding: 14px 22px; border-radius: 12px;
      font-weight: 700; font-size: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.2);
      animation: slideUp .35s ease; direction: rtl;
    `;
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => {
      el.style.animation = "slideDown .3s ease";
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }
  window.toast = toast; /* كشف دالة التنبيه للاستخدام من أي ملف آخر */
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
    @keyframes slideDown { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(20px); } }
  `;
  document.head.appendChild(styleTag);

  /* ---------- الرسم الدائري في لوحة التحكم ---------- */
  function initDonut() {
    const canvas = $("#donut");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width = canvas.height = 180 * dpr;
    canvas.style.width = canvas.style.height = "180px";
    ctx.scale(dpr, dpr);

    const segments = [
      { value: 46, color: "#8b5cf6" },
      { value: 28, color: "#06b6d4" },
      { value: 18, color: "#f59e0b" },
      { value: 8, color: "#e2e8f0" }
    ];
    const total = segments.reduce((s, x) => s + x.value, 0);
    let angle = -Math.PI / 2;
    const css = getComputedStyle(document.documentElement);

    const animate = (now, start) => {
      const p = Math.min((now - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      ctx.clearRect(0, 0, 180, 180);
      let current = angle;
      segments.forEach(seg => {
        const sweep = (seg.value / total) * Math.PI * 2 * eased;
        ctx.beginPath();
        ctx.moveTo(90, 90);
        ctx.arc(90, 90, 74, current, current + sweep);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        current += (seg.value / total) * Math.PI * 2;
      });
      ctx.beginPath();
      ctx.arc(90, 90, 52, 0, Math.PI * 2);
      ctx.fillStyle = css.getPropertyValue("--card").trim() || "#fff";
      ctx.fill();
      ctx.fillStyle = css.getPropertyValue("--text").trim() || "#0f172a";
      ctx.font = "800 30px Cairo";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("82%", 90, 88);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 13px Tajawal";
      ctx.fillText("إتمام الكورسات", 90, 114);
      if (p < 1) requestAnimationFrame(t => animate(t, start));
    };
    requestAnimationFrame(t => animate(t, t));
  }
  initDonut();

  /* ---------- تحديث السنة في الفوتر ---------- */
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();
