/* ============================================
   مدارك للتدريب والتعليم — ملف الإعدادات المركزي
   ============================================
   المالك يعدّل هنا فقط:
   - الأسعار والخصومات (ر.س)
   - روابط التنقل والفوتر
   وستنتشر التعديلات تلقائياً في كل الصفحات.
   ملاحظة: الدفع وهمي للتجربة — لا يتم خصم مبالغ حقيقية.
   ============================================ */

window.MadarkConfig = {
  brand: {
    name: "مدارك",
    tagline: "للتدريب والتعليم",
    home: "index.html"
  },

  /* ---------- قائمة التنقل الرئيسية ---------- */
  nav: [
    { href: "index.html", label: "الرئيسية", key: "home" },
    { href: "courses.html", label: "الكورسات", key: "courses" },
    { href: "teachers.html", label: "المعلمون", key: "teachers" },
    { href: "index.html#pricing", label: "الباقات", key: "pricing" },
    { href: "index.html#faq", label: "الأسئلة الشائعة", key: "faq" },
    { href: "index.html#contact", label: "تواصل معنا", key: "contact" }
  ],

  /* ---------- الفوتر ---------- */
  footer: {
    blurb: "منصة عربية حديثة تضع مستقبل التعليم بين يدي كل طالب ومعلم، بأحدث التقنيات وأفضل الخبرات.",
    quickLinks: [
      { href: "index.html", label: "الرئيسية" },
      { href: "courses.html", label: "الكورسات" },
      { href: "teachers.html", label: "المعلمون" },
      { href: "index.html#pricing", label: "الباقات" },
      { href: "dashboard.html", label: "لوحة التحكم" }
    ],
    accountLinks: [
      { href: "auth.html", label: "تسجيل الدخول" },
      { href: "auth.html", label: "إنشاء حساب" },
      { href: "auth.html", label: "انضم كمعلّم" },
      { href: "admin.html", label: "دخول المالك" }
    ],
    newsletterText: "اشترك ليصلك كل جديد: كورسات، عروض، ونصائح تعليمية.",
    email: "support@madark.edu",
    phone: "+966 12 345 6789",
    copy: "مدارك للتدريب والتعليم — جميع الحقوق محفوظة.",
    madeWith: "صُنع بـ 💜 في العالم العربي"
  },

  /* ---------- العملة ---------- */
  currency: "ر.س",

  /* ============================================
     الأسعار — عدّل القيم هنا فقط
     free: true  → الكورس مجاني
     ============================================ */
  pricing: {
    courses: {
      math:       { name: "أساسيات الرياضيات المتقدمة",  price: 299, oldPrice: 499, free: false },
      python:     { name: "مقدمة في البرمجة بلغة بايثون", price: 0,   oldPrice: 0,   free: true  },
      ai:         { name: "ذكاء اصطناعي وتعلم الآلة",     price: 449, oldPrice: 699, free: false },
      physics:    { name: "الفيزياء الحديثة من الصفر",    price: 349, oldPrice: 499, free: false },
      english:    { name: "الإنجليزية لأعمالك اليومية",   price: 259, oldPrice: 399, free: false },
      webdev:     { name: "تطوير تطبيقات الويب الكاملة",  price: 499, oldPrice: 799, free: false },
      chemistry:  { name: "الكيمياء العضوية بلا تعقيد",   price: 279, oldPrice: 380, free: false },
      leadership: { name: "مهارات القيادة وإدارة الفرق",  price: 199, oldPrice: 299, free: false },
      data:       { name: "تحليل البيانات باستخدام بايثون", price: 429, oldPrice: 599, free: false }
    },
    plans: {
      starter: { name: "البداية",       price: 0,   period: "شهرياً" },
      pro:     { name: "المتفوق",       price: 59,  period: "شهرياً" },
      teacher: { name: "المعلّم المحترف", price: 199, period: "شهرياً" }
    }
  },

  /* ---------- إعدادات الدفع ---------- */
  payment: {
    /* mode: "demo" → دفع وهمي للتجربة
             "live" → دفع حقيقي عبر Tap Payments
       live يتطلب: حساب Tap + مفاتيح في Netlify Environment Variables
       (راجع js/payment.js و netlify/functions/) */
    mode: "demo",
    currencyIso: "SAR",
    tap: {
      publicKey: "pk_test_XXXX",      /* المفتاح العام من لوحة Tap — عدّله */
      merchantId: "",                  /* رقم التاجر من Tap — اختياري */
      siteUrl: ""                      /* رابط الموقع مثل https://madark.edu — ضروري للتحويل */
    },
    methods: [
      { id: "mada",    label: "مدى",       desc: "بطاقة مدى المصرفية" },
      { id: "visa",    label: "فيزا / ماستركارد", desc: "بطاقة ائتمانية دولية" },
      { id: "stcpay",  label: "STC Pay",    desc: "محفظة اتصالات السعودية" },
      { id: "applepay", label: "Apple Pay", desc: "الدفع بلمسة واحدة" }
    ],
    processingText: "جاري معالجة الدفع...",
    successTitle: "تم الدفع بنجاح 🎉",
    successText: "أصبح الكورس متاحاً في حسابك الآن، استمتع بالتعلم!",
    securedText: "دفع آمن ومشفر — هذه تجربة وهمية لا تُخصم مبالغ حقيقية"
  },

  /* ---------- بيانات مالك المنصة (تسجيل دخول لوحة الإعدادات) ---------- */
  owner: {
    email: "admin@madark.edu",
    password: "madark2026"
  },

  /* ============================================
     المظهر والألوان — قابلة للتعديل من لوحة
     إعدادات المالك (قسم "المظهر والألوان")
     colors: ألوان الهوية | fonts: خطوط الموقع
     ============================================ */
  theme: {
    colors: {
      primary: "#6d28d9",        /* اللون الأساسي */
      primaryDark: "#5b21b6",    /* اللون الأساسي الغامق */
      primaryLight: "#9333ea",   /* درجة التدرج الفاتح */
      accent: "#f59e0b"          /* اللون الثانوي */
    },
    fonts: {
      body: "Tajawal",           /* خط النصوص */
      head: "Cairo"              /* خط العناوين */
    }
  }
};

