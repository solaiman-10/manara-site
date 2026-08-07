/* ============================================
   Madark للتدريب والتعليم — لوحة إعدادات المالك
   تسجيل دخول المالك + تعديل الأسعار والخطط
   وطرق الدفع وهوية المنصة، ويُحفظ محلياً
   (localStorage) ثم تُطبَّق على كل الصفحات.
   ============================================ */

(function () {
  "use strict";

  var STORE_KEY = "madark-admin-settings";
  var SESSION_KEY = "madark-admin-auth";
  var BASE = window.MadarkConfig;
  if (!BASE) return;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };
  var settings = BASE.load ? BASE.load() : BASE;

  /* ---------- تنبيهات toast (نسخة محلية مستقلة) ---------- */
  var toastBox = null;
  function toast(msg, type) {
    if (window.toast) { window.toast(msg, type); return; }
    if (!toastBox) {
      toastBox = document.createElement("div");
      Object.assign(toastBox.style, { position: "fixed", bottom: "24px", right: "24px", zIndex: "99999", display: "flex", flexDirection: "column", gap: "10px" });
      document.body.appendChild(toastBox);
    }
    var el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = "background:" + (type === "error" ? "#ef4444" : "#10b981") + ";color:#fff;padding:14px 22px;border-radius:12px;font-weight:700;font-size:14px;direction:rtl;box-shadow:0 10px 30px rgba(0,0,0,.2);";
    toastBox.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  /* ---------- حالة الدخول ---------- */
  var authed = false;
  try { authed = sessionStorage.getItem(SESSION_KEY) === "1" || sessionStorage.getItem("noon-admin-auth") === "1"; } catch (e) {}

  var loginScreen = $("#adminLogin");
  var dashScreen = $("#adminDash");

  function showLogin() {
    if (loginScreen) loginScreen.style.display = "";
    if (dashScreen) dashScreen.style.display = "none";
  }
  function showDash() {
    if (loginScreen) loginScreen.style.display = "none";
    if (dashScreen) dashScreen.style.display = "";
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------- نموذج الدخول ---------- */
  function bindLogin() {
    var form = $("#ownerLoginForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = ($("#ownerEmail") || {}).value;
      var pass = ($("#ownerPass") || {}).value;
      if ((email || "").trim().toLowerCase() === (settings.owner.email || "").trim().toLowerCase() &&
          pass === settings.owner.password) {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
        toast("مرحباً بك في لوحة إعدادات المالك 🔧", "success");
        authed = true;
        buildDash();
        showDash();
      } else {
        toast("بيانات تسجيل الدخول غير صحيحة", "error");
      }
    });
  }

  /* ---------- بناء لوحة الإعدادات ---------- */
  function input(value, extra) {
    return 'value="' + (value == null ? "" : String(value).replace(/"/g, "&quot;")) + '"' + (extra || "");
  }

  var methodSeq = 0;
  function methodRowHTML(m) {
    methodSeq++;
    var idx = methodSeq;
    return "" +
      '<div class="admin-row admin-method-row">' +
      '  <span class="admin-key">' + (m.label || "طريقة جديدة") + "</span>" +
      '  <input type="text" class="admin-input admin-input-xs" placeholder="المعرّف" data-m-id ' + input(m.id) + ">" +
      '  <input type="text" class="admin-input" placeholder="الاسم" data-m-label ' + input(m.label) + ">" +
      '  <input type="text" class="admin-input admin-input-md" placeholder="الوصف" data-m-desc ' + input(m.desc) + ">" +
      '  <button type="button" class="btn btn-outline btn-sm admin-method-del">حذف</button>' +
      "</div>";
  }

  function bindMethodRow(row) {
    var del = row.querySelector(".admin-method-del");
    if (!del) return;
    del.addEventListener("click", function () {
      row.remove();
      toast("تم حذف الطريقة — احفظ ليطبَّق", "success");
    });
  }

  function buildDash() {
    var target = $("#adminDash");
    if (!target) return;

    var brandRows = "" +
      '<div class="form-group">' +
      '  <label>اسم المنصة</label>' +
      '  <input type="text" id="ad-brand-name" class="admin-input" ' + input(settings.brand.name) + ">" +
      "</div>" +
      '<div class="form-group">' +
      '  <label>الشعار التعريفي</label>' +
      '  <input type="text" id="ad-brand-tagline" class="admin-input" ' + input(settings.brand.tagline) + ">" +
      "</div>" +
      '<div class="form-group">' +
      '  <label>العملة</label>' +
      '  <input type="text" id="ad-currency" class="admin-input" ' + input(settings.currency) + ">" +
      "</div>";

    var planRows = Object.keys(settings.pricing.plans || {}).map(function (key) {
      var p = settings.pricing.plans[key];
      return "" +
        '<div class="admin-row">' +
        '  <span class="admin-key">' + p.name + "</span>" +
        '  <input type="number" min="0" class="admin-input" id="ad-plan-' + key + '-price" ' + input(p.price) + ">" +
        '  <input type="text" class="admin-input admin-input-sm" id="ad-plan-' + key + '-period" ' + input(p.period) + ">" +
        "</div>";
    }).join("");

    var courseRows = Object.keys(settings.pricing.courses || {}).map(function (key) {
      var c = settings.pricing.courses[key];
      var free = c.free ? " checked" : "";
      return "" +
        '<div class="admin-row">' +
        '  <span class="admin-key" title="' + c.name + '">' + c.name + "</span>" +
        '  <input type="number" min="0" class="admin-input" id="ad-course-' + key + '-price" ' + input(c.price) + ">" +
        '  <input type="number" min="0" class="admin-input admin-input-sm" id="ad-course-' + key + '-old" ' + input(c.oldPrice || 0) + ">" +
        '  <label class="admin-check"><input type="checkbox" id="ad-course-' + key + '-free"' + free + "> مجاني</label>" +
        "</div>";
    }).join("");

    var methodRows = (settings.payment.methods || []).map(function (m) {
      return methodRowHTML(m);
    }).join("");

    var ownerRows = "" +
      '<div class="form-group">' +
      '  <label>بريد المالك (تسجيل الدخول)</label>' +
      '  <input type="email" id="ad-owner-email" class="admin-input" ' + input(settings.owner.email) + ">" +
      "</div>" +
      '<div class="form-group">' +
      '  <label>كلمة مرور المالك</label>' +
      '  <input type="password" id="ad-owner-pass" class="admin-input" ' + input(settings.owner.password) + ">" +
      "</div>";

    target.innerHTML = "" +
      '<div class="admin-head">' +
      "  <div>" +
      '    <h2>لوحة إعدادات المالك</h2>' +
      "    <p>عدّل الإعدادات ثم احفظ — تُطبق تلقائياً على كل صفحات المنصة.</p>" +
      "  </div>" +
      '  <button class="btn btn-outline btn-sm" id="adminLogoutBtn">تسجيل الخروج</button>' +
      "</div>" +

      '<div class="admin-panels">' +
      '  <section class="panel">' +
      "    <div class='panel-head'><h3>هوية المنصة</h3></div>" +
      brandRows +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>أسعار الباقات</h3></div>" +
      planRows +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>أسعار الكورسات</h3><span class='admin-hint'>السعر / السعر القديم / مجاني</span></div>" +
      courseRows +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>طرق الدفع</h3>" +
      '      <button type="button" class="btn btn-outline btn-sm" id="adminAddMethod">+ إضافة طريقة</button>' +
      "    </div>" +
      '    <div id="ad-methods-list">' + methodRows + "</div>" +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>بيانات المالك</h3></div>" +
      ownerRows +
      "  </section>" +
      "</div>" +

      '<div class="admin-actions">' +
      '  <button class="btn btn-primary btn-lg" id="adminSaveBtn">حفظ الإعدادات</button>' +
      '  <button class="btn btn-outline btn-lg" id="adminResetBtn">استعادة الافتراضي</button>' +
      "</div>";

    var saveBtn = $("#adminSaveBtn", target);
    var resetBtn = $("#adminResetBtn", target);
    var logoutBtn = $("#adminLogoutBtn", target);
    var addMethodBtn = $("#adminAddMethod", target);

    saveBtn.addEventListener("click", save);
    resetBtn.addEventListener("click", reset);
    logoutBtn.addEventListener("click", logout);

    $$(".admin-method-row", target).forEach(bindMethodRow);
    if (addMethodBtn) {
      addMethodBtn.addEventListener("click", function () {
        var list = $("#ad-methods-list", target);
        if (!list) return;
        var wrap = document.createElement("div");
        wrap.innerHTML = methodRowHTML({ id: "", label: "", desc: "" });
        var row = wrap.firstElementChild;
        list.appendChild(row);
        bindMethodRow(row);
      });
    }
  }

  /* ---------- تجميع القيم من الحقول ---------- */
  function collect() {
    var out = {
      brand: {
        name: ($("#ad-brand-name") || {}).value,
        tagline: ($("#ad-brand-tagline") || {}).value
      },
      currency: ($("#ad-currency") || {}).value,
      pricing: { courses: {}, plans: {} },
      payment: { methods: [] },
      owner: {
        email: ($("#ad-owner-email") || {}).value,
        password: ($("#ad-owner-pass") || {}).value
      }
    };

    Object.keys(settings.pricing.plans || {}).forEach(function (key) {
      var name = settings.pricing.plans[key].name;
      out.pricing.plans[key] = {
        name: name,
        price: Number($("#ad-plan-" + key + "-price").value) || 0,
        period: $("#ad-plan-" + key + "-period").value
      };
    });

    Object.keys(settings.pricing.courses || {}).forEach(function (key) {
      var name = settings.pricing.courses[key].name;
      out.pricing.courses[key] = {
        name: name,
        price: Number($("#ad-course-" + key + "-price").value) || 0,
        oldPrice: Number($("#ad-course-" + key + "-old").value) || 0,
        free: !!$("#ad-course-" + key + "-free").checked
      };
    });

    (settings.payment.methods || []).forEach(function (m) { /* محجوز للتوافق */ });
    out.payment.methods = $$(".admin-method-row", dashScreen).map(function (row) {
      return {
        id: (row.querySelector("[data-m-id]").value || "").trim(),
        label: (row.querySelector("[data-m-label]").value || "").trim(),
        desc: (row.querySelector("[data-m-desc]").value || "").trim()
      };
    }).filter(function (m) {
      return m.id && m.label;
    });

    return out;
  }

  /* ---------- حفظ / استعادة / خروج ---------- */
  function save() {
    var data = collect();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      toast("تم حفظ الإعدادات بنجاح ✅ — ستظهر في كل الصفحات", "success");
    } catch (e) {
      toast("تعذر حفظ الإعدادات", "error");
    }
  }

  function reset() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    toast("تمت استعادة الإعدادات الافتراضية", "success");
    setTimeout(function () { location.reload(); }, 700);
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    authed = false;
    location.reload();
  }

  /* ---------- تشغيل ---------- */
  ready(function () {
    bindLogin();
    if (authed) {
      buildDash();
      showDash();
    } else {
      showLogin();
    }
  });
})();
