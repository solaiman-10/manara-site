/* ============================================
   مدارك للتدريب والتعليم — التفاعلات العامة
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

  /* ---------- اختيار الدور (طالب / معلّم) ---------- */
  const roleTabs = $$("[data-role-tab]");
  const certGroup = $("#cert-group");
  const certInput = $("#reg-cert");
  function syncCertGroup() {
    const roleInput = $("#reg-role");
    const isTeacher = (roleInput && roleInput.value) === "teacher";
    if (certGroup) certGroup.style.display = isTeacher ? "" : "none";
    if (certInput) certInput.required = isTeacher;
  }
  roleTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      roleTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const roleInput = $("#reg-role");
      if (roleInput) roleInput.value = tab.getAttribute("data-role-tab");
      syncCertGroup();
      if (tab.getAttribute("data-role-tab") === "teacher") {
        toast("سيتم إنشاء حسابك كمعلّم — ارفق شهادة التخصص للمراجعة", "info");
      }
    });
  });
  syncCertGroup();

  /* ---------- تبويب طريقة التسجيل (بريد / جوال) ---------- */
  function looksLikeSaudiPhone(v) {
    let d = String(v || "").replace(/\D/g, "");
    if (d.startsWith("00")) d = d.slice(2);
    if (d.length === 10 && d.startsWith("05")) return true;
    if (d.length === 9 && d.startsWith("5")) return true;
    if (d.length === 12 && d.startsWith("9665")) return true;
    return false;
  }

  const methodTabs = $$("[data-method-tab]");
  const methodInput = $("#reg-method");
  methodTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      methodTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const m = tab.getAttribute("data-method-tab");
      if (methodInput) methodInput.value = m;
      const emailField = $("#email-field");
      const phoneField = $("#phone-field");
      const otpField = $("#otp-field");
      if (m === "phone") {
        if (emailField) emailField.style.display = "none";
        if (phoneField) phoneField.style.display = "";
        if (otpField) otpField.style.display = "";
      } else {
        if (emailField) emailField.style.display = "";
        if (phoneField) phoneField.style.display = "none";
        if (otpField) otpField.style.display = "none";
      }
    });
  });

  /* ---------- إرسال رمز التحقق للجوال ---------- */
  const sendOtpBtn = $("#send-otp-btn");
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", () => {
      const phone = $("#reg-phone");
      const hint = $("#otp-hint");
      if (!phone) return;
      const p = phone.value.trim();
      if (!looksLikeSaudiPhone(p)) {
        if (hint) { hint.className = "otp-hint err"; hint.textContent = "أدخل رقم جوال سعودي صحيح (مثال: 05xxxxxxxx)"; }
        return;
      }
      sendOtpBtn.disabled = true;
      if (hint) { hint.className = "otp-hint"; hint.textContent = "جارٍ إرسال الرمز…"; }
      const req = window.MadarkApi ? window.MadarkApi.call("sendOtp", { phone: p }) : null;
      if (!req) {
        sendOtpBtn.disabled = false;
        if (hint) { hint.className = "otp-hint err"; hint.textContent = "التفعيل بالجوال يتطلب الاتصال بالخادم"; }
        return;
      }
      req.then(function (r) {
        sendOtpBtn.disabled = false;
        if (r && r.ok) {
          if (hint) { hint.className = "otp-hint ok"; hint.textContent = "أُرسل الرمز إلى رقمك — أدخله أدناه"; }
          const otpField = $("#otp-field");
          if (otpField) otpField.style.display = "";
          if (r.demo && r.code && $("#reg-otp")) {
            $("#reg-otp").value = String(r.code);
            if (hint) { hint.className = "otp-hint ok"; hint.textContent = "وضع تجريبي — تم تعبئة الرمز تلقائياً (" + r.code + ")"; }
          }
        } else {
          if (hint) { hint.className = "otp-hint err"; hint.textContent = (r && r.error) ? r.error : "تعذر إرسال الرمز"; }
        }
      });
    });
  }

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
      const email = $("input[type=email], input[name=loginId]", form);
      const pass = $("input[type=password], input[name=password]", form);
      const emailVal = email ? email.value.trim() : "";
      const isPhone = looksLikeSaudiPhone(emailVal);
      if (email && emailVal && !isPhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        e.preventDefault();
        email.focus();
        toast("يرجى إدخال بريد إلكتروني صحيح أو رقم جوال سعودي", "error");
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
        const brand = (window.MadarkConfig && window.MadarkConfig.brand && window.MadarkConfig.brand.name) || "مدارك";
        const nameInput = $("input[type=text], #name", form);
        const roleInput = $("#reg-role");
        const emailClean = emailVal.toLowerCase();

        /* تسجيل الدخول: الخادم أولاً، ثم نسخة احتياطية محلية */
        if (kind === "login") {
          const proceedLocal = function (acc) {
            const user = {
              name: acc.name || emailVal.split("@")[0],
              email: acc.email,
              role: acc.role || "student",
              provider: acc.provider || "email",
              at: Date.now()
            };
            try { localStorage.setItem("madark-user", JSON.stringify(user)); } catch (err) {}
            toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
          };
          const blockPending = function (u) {
            if (u && u.role === "teacher" && u.status === "pending") {
              toast("حسابك قيد المراجعة — بانتظار موافقة إدارة المنصة ⏳", "info");
              return true;
            }
            return false;
          };
          const serverLogin = window.MadarkApi ? window.MadarkApi.call("login", { identifier: emailVal, password: pass.value }) : null;
          if (serverLogin) {
            serverLogin.then(function (r) {
              if (r && r.ok) {
                if (blockPending(r.user)) return;
                window.MadarkApi.setToken(r.token);
                window.MadarkApi.setUser(r.user);
                if (Array.isArray(r.bookings)) window.MadarkApi.setBookings(r.bookings);
                toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
                return;
              }
              if (r && r.error === "network") {
                if (isPhone) {
                  toast("تعذر التحقق من رقم الجوال — يلزم الاتصال بالخادم", "error");
                  return;
                }
                let accounts = [];
                try { accounts = JSON.parse(localStorage.getItem("madark-accounts") || "[]"); } catch (err) {}
                const acc = accounts.find(a => (a.email || "").toLowerCase() === emailVal);
                if (!acc) {
                  toast("تعذر الوصول للخادم، ولا يوجد حساب محلي بهذا البريد", "error");
                  return;
                }
                if (acc.password && acc.password !== pass.value) {
                  toast("كلمة المرور غير صحيحة", "error");
                  pass.focus();
                  return;
                }
                if (blockPending(acc)) return;
                proceedLocal(acc);
                return;
              }
              toast(r && r.error ? r.error : "بيانات الدخول غير صحيحة", "error");
              if (pass) pass.focus();
            });
          } else {
            if (isPhone) {
              toast("تسجيل الدخول بالجوال يتطلب الاتصال بالخادم", "error");
              return;
            }
            let accounts = [];
            try { accounts = JSON.parse(localStorage.getItem("madark-accounts") || "[]"); } catch (err) {}
            const acc = accounts.find(a => (a.email || "").toLowerCase() === emailVal);
            if (!acc) {
              toast("لا يوجد حساب بهذا البريد — أنشئ حساباً جديداً أولاً", "error");
              email.focus();
              return;
            }
            if (acc.password && acc.password !== pass.value) {
              toast("كلمة المرور غير صحيحة", "error");
              pass.focus();
              return;
            }
            if (blockPending(acc)) return;
            proceedLocal(acc);
          }
          return;
        }

        /* إنشاء حساب جديد: الخادم أولاً، ثم نسخة محلية احتياطية */
        const method = (methodInput && methodInput.value) || "email";
        const phoneInput = $("#reg-phone");
        const otpInput = $("#reg-otp");
        const phoneVal = phoneInput ? phoneInput.value.trim() : "";
        const otpVal = otpInput ? otpInput.value.trim() : "";
        const fullName = (nameInput && nameInput.value.trim());
        const role = (roleInput && roleInput.value) || "student";
        if (!fullName) {
          toast("أدخل اسمك الكامل", "error");
          if (nameInput) nameInput.focus();
          return;
        }

        /* قراءة شهادة التخصص (للمعلمين فقط) */
        function readCert() {
          return new Promise(function (resolve) {
            if (role !== "teacher") { resolve({ certName: "", certData: "" }); return; }
            if (!certInput || !certInput.files || !certInput.files[0]) {
              toast("يرجى إرفاق شهادة التخصص للموافقة على تسجيلك كمعلم", "error");
              if (certInput) certInput.focus();
              resolve(null);
              return;
            }
            const file = certInput.files[0];
            if (file.size > 2 * 1024 * 1024) {
              toast("حجم الشهادة كبير — اختر ملفاً أصغر من 2 ميجابايت", "error");
              resolve(null);
              return;
            }
            const reader = new FileReader();
            reader.onload = function () { resolve({ certName: file.name, certData: String(reader.result) }); };
            reader.onerror = function () { toast("تعذر قراءة الملف", "error"); resolve(null); };
            reader.readAsDataURL(file);
          });
        }

        /* التسجيل بالجوال السعودي (يتطلب رمز OTP مُفعّل) */
        if (method === "phone") {
          if (!looksLikeSaudiPhone(phoneVal)) {
            toast("أدخل رقم جوال سعودي صحيح (مثال: 05xxxxxxxx)", "error");
            if (phoneInput) phoneInput.focus();
            return;
          }
          if (!/^\d{4,6}$/.test(otpVal)) {
            toast("أدخل رمز التحقق المرسل إلى جوالك", "error");
            if (otpInput) otpInput.focus();
            return;
          }
          readCert().then(function (cert) {
            if (!cert) return;
            const vreq = window.MadarkApi ? window.MadarkApi.call("verifyOtp", { phone: phoneVal, code: otpVal }) : null;
            if (!vreq) {
              toast("تعذر الاتصال بالخادم — تحقق الجوال يتطلب اتصالاً", "error");
              return;
            }
            vreq.then(function (vr) {
              if (!vr || !vr.ok) {
                toast(vr && vr.error ? vr.error : "رمز التحقق غير صحيح", "error");
                if (otpInput) otpInput.focus();
                return;
              }
              const sreq = window.MadarkApi ? window.MadarkApi.call("signup", { name: fullName, phone: phoneVal, password: pass.value, role: role, certName: cert.certName, certData: cert.certData }) : null;
              if (!sreq) {
                toast("تعذر الاتصال بالخادم", "error");
                return;
              }
              sreq.then(function (r) {
                if (r && r.ok) {
                  window.MadarkApi.setToken(r.token);
                  window.MadarkApi.setUser(r.user);
                  if (Array.isArray(r.bookings)) window.MadarkApi.setBookings(r.bookings);
                  if (role === "teacher") {
                    toast("تم إنشاء حسابك كمعلّم — سيتم تفعيله بعد مراجعة الإدارة ⏳", "info");
                    return;
                  }
                  toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
                  setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
                  return;
                }
                toast(r && r.error ? r.error : "تعذر إنشاء الحساب", "error");
              });
            });
          });
          return;
        }

        /* التسجيل بالبريد الإلكتروني */
        const storeLocal = function () {
          let accounts = [];
          try { accounts = JSON.parse(localStorage.getItem("madark-accounts") || "[]"); } catch (err) {}
          if (accounts.some(a => (a.email || "").toLowerCase() === emailClean)) {
            toast("هذا البريد مسجل مسبقاً — سجّل دخولك", "error");
            email.focus();
            return null;
          }
          const user = {
            name: fullName,
            email: emailClean,
            password: pass.value,
            role: role,
            status: role === "teacher" ? "pending" : "active",
            provider: "email",
            at: Date.now()
          };
          accounts.push(user);
          try { localStorage.setItem("madark-accounts", JSON.stringify(accounts)); } catch (err) {}
          return user;
        };
        readCert().then(function (cert) {
          if (!cert) return;
          const serverSignup = window.MadarkApi ? window.MadarkApi.call("signup", { name: fullName, email: emailClean, password: pass.value, role: role, certName: cert.certName, certData: cert.certData }) : null;
          if (serverSignup) {
            serverSignup.then(function (r) {
              if (r && r.ok) {
                window.MadarkApi.setToken(r.token);
                window.MadarkApi.setUser(r.user);
                if (Array.isArray(r.bookings)) window.MadarkApi.setBookings(r.bookings);
                if (role === "teacher") {
                  toast("تم إنشاء حسابك كمعلّم — سيتم تفعيله بعد مراجعة الإدارة ⏳", "info");
                  return;
                }
                toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
                return;
              }
              if (r && r.error === "هذا البريد مسجل مسبقاً") {
                window.MadarkApi.call("login", { email: emailClean, password: pass.value }).then(function (lr) {
                  if (lr && lr.ok) {
                    if (lr.user && lr.user.role === "teacher" && lr.user.status === "pending") {
                      toast("حسابك قيد المراجعة — بانتظار موافقة إدارة المنصة ⏳", "info");
                      return;
                    }
                    window.MadarkApi.setToken(lr.token);
                    window.MadarkApi.setUser(lr.user);
                    if (Array.isArray(lr.bookings)) window.MadarkApi.setBookings(lr.bookings);
                    toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
                    setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
                  } else {
                    toast(lr && lr.error ? lr.error : "هذا البريد مسجل مسبقاً — سجّل دخولك", "error");
                  }
                });
                return;
              }
              if (r && r.error === "network") {
                const u = storeLocal();
                if (!u) return;
                if (role === "teacher") {
                  toast("تم إنشاء حسابك محلياً كمعلّم — سيُفعّل بعد مراجعة الإدارة ⏳", "info");
                  return;
                }
                try { localStorage.setItem("madark-user", JSON.stringify(u)); } catch (err) {}
                toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉 (وضع محلي)", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
              } else {
                toast(r && r.error ? r.error : "تعذر إنشاء الحساب", "error");
              }
            });
          } else {
            const u = storeLocal();
            if (!u) return;
            if (role === "teacher") {
              toast("تم إنشاء حسابك كمعلّم — سيتم تفعيله بعد مراجعة الإدارة ⏳", "info");
              return;
            }
            try { localStorage.setItem("madark-user", JSON.stringify(u)); } catch (err) {}
            toast("أهلاً بك في " + brand + " — جارٍ الدخول… 🎉", "success");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 450);
          }
        });
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
    if (window.MadarkApi) {
      window.MadarkApi.call("logout", {}).then(() => {});
      window.MadarkApi.clearToken();
    }
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

  /* ---------- تحديث السنة في الفوتر ---------- */
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();
