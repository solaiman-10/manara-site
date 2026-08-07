/* ============================================
   مدارك للتدريب والتعليم — المكوّنات الموحّدة
   يحقن الهيدر/الفوتر في كل الصفحات من ملف الإعدادات
   ويملأ الأسعار تلقائياً حسب إعدادات المالك.
   ============================================ */

(function () {
  "use strict";

  var C = window.MadarkConfig && window.MadarkConfig.load ? window.MadarkConfig.load() : window.MadarkConfig;
  if (!C) return;

  /* ---------- أيقونات مشتركة ---------- */
  var ICO = {
    logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18l-1.5-4.5A2 2 0 0 0 17.56 5H6.44a2 2 0 0 0-1.94 1.5L3 11z"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M2 11h20v4a1 1 0 0 1-1 1h-1"/><path d="M5.5 16.5h13"/></svg>',
    moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    mail: '<svg style="width:17px;height:17px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
    phone: '<svg style="width:17px;height:17px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };

  var SOCIAL = [
    { name: "تويتر", svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 4.01c-1 .49-1.98.69-3 .99-1.03-.94-2.23-1.5-3.66-1.5-1.98 0-3.84 1.61-3.84 3.5 0 .38.04.74.12 1.09C8.17 7.7 4.4 6.13 2.12 3.51c-.36.62-.53 1.31-.53 2.07 0 1.43.73 2.69 1.84 3.43-.67-.02-1.31-.21-1.86-.52v.04c0 2 1.42 3.67 3.31 4.05-.35.09-.71.14-1.09.14-.27 0-.53-.03-.78-.08.53 1.65 2.07 2.85 3.89 2.89-1.42 1.12-3.21 1.78-5.16 1.78-.33 0-.66-.02-.98-.06 1.84 1.18 4.02 1.87 6.36 1.87 7.63 0 11.8-6.32 11.8-11.8 0-.18 0-.36-.01-.53.81-.59 1.51-1.32 2.07-2.15z"/></svg>' },
    { name: "انستغرام", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>' },
    { name: "يوتيوب", svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5s-.23-1.65-.94-2.38c-.9-.94-1.9-.94-2.36-1C16.5 4.06 12 4.06 12 4.06s-4.5 0-7.7.06c-.46.06-1.46.06-2.36 1C1.23 5.85 1 7.5 1 7.5S.75 9.4.75 11.3v1.76c0 1.9.23 3.8.23 3.8s.23 1.65.94 2.38c.9.94 2.07.9 2.6 1 1.87.18 7.48.2 7.48.2s4.5 0 7.7-.06c.46-.06 1.46-.06 2.36-1 .71-.73.94-2.38.94-2.38s.25-1.9.25-3.8v-1.76c0-1.9-.25-3.8-.25-3.8zM9.75 15.5v-6.5l6 3.25-6 3.25z"/></svg>' },
    { name: "لينكدإن", svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>' },
    { name: "واتساب", svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.9-9.89a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.32A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L.07 24l6.3-1.65a11.87 11.87 0 0 0 5.68 1.45c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.47-8.43z"/></svg>' }
  ];

  /* ---------- بناء الهيدر ---------- */
  function renderHeader(activeKey) {
    var navLinks = C.nav.map(function (n) {
      var cls = n.key === activeKey ? ' class="active"' : "";
      return '<a href="' + n.href + '"' + cls + '>' + n.label + "</a>";
    }).join("");

    return '' +
      '<header class="header">' +
      '  <div class="container nav">' +
      '    <a href="' + C.brand.home + '" class="logo">' +
      '      <span class="logo-mark">' + ICO.logo + "</span>" +
      '      <span>' + C.brand.name + "<small>" + C.brand.tagline + "</small></span>" +
      "    </a>" +
      '    <nav class="nav-links" aria-label="القائمة الرئيسية">' + navLinks + "</nav>" +
      '    <div class="nav-actions">' +
      '      <button id="themeToggle" class="icon-btn" aria-label="تبديل الوضع الليلي">' + ICO.moon + ICO.sun + "</button>" +
      '      <a href="auth.html" class="btn btn-ghost btn-sm">تسجيل الدخول</a>' +
      '      <a href="auth.html" class="btn btn-primary btn-sm">انضم الآن مجاناً</a>' +
      '      <button class="icon-btn menu-toggle" aria-label="فتح القائمة" aria-expanded="false">' + ICO.menu + "</button>" +
      "    </div>" +
      "  </div>" +
      "</header>";
  }

  /* ---------- بناء الفوتر ---------- */
  function renderFooter(contactId) {
    var social = SOCIAL.map(function (s) {
      return '<a href="#" aria-label="' + s.name + '">' + s.svg + "</a>";
    }).join("");

    var quick = C.footer.quickLinks.map(function (l) {
      return '<a href="' + l.href + '">' + ICO.chev + l.label + "</a>";
    }).join("");

    var account = C.footer.accountLinks.map(function (l) {
      return '<a href="' + l.href + '">' + ICO.chev + l.label + "</a>";
    }).join("");

    return '' +
      '<footer class="footer"' + (contactId ? ' id="' + contactId + '"' : "") + ">" +
      '  <div class="container">' +
      '    <div class="footer-grid">' +
      "      <div>" +
      '        <a href="' + C.brand.home + '" class="logo">' +
      '          <span class="logo-mark">' + ICO.logo + "</span>" +
      '          <span>' + C.brand.name + "<small>" + C.brand.tagline + "</small></span>" +
      "        </a>" +
      '        <p style="margin-top:16px;max-width:280px;">' + C.footer.blurb + "</p>" +
      '        <div class="f-social">' + social + "</div>" +
      "      </div>" +
      "      <div>" +
      "        <h4>روابط سريعة</h4>" +
      '        <div class="f-links">' + quick + "</div>" +
      "      </div>" +
      "      <div>" +
      "        <h4>حساباتي</h4>" +
      '        <div class="f-links">' + account + "</div>" +
      "      </div>" +
      "      <div>" +
      "        <h4>النشرة البريدية</h4>" +
      "        <p>" + C.footer.newsletterText + "</p>" +
      '        <form class="newsletter">' +
      '          <input type="email" placeholder="بريدك الإلكتروني" required>' +
      '          <button type="submit" class="btn btn-primary btn-sm">اشتراك</button>' +
      "        </form>" +
      '        <div style="margin-top:18px;display:grid;gap:8px;font-size:14px;color:var(--text-muted);">' +
      '          <span style="display:flex;align-items:center;gap:8px;">' + ICO.mail + C.footer.email + "</span>" +
      '          <span style="display:flex;align-items:center;gap:8px;">' + ICO.phone + C.footer.phone + "</span>" +
      "        </div>" +
      "      </div>" +
      "    </div>" +
      '    <div class="footer-bottom">' +
      '      <span>© <span data-year>2026</span> ' + C.footer.copy + "</span>" +
      "      <span>" + C.footer.madeWith + "</span>" +
      "    </div>" +
      "  </div>" +
      "</footer>";
  }

  /* ---------- الحقن في الصفحة ---------- */
  var headerSlot = document.querySelector('[data-slot="header"]');
  if (headerSlot) {
    headerSlot.insertAdjacentHTML("afterbegin", renderHeader(headerSlot.getAttribute("data-active") || ""));
    headerSlot.replaceWith(headerSlot.firstElementChild);
  }

  var footerSlot = document.querySelector('[data-slot="footer"]');
  if (footerSlot) {
    footerSlot.insertAdjacentHTML("afterbegin", renderFooter(footerSlot.getAttribute("data-id") || ""));
    footerSlot.replaceWith(footerSlot.firstElementChild);
  }

  /* ---------- تعبئة الأسعار من الإعدادات ---------- */
  function formatPrice(value) {
    return value.toLocaleString("en-US") + " " + C.currency;
  }

  var priceEls = document.querySelectorAll("[data-price-key]");
  priceEls.forEach(function (el) {
    var key = el.getAttribute("data-price-key");
    var type = el.getAttribute("data-price-type") || "course";
    var pool = type === "plan" ? C.pricing.plans : C.pricing.courses;
    var item = pool[key];
    if (!item) return;

    var html;
    if (item.free) {
      html = "مجاني";
    } else if (type === "plan") {
      html = formatPrice(item.price) + ' <small>/ ' + (item.period || "شهرياً") + "</small>";
    } else {
      html = formatPrice(item.price);
      if (item.oldPrice) html += " <small>" + formatPrice(item.oldPrice) + "</small>";
    }
    el.innerHTML = html;
  });

  /* ---------- تحديث سنة الفوتر ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