/* ============================================
   قراءة الإعدادات الفعلية: الدمج مع أي تعديلات
   حُفظت من لوحة إعدادات المالك (localStorage).
   كل الصفحات تستخدم MadarkConfig.load()
   ============================================ */
(function () {
  var KEY = "madark-admin-settings";
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function merge(base, saved) {
    if (!isObj(saved)) return saved === undefined ? base : saved;
    var out = {};
    Object.keys(base || {}).forEach(function (k) {
      out[k] = isObj(base[k]) ? merge(base[k], saved[k]) : (saved[k] === undefined ? base[k] : saved[k]);
    });
    Object.keys(saved || {}).forEach(function (k) {
      if (!(k in out)) out[k] = saved[k];
    });
    return out;
  }
  window.MadarkConfig.load = function () {
    var base = window.MadarkConfig;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem("noon-admin-settings"); } catch (e) {} }
    if (!raw) return base;
    var saved;
    try { saved = JSON.parse(raw); } catch (e) { return base; }
    return merge(base, saved);
  };

  /* ============================================
     تطبيق المظهر (الألوان والخطوط) على الصفحة.
     يُستدعى تلقائياً عند تحميل أي صفحة، ويُستدعى
     من لوحة المالك للمعاينة الفورية قبل الحفظ.
     ============================================ */
  window.MadarkConfig.applyTheme = function (theme) {
    var root = document.documentElement;
    if (!root) return;
    theme = theme || {};
    var colors = theme.colors || {};
    var fonts = theme.fonts || {};

    function setVar(name, value) {
      if (value) root.style.setProperty(name, value);
    }
    function fontStack(name) {
      return name ? "'" + name + "', 'Tajawal', 'Cairo', system-ui, sans-serif" : null;
    }
    function toRgba(hex, alpha) {
      var h = String(hex || "").replace("#", "");
      if (h.length === 3) h = h.split("").map(function (x) { return x + x; }).join("");
      var n = parseInt(h, 16);
      if (isNaN(n) || h.length !== 6) return "rgba(109, 40, 217, " + alpha + ")";
      return "rgba(" + ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255) + ", " + alpha + ")";
    }

    setVar("--primary", colors.primary);
    setVar("--primary-dark", colors.primaryDark);
    setVar("--primary-soft", toRgba(colors.primary, 0.12));
    setVar("--accent", colors.accent);
    setVar("--font", fontStack(fonts.body));
    setVar("--font-head", fontStack(fonts.head));
    if (colors.primary) {
      var light = colors.primaryLight || colors.primary;
      setVar("--gradient", "linear-gradient(135deg, " + colors.primary + " 0%, " + light + " 50%, " + colors.primary + " 100%)");
      setVar("--gradient-soft", "linear-gradient(135deg, " + toRgba(colors.primary, 0.10) + " 0%, " + toRgba(colors.primary, 0.03) + " 100%)");
      setVar("--shadow-primary", "0 10px 30px " + toRgba(colors.primary, 0.35));
    }

    /* تحميل خطوط Google Fonts المختارة إن لم تكن محمّلة في الصفحة */
    var known = ["Cairo", "Tajawal", "Almarai", "Rubik", "Noto Kufi Arabic", "Amiri", "El Messiri", "Alexandria", "IBM Plex Sans Arabic", "Reem Kufi"];
    var needed = [];
    [fonts.body, fonts.head].forEach(function (name) {
      if (name && known.indexOf(name) !== -1 && needed.indexOf(name) === -1) needed.push(name);
    });
    needed.forEach(function (name) {
      if (document.querySelector('link[data-font="' + name + '"]')) return;
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-font", name);
      link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(name) + ":wght@400;500;700;800;900&display=swap";
      document.head.appendChild(link);
    });
  };

  /* التطبيق التلقائي عند تحميل أي صفحة */
  window.MadarkConfig.applyTheme((window.MadarkConfig.load ? window.MadarkConfig.load() : window.MadarkConfig).theme);
})();
