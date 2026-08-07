/* ============================================
   Madark للتدريب والتعليم — ملف الإعدادات المركزي
   ============================================
   المالك يعدّل هنا فقط:
   - الأسعار والخصومات (ر.س)
   - روابط التنقل والفوتر
   وستنتشر التعديلات تلقائياً في كل الصفحات.
   ملاحظة: الدفع وهمي للتجربة — لا يتم خصم مبالغ حقيقية.
   ============================================ */

window.MadarkConfig = {
  brand: {
    name: "Madark",
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
    copy: "Madark للتدريب والتعليم — جميع الحقوق محفوظة.",
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
})();
