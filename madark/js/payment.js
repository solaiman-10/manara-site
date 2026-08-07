/* ============================================
   مدارك للتدريب والتعليم — صندوق الدفع الإلكتروني
   دفع وهمي للتجربة: الأسعار تُقرأ من إعدادات المالك
   ولا يتم خصم أي مبالغ حقيقية.
   ============================================ */

(function () {
  "use strict";

  var C = window.MadarkConfig && window.MadarkConfig.load ? window.MadarkConfig.load() : window.MadarkConfig;
  if (!C) return;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  /* ---------- بناء هيكل النافذة ---------- */
  var modalMarkup = '' +
    '<div class="pay-modal" id="payModal" aria-hidden="true">' +
    '  <div class="pay-overlay" data-close></div>' +
    '  <div class="pay-box" role="dialog" aria-modal="true" aria-labelledby="payTitle">' +
    '    <button class="pay-close" data-close aria-label="إغلاق">' +
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
    "    </button>" +
    '    <div class="pay-head">' +
    '      <span class="pay-lock">' +
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
    "      </span>" +
    "      <div>" +
    '        <h3 id="payTitle">إتمام الدفع</h3>' +
    '        <p class="pay-sub">' + (C.payment.securedText || "دفع آمن") + "</p>" +
    "      </div>" +
    "    </div>" +

    '    <div class="pay-item">' +
    "      <div>" +
    '        <b class="pay-item-name">—</b>' +
    '        <span class="pay-item-type">—</span>' +
    "      </div>" +
    '      <div class="pay-amount"><span id="payPrice">0</span></div>' +
    "    </div>" +

    '    <div class="pay-methods" id="payMethods"></div>' +

    '    <div class="pay-fields" id="payFields">' +
    "      <label>رقم البطاقة" +
    '        <input type="text" id="payCard" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" autocomplete="off">' +
    "      </label>" +
    '      <div class="pay-row">' +
    "        <label>تاريخ الانتهاء" +
    '          <input type="text" id="payExp" inputmode="numeric" maxlength="5" placeholder="MM/YY" autocomplete="off">' +
    "        </label>" +
    "        <label>رمز التحقق" +
    '          <input type="password" id="payCvv" inputmode="numeric" maxlength="4" placeholder="•••" autocomplete="off">' +
    "        </label>" +
    "      </div>" +
    "      <label>اسم حامل البطاقة" +
    '        <input type="text" id="payName" placeholder="الاسم كما يظهر على البطاقة" autocomplete="off">' +
    "      </label>" +
    "    </div>" +

    '    <button class="btn btn-primary btn-lg btn-block" id="payBtn">' +
    '      <span class="pay-btn-label">ادفع الآن</span>' +
    '      <span class="pay-btn-spin"></span>' +
    "    </button>" +

    '    <div class="pay-success" id="paySuccess">' +
    '      <span class="pay-success-ico">' +
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
    "      </span>" +
    "      <h4></h4>" +
    "      <p></p>" +
    '      <button class="btn btn-primary btn-lg btn-block" data-close>تم</button>' +
    "    </div>" +
    "  </div>" +
    "</div>";

  var modal, methodsWrap, fields, cardInput, expInput, cvvInput, nameInput, btn, btnLabel, successBox;
  var activeKey = null;
  var activeType = "course";
  var selectedMethod = null;

  function methodIcon(id) {
    var icons = {
      mada: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M7 15h3"/></svg>',
      visa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 15.5l1.5-7h3l-1.5 7H5zm6.5 0l2-7h3l-2 7h-3zm7.5-6.5c-1-.5-2.5-.5-3.5 0-1 .5-1 1.5 0 2s3 1 3 2-.5 2-2 2c-.5 0-1 0-1.5-.5l.5-1c.5.5 1 .5 1.5.5.5 0 1-.5 1-1s-.5-1-1.5-1.5c-1-.5-2-1-2-2s.5-2 2-2c.5 0 1 .5 1.5 1l-.5.5z"/></svg>',
      stcpay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 7.07 17.07A10 10 0 0 1 4.93 4.93A9.95 9.95 0 0 1 12 2z"/><path d="M8 12l4-4 4 4M12 8v8"/></svg>',
      applepay: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.54c-.03-2.53 2.07-3.74 2.16-3.8-1.17-1.72-3-1.96-3.65-1.98-1.56-.16-3.04.92-3.83.92-.79 0-2.01-.9-3.3-.87-1.7.02-3.26.99-4.14 2.51-1.77 3.07-.45 7.62 1.27 10.11.84 1.22 1.84 2.59 3.15 2.54 1.26-.05 1.74-.81 3.26-.81s1.95.81 3.29.79c1.36-.03 2.22-1.24 3.06-2.47.96-1.4 1.35-2.77 1.38-2.84-.03-.02-2.65-1.02-2.68-4.04zM14.62 5.46c.7-.85 1.17-2.03 1.04-3.2-1.01.04-2.23.67-2.95 1.51-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.97-1.41z"/></svg>'
    };
    return icons[id] || "";
  }

  function buildMethods() {
    methodsWrap.innerHTML = "";
    (C.payment.methods || []).forEach(function (m) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pay-method" + (selectedMethod === m.id ? " active" : "");
      btn.setAttribute("data-method", m.id);
      btn.innerHTML = '<span class="pay-method-ico">' + methodIcon(m.id) + "</span>" +
        "<span>" +
        "  <b>" + m.label + "</b>" +
        '  <small>' + (m.desc || "") + "</small>" +
        "</span>" +
        '<span class="pay-method-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>';
      btn.addEventListener("click", function () {
        selectedMethod = m.id;
        buildMethods();
        var isCard = m.id === "mada" || m.id === "visa";
        fields.style.display = (C.payment.mode === "live" || !isCard) ? "none" : "";
        btnLabel.textContent = "ادفع الآن" + (C.currency ? "" : "");
        updateBtnLabel();
      });
      methodsWrap.appendChild(btn);
    });
  }

  function updateBtnLabel() {
    var item = getItem();
    if (!item) return;
    if (item.free) { btnLabel.textContent = "اشترك مجاناً"; return; }
    var amount = formatPrice(item.price);
    btnLabel.textContent = "ادفع " + amount;
  }

  function formatPrice(value) {
    return value.toLocaleString("en-US") + " " + C.currency;
  }

  function getItem() {
    if (activeType === "plan") return C.pricing.plans[activeKey];
    return C.pricing.courses[activeKey];
  }

  function openModal(key, type) {
    activeKey = key;
    activeType = type || "course";
    var item = getItem();
    if (!item) return;

    var isPlan = activeType === "plan";
    $(".pay-item-name", modal).textContent = item.name;
    $(".pay-item-type", modal).textContent = isPlan ? "باقة " + (item.period || "") : "كورس تعليمي";

    var priceEl = $("#payPrice", modal);
    if (item.free) {
      priceEl.textContent = "مجاني";
    } else {
      priceEl.innerHTML = formatPrice(item.price);
      if (item.oldPrice) priceEl.innerHTML += ' <small class="pay-old">' + formatPrice(item.oldPrice) + "</small>";
    }

    selectedMethod = C.payment.methods[0] ? C.payment.methods[0].id : null;
    buildMethods();
    fields.style.display = "none";
    ["payCard", "payExp", "payCvv", "payName"].forEach(function (id) {
      var el = $("#" + id, modal);
      if (el) el.value = "";
    });
    successBox.style.display = "none";
    btn.style.display = "";
    btn.disabled = false;
    btn.classList.remove("loading");
    updateBtnLabel();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { (cardInput || nameInput || btn).focus && (cardInput || nameInput).focus(); }, 150);
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function runPayment() {
    var item = getItem();
    if (!item) return;

    if (C.payment.mode === "live") {
      livePayment(item);
      return;
    }

    if (selectedMethod === "mada" || selectedMethod === "visa") {
      var num = cardInput.value.replace(/\s+/g, "");
      if (num.length < 16) { cardInput.focus(); toast("يرجى إدخال رقم بطاقة صحيح (16 رقماً)", "error"); return; }
      if (!/^\d{2}\/\d{2}$/.test(expInput.value)) { expInput.focus(); toast("يرجى إدخال تاريخ انتهاء صحيح MM/YY", "error"); return; }
      if (cvvInput.value.length < 3) { cvvInput.focus(); toast("يرجى إدخال رمز التحقق CVV", "error"); return; }
      if (nameInput.value.trim().length < 3) { nameInput.focus(); toast("يرجى إدخال اسم حامل البطاقة", "error"); return; }
    }

    btn.disabled = true;
    btn.classList.add("loading");
    btnLabel.textContent = C.payment.processingText || "جاري معالجة الدفع...";

    setTimeout(function () {
      btn.classList.remove("loading");
      btn.style.display = "none";
      successBox.style.display = "";
      $("h4", successBox).textContent = C.payment.successTitle || "تم الدفع بنجاح 🎉";
      $("p", successBox).textContent = C.payment.successText || "";
      if (window.MadarkConfig) {
        try { localStorage.setItem("madark-last-purchase", JSON.stringify({ key: activeKey, type: activeType })); } catch (e) {}
      }
    }, 1600);
  }

  /* ---------- دفع حقيقي عبر Tap Payments ---------- */
  function livePayment(item) {
    var tap = C.payment.tap || {};
    var siteUrl = tap.siteUrl || location.origin;
    var amount = item.price;

    btn.disabled = true;
    btn.classList.add("loading");
    btnLabel.textContent = "جاري تجهيز بوابة الدفع الآمنة...";

    fetch("/.netlify/functions/create-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: activeKey,
        type: activeType,
        amount: amount,
        currency: C.payment.currencyIso || "SAR",
        name: item.name,
        siteUrl: siteUrl
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error || !data.redirectUrl) {
        throw new Error(data.error || "تعذر إنشاء عملية الدفع");
      }
      try { localStorage.setItem("madark-last-purchase", JSON.stringify({ key: activeKey, type: activeType })); } catch (e) {}
      window.location.href = data.redirectUrl;
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.classList.remove("loading");
      updateBtnLabel();
      toast(err.message || "تعذر الاتصال ببوابة الدفع", "error");
    });
  }

  function init() {
    modal = document.createElement("div");
    modal.innerHTML = modalMarkup.trim();
    document.body.appendChild(modal.firstElementChild);
    modal = $("#payModal");

    methodsWrap = $("#payMethods", modal);
    fields = $("#payFields", modal);
    cardInput = $("#payCard", modal);
    expInput = $("#payExp", modal);
    cvvInput = $("#payCvv", modal);
    nameInput = $("#payName", modal);
    btn = $("#payBtn", modal);
    btnLabel = $(".pay-btn-label", btn);
    successBox = $("#paySuccess", modal);

    cardInput.addEventListener("input", function () {
      var v = this.value.replace(/[^\d]/g, "").slice(0, 16);
      this.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
    });
    expInput.addEventListener("input", function () {
      var v = this.value.replace(/[^\d]/g, "").slice(0, 4);
      this.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    });
    cvvInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^\d]/g, "").slice(0, 4);
    });

    btn.addEventListener("click", runPayment);

    $$("[data-close]", modal).forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------- ربط أزرار الدفع ---------- */
  function wire() {
    document.addEventListener("click", function (e) {
      var payBtn = e.target.closest("[data-pay]");
      if (payBtn) {
        var key = payBtn.getAttribute("data-pay");
        var type = payBtn.getAttribute("data-pay-type") || "course";
        var free = payBtn.hasAttribute("data-free");
        if (free) { toast("هذا الكورس مجاني — تم تسجيلك بنجاح 🎉", "success"); return; }
        openModal(key, type);
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn);
  }

  /* إعادة استخدام تنبيهات toast من main.js إن وُجدت، وإلا نسخة محلية */
  function toast(msg, type) {
    if (window.toast) { window.toast(msg, type); return; }
    var box = $("#toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-box";
      Object.assign(box.style, { position: "fixed", bottom: "24px", right: "24px", zIndex: "99999", display: "flex", flexDirection: "column", gap: "10px" });
      document.body.appendChild(box);
    }
    var el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = "background:" + (type === "error" ? "#ef4444" : "#10b981") + ";color:#fff;padding:14px 22px;border-radius:12px;font-weight:700;font-size:14px;direction:rtl;box-shadow:0 10px 30px rgba(0,0,0,.2);";
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  ready(function () {
    init();
    wire();
  });
})();
