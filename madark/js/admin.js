/* ============================================
   مدارك للتدريب والتعليم — لوحة إعدادات المالك
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
        if (window.MadarkApi) {
          window.MadarkApi.call("ownerLogin", { email: email, password: pass }).then(function (r) {
            if (r && r.ok && r.ownerToken) {
              window.MadarkApi.setOwnerToken(r.ownerToken);
              renderUsersReport();
            } else if (r && r.error === "network") {
              toast("الخادم غير متاح — يعمل وضع السجل المحلي فقط", "info");
            }
          });
        }
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

  /* ---------- خيارات الخطوط المتاحة (Google Fonts) ---------- */
  var FONT_OPTIONS = [
    ["Tajawal", "تجوال"],
    ["Cairo", "القاهرة"],
    ["Almarai", "المريئ"],
    ["Rubik", "روبيك"],
    ["Noto Kufi Arabic", "كوفي (Noto Kufi)"],
    ["Amiri", "أميري"],
    ["El Messiri", "المسيري"],
    ["Alexandria", "الإسكندرية"],
    ["IBM Plex Sans Arabic", "IBM Plex Sans"],
    ["Reem Kufi", "ريم كوفي"]
  ];
  function fontSelect(id, current) {
    return '<select id="' + id + '" class="admin-input admin-select">' +
      FONT_OPTIONS.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === current ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") + "</select>";
  }
  var COLOR_FIELDS = [
    ["ad-color-primary", "اللون الأساسي"],
    ["ad-color-dark", "اللون الأساسي الغامق"],
    ["ad-color-light", "درجة التدرج الفاتح"],
    ["ad-color-accent", "اللون الثانوي"]
  ];
  function themeRowsHTML(theme) {
    var colors = (theme || {}).colors || {};
    var fonts = (theme || {}).fonts || {};
    var colorRows = COLOR_FIELDS.map(function (c) {
      return "" +
        '<div class="admin-row">' +
        '  <span class="admin-key">' + c[1] + "</span>" +
        '  <input type="color" id="' + c[0] + '" class="admin-color" ' + input(colors[c[1] === "اللون الأساسي" ? "primary" : c[1] === "اللون الأساسي الغامق" ? "primaryDark" : c[1] === "درجة التدرج الفاتح" ? "primaryLight" : "accent"]) + ">" +
        '  <input type="text" id="' + c[0] + '-hex" class="admin-input admin-input-md" ' + input(colors[c[1] === "اللون الأساسي" ? "primary" : c[1] === "اللون الأساسي الغامق" ? "primaryDark" : c[1] === "درجة التدرج الفاتح" ? "primaryLight" : "accent"]) + ">" +
        "</div>";
    }).join("");
    var fontRows = "" +
      '<div class="admin-row">' +
      '  <span class="admin-key">خط النصوص</span>' +
      '  <div class="admin-font-select">' + fontSelect("ad-font-body", fonts.body || "Tajawal") + "</div>" +
      "</div>" +
      '<div class="admin-row">' +
      '  <span class="admin-key">خط العناوين</span>' +
      '  <div class="admin-font-select">' + fontSelect("ad-font-head", fonts.head || "Cairo") + "</div>" +
      "</div>";
    return colorRows + fontRows;
  }
  function readThemeFields() {
    var colors = {};
    COLOR_FIELDS.forEach(function (c) {
      var key = c[1] === "اللون الأساسي" ? "primary" : c[1] === "اللون الأساسي الغامق" ? "primaryDark" : c[1] === "درجة التدرج الفاتح" ? "primaryLight" : "accent";
      colors[key] = (($("#" + c[0] + "-hex") || {}).value || "").trim();
    });
    return {
      colors: colors,
      fonts: {
        body: (($("#ad-font-body") || {}).value || "").trim(),
        head: (($("#ad-font-head") || {}).value || "").trim()
      }
    };
  }
  function bindThemePreview() {
    function preview() {
      if (window.MadarkConfig && window.MadarkConfig.applyTheme) {
        window.MadarkConfig.applyTheme(readThemeFields());
      }
    }
    COLOR_FIELDS.forEach(function (c) {
      var colorInput = $("#" + c[0]);
      var hexInput = $("#" + c[0] + "-hex");
      if (!colorInput || !hexInput) return;
      colorInput.addEventListener("input", function () {
        hexInput.value = colorInput.value;
        preview();
      });
      hexInput.addEventListener("input", function () {
        var v = hexInput.value.trim();
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
          colorInput.value = v;
          preview();
        }
      });
    });
    ["ad-font-body", "ad-font-head"].forEach(function (id) {
      var sel = $("#" + id);
      if (sel) sel.addEventListener("change", preview);
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
      "    <div class='panel-head'><h3>المظهر والألوان</h3><span class='admin-hint'>تظهر الألوان والخطوط فور التغيير — احفظ لتثبيتها</span></div>" +
      themeRowsHTML(settings.theme) +
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

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>إحصائيات المنصة</h3>" +
      '      <span class="admin-hint">أرقام حقيقية محسوبة من حسابات وحجوزات الخادم — لا تظهر إلا للمالك هنا</span>' +
      "    </div>" +
      '    <div class="admin-stats" id="ad-stats"></div>' +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>طلبات المعلمين — المراجعة والاعتماد</h3>" +
      '      <span class="admin-hint">راجع شهادة التخصص ثم اعتمد أو ارفض الطلب.</span>' +
      "    </div>" +
      '    <div id="ad-teacher-requests"></div>' +
      "  </section>" +

      '  <section class="panel">' +
      "    <div class='panel-head'><h3>سجل المستخدمين والحصص — للمراجعة</h3></div>" +
      "    <p class='admin-hint'>ملف خاص يعرض كل مستخدم مسجل وجلساته المحجوزة. استخدم زر التنزيل لحفظ نسخة المراجعة (HTML) في مجلد خاص بك.</p>" +
      '    <div id="ad-report-users"></div>' +
      '    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">' +
      '      <button type="button" class="btn btn-primary btn-sm" id="adReportDownloadBtn">تنزيل ملف المراجعة</button>' +
      '      <button type="button" class="btn btn-outline btn-sm" id="adReportRefreshBtn">تحديث السجل</button>' +
      "    </div>" +
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
    bindThemePreview();
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

    var repDl = $("#adReportDownloadBtn", target);
    var repRf = $("#adReportRefreshBtn", target);
    if (repDl) repDl.addEventListener("click", downloadReport);
    if (repRf) repRf.addEventListener("click", function () { renderUsersReport(); toast("تم تحديث سجل المراجعة", "success"); });
    renderUsersReport();
  }

  /* ---------- سجل المستخدمين والحصص — منطقة مراجعة المالك ---------- */
  function esc(str) {
    return String(str == null ? "" : str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function getAccounts() {
    try { return JSON.parse(localStorage.getItem("madark-accounts") || "[]"); } catch (e) { return []; }
  }
  function getBookings() {
    try { return JSON.parse(localStorage.getItem("madark-bookings") || "[]"); } catch (e) { return []; }
  }
  function roleLabel(role) {
    return role === "teacher" ? "معلم" : "طالب";
  }
  var serverReport = null;
  function ownerKeyOf(b) { return (b.by || b.email || "").toLowerCase(); }
  function renderStats(users, bookings) {
    var wrap = $("#ad-stats");
    if (!wrap) return;
    users = users || [];
    bookings = bookings || [];
    var teachers = users.filter(function (u) { return u.role === "teacher"; });
    var students = users.filter(function (u) { return u.role === "student"; });
    var pending = teachers.filter(function (t) { return t.status === "pending"; });
    var approved = teachers.filter(function (t) { return t.status === "approved" || t.status === "active"; });
    var group = bookings.filter(function (b) { return b.type === "group"; }).length;
    var individual = bookings.length - group;
    function card(label, val, cls) {
      return '<div class="admin-stat ' + cls + '"><b>' + val + "</b><span>" + label + "</span></div>";
    }
    wrap.innerHTML =
      card("إجمالي المستخدمين", users.length, "a") +
      card("طلاب", students.length, "d") +
      card("معلمون معتمدون", approved.length, "b") +
      card("معلمون بانتظار الموافقة", pending.length, "c") +
      card("إجمالي الحجوزات", bookings.length, "a") +
      card("حصص جماعية", group, "b") +
      card("حصص فردية", individual, "c");
  }
  function renderReportFrom(accounts, bookings) {
    renderStats(accounts, bookings);
    var wrap = $("#ad-report-users");
    if (!wrap) return;
    accounts = accounts || [];
    bookings = bookings || [];
    if (!accounts.length && !bookings.length) {
      wrap.innerHTML = '<p class="admin-hint" style="text-align:center;padding:14px 0;">لا يوجد مستخدمون أو حجوزات بعد.</p>';
      return;
    }
    var html = "";
    accounts.forEach(function (acc) {
      var mine = bookings.filter(function (b) { return ownerKeyOf(b) === teacherIdOf(acc); });
      var when = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("ar-SA") : (acc.at ? new Date(acc.at).toLocaleDateString("ar-SA") : "—");
      var badge = acc.status === "pending"
        ? '<span style="background:rgba(245,158,11,.15);color:#b45309;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">بانتظار الموافقة</span>'
        : acc.status === "rejected"
          ? '<span style="background:rgba(239,68,68,.15);color:#b91c1c;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">مرفوض</span>'
          : '<span style="background:rgba(16,185,129,.15);color:#047857;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">نشط</span>';
      html += '<div class="profile-id" style="flex-wrap:wrap;">' +
        '<span class="avatar" style="width:42px;height:42px;font-size:16px;">' + esc((acc.name || "م").charAt(0)) + "</span>" +
        '<span style="flex:1;min-width:180px;"><b style="display:block;">' + esc(acc.name) + '</b><small style="color:var(--text-muted);">' + esc(acc.email || acc.phone) + " • " + roleLabel(acc.role) + " • سجل في " + when + " • " + badge + "</small></span>" +
        '<b style="color:var(--primary);font-size:13px;">' + mine.length + " حجز</b></div>";
      if (mine.length) {
        html += '<div class="profile-table-wrap" style="margin-bottom:14px;"><table class="profile-table"><thead><tr><th>#</th><th>المعلم</th><th>التاريخ</th><th>الوقت</th><th>النوع</th><th>تاريخ الحجز</th></tr></thead><tbody>';
        mine.forEach(function (b, i) {
          var parts = b.date ? b.date.split("-") : [];
          var dateLabel = parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : b.date || "—";
          html += "<tr><td>" + (i + 1) + "</td><td>" + esc(b.teacher) + "</td><td>" + dateLabel + "</td><td>" + esc(b.time || "") + "</td><td>" + (b.type === "group" ? "جماعية" : "فردية") + "</td><td>" + new Date(b.at).toLocaleDateString("ar-SA") + "</td></tr>";
        });
        html += "</tbody></table></div>";
      } else {
        html += '<p style="font-size:13px;color:var(--text-muted);margin:0 0 14px 8px;">لا توجد جلسات محجوزة بعد.</p>';
      }
    });
    wrap.innerHTML = html;
  }
  function renderUsersReport() {
    renderReportFrom(getAccounts(), getBookings());
    renderTeacherRequestsFrom(getAccounts().filter(function (a) { return a.role === "teacher"; }));
    fetchServerReport();
  }
  function fetchServerReport() {
    var ot = window.MadarkApi ? window.MadarkApi.getOwnerToken() : "";
    if (!ot) return;
    window.MadarkApi.call("ownerReport", { token: ot }).then(function (r) {
      if (r && r.ok) {
        serverReport = { users: r.users || [], bookings: r.bookings || [] };
        renderReportFrom(serverReport.users, serverReport.bookings);
        renderTeacherRequestsFrom(serverReport.users.filter(function (u) { return u.role === "teacher"; }));
      } else if (r && r.error === "غير مصرح — سجّل دخول المالك أولاً") {
        window.MadarkApi.clearOwnerToken();
      }
    });
  }

  /* ---------- طلبات المعلمين: العرض والاعتماد والرفض ---------- */
  function teacherIdOf(acc) {
    return (acc.email || acc.phone || "").toLowerCase();
  }
  function renderTeacherRequestsFrom(list) {
    var wrap = $("#ad-teacher-requests");
    if (!wrap) return;
    list = list || [];
    if (!list.length) {
      wrap.innerHTML = '<p class="admin-hint" style="text-align:center;padding:14px 0;">لا توجد طلبات معلمين حالياً.</p>';
      return;
    }
    var html = "";
    list.forEach(function (acc) {
      var badge = acc.status === "approved"
        ? '<span style="background:rgba(16,185,129,.15);color:#047857;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">معتمد</span>'
        : acc.status === "rejected"
          ? '<span style="background:rgba(239,68,68,.15);color:#b91c1c;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">مرفوض</span>'
          : '<span style="background:rgba(245,158,11,.15);color:#b45309;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;">بانتظار المراجعة</span>';
      var ident = teacherIdOf(acc);
      var when = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("ar-SA") : (acc.at ? new Date(acc.at).toLocaleDateString("ar-SA") : "—");
      var certLink = acc.certData
        ? '<a href="' + acc.certData + '" target="_blank" rel="noopener" download="' + esc(acc.certName || "شهادة") + '" style="color:var(--primary);font-weight:700;font-size:13px;display:inline-flex;align-items:center;gap:5px;">📄 عرض الشهادة' + (acc.certName ? " (" + esc(acc.certName) + ")" : "") + "</a>"
        : '<span style="font-size:12.5px;color:var(--text-muted);">لا توجد شهادة</span>';
      var actions = acc.status === "pending"
        ? '<button type="button" class="btn btn-primary btn-sm" data-tr="approve" data-tr-email="' + esc(ident) + '">اعتماد</button>' +
          '<button type="button" class="btn btn-outline btn-sm" data-tr="reject" data-tr-email="' + esc(ident) + '">رفض</button>'
        : acc.status === "approved"
          ? '<button type="button" class="btn btn-outline btn-sm" data-tr="reject" data-tr-email="' + esc(ident) + '">إلغاء الاعتماد</button>'
          : '<button type="button" class="btn btn-primary btn-sm" data-tr="approve" data-tr-email="' + esc(ident) + '">إعادة الاعتماد</button>';
      html += '<div class="profile-id" style="flex-wrap:wrap;border-radius:12px;padding:10px 12px;margin-bottom:10px;border:1.5px solid var(--border);' + (acc.status === "pending" ? "border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.05);" : "") + '">' +
        '<span class="avatar" style="width:42px;height:42px;font-size:16px;">' + esc((acc.name || "م").charAt(0)) + "</span>" +
        '<span style="flex:1;min-width:170px;"><b style="display:block;">' + esc(acc.name) + '</b><small style="color:var(--text-muted);">' + esc(ident) + " • سجل في " + when + " • " + badge + "</small></span>" +
        '<span style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' + certLink + actions + "</span>" +
        "</div>";
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll("[data-tr]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTeacherStatus(btn.getAttribute("data-tr-email"), btn.getAttribute("data-tr") === "approve" ? "approved" : "rejected");
      });
    });
  }
  function setTeacherStatus(email, status) {
    var list = getAccounts();
    var phone = "";
    list.forEach(function (a) {
      if (teacherIdOf(a) === String(email || "").toLowerCase()) { a.status = status; phone = a.phone || ""; }
    });
    try { localStorage.setItem("madark-accounts", JSON.stringify(list)); } catch (e) {}
    if (window.MadarkApi) {
      var ot = window.MadarkApi.getOwnerToken();
      if (ot) {
        window.MadarkApi.call("approveTeacher", { token: ot, email: email, phone: phone, status: status }).then(function (r) {
          if (r && r.ok) {
            list.forEach(function (a) {
              if (teacherIdOf(a) === String((r.user && (r.user.email || r.user.phone)) || email || "").toLowerCase()) a.status = status;
            });
            try { localStorage.setItem("madark-accounts", JSON.stringify(list)); } catch (e) {}
            renderUsersReport();
          } else if (r && r.error === "غير مصرح — سجّل دخول المالك أولاً") {
            window.MadarkApi.clearOwnerToken();
          } else {
            toast((r && r.error) || "تعذر اعتماد المعلم على الخادم", "error");
          }
        });
      }
    }
    toast(status === "approved" ? "تم اعتماد المعلم — أصبح بإمكانه الدخول ✅" : "تم رفض الطلب", status === "approved" ? "success" : "error");
    renderUsersReport();
  }
  function downloadReport() {
    var data = serverReport || { users: getAccounts(), bookings: getBookings() };
    var accounts = data.users || [];
    var bookings = data.bookings || [];
    var dateStr = new Date().toLocaleDateString("ar-SA");
    var brandName = (settings.brand && settings.brand.name) || "مدارك";
    var rows = "";
    accounts.forEach(function (acc) {
      var mine = bookings.filter(function (b) { return ownerKeyOf(b) === teacherIdOf(acc); });
      var when = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("ar-SA") : (acc.at ? new Date(acc.at).toLocaleDateString("ar-SA") : "—");
      rows += '<div class="u"><div class="uh"><strong>' + esc(acc.name) + "</strong><span>" + esc(acc.email || acc.phone) + " • " + roleLabel(acc.role) + " • سجل في " + when + "</span></div>";
      if (mine.length) {
        rows += '<table><tr><th>#</th><th>المعلم</th><th>التاريخ</th><th>الوقت</th><th>النوع</th><th>تاريخ الحجز</th></tr>';
        mine.forEach(function (b, i) {
          var parts = b.date ? b.date.split("-") : [];
          var dateLabel = parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : b.date || "—";
          rows += "<tr><td>" + (i + 1) + "</td><td>" + esc(b.teacher) + "</td><td>" + dateLabel + "</td><td>" + esc(b.time || "") + "</td><td>" + (b.type === "group" ? "جماعية" : "فردية") + "</td><td>" + new Date(b.at).toLocaleDateString("ar-SA") + "</td></tr>";
        });
        rows += "</table>";
      } else {
        rows += '<p class="none">لا توجد جلسات محجوزة بعد.</p>';
      }
      rows += "</div>";
    });
    if (!accounts.length) rows = '<p class="none">لا يوجد مستخدمون بعد.</p>';
    var doc = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>مراجعة المستخدمين والحصص — ' + esc(brandName) + " — " + dateStr + '</title><style>body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;background:#f4f6fb;margin:0;padding:24px;color:#1e293b}h1{font-size:22px;margin:0 0 4px}.meta{color:#64748b;font-size:13px;margin-bottom:20px}.u{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:14px}.uh{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;margin-bottom:8px}.uh span{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}th,td{border:1px solid #e2e8f0;padding:6px 10px;text-align:right}th{background:#f1f5f9}.none{color:#94a3b8;font-size:13px}</style></head><body><h1>📁 ملف المراجعة — المستخدمون والحصص</h1><div class="meta">المنصة: ' + esc(brandName) + " • تاريخ التقرير: " + dateStr + " • إجمالي المستخدمين: " + accounts.length + " • إجمالي الحجوزات: " + bookings.length + "</div>" + rows + "</body></html>";
    try {
      var blob = new Blob([doc], { type: "text/html;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "مراجعة-المستخدمين-والحصص-" + new Date().toISOString().slice(0, 10) + ".html";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast("تم إنشاء ملف المراجعة وتنزيله 📁", "success");
    } catch (e) {
      toast("تعذر إنشاء ملف المراجعة", "error");
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
      theme: readThemeFields(),
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
