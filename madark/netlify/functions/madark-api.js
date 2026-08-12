/* ============================================
   مدارك — واجهة خلفية مشتركة (Netlify Function)
   حسابات حقيقية (بريد إلكتروني أو جوال سعودي + OTP)
   + جلسات محجوزة + سجل مراجعة المالك.
   التخزين عبر Netlify Blobs. كلمات المرور مخزنة
   مشفرة (scrypt + salt).

   بيئة اختيارية:
   - MADARK_OWNER_EMAIL / MADARK_OWNER_PASSWORD
     لتأمين دخول المالك (بدونها يُستخدم الافتراضي).
   - TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM
     لإرسال رمز OTP عبر Twilio. في غيابها تعمل الوضع
     التجريبي: يظهر الرمز في استجابة sendOtp.
   ============================================ */

const crypto = require("crypto");

let getStore = null;
try {
  getStore = require("@netlify/blobs").getStore;
} catch (e) {
  getStore = null;
}

const STORE_NAME = "madark-data";
const OWNER_EMAIL = process.env.MADARK_OWNER_EMAIL || "admin@madark.edu";
const OWNER_PASSWORD = process.env.MADARK_OWNER_PASSWORD || "madark2026";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_FROM || "";

const OTP_TTL = 5 * 60 * 1000;      /* صلاحية الرمز */
const OTP_RESEND = 60 * 1000;       /* مهلة إعادة الإرسال */
const VERIFY_TTL = 15 * 60 * 1000;  /* صلاحية التحقق قبل التسجيل */

function send(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store"
    }
  };
}
const ok = (body) => send(200, Object.assign({ ok: true }, body));
const fail = (message) => send(400, { ok: false, error: message });

function newSalt() { return crypto.randomBytes(16).toString("hex"); }
function hashPassword(pw, s) { return crypto.scryptSync(String(pw), s, 64).toString("hex"); }
function verifyPassword(pw, s, h) {
  try {
    const a = Buffer.from(h, "hex");
    const b = Buffer.from(hashPassword(pw, s), "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) { return false; }
}
function newToken() { return crypto.randomBytes(24).toString("hex"); }
function newOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }

/* تطبيع رقم الجوال السعودي: 05xxxxxxxx / +9665xxxxxxxx → +9665xxxxxxxx */
function normalizePhone(raw) {
  let p = String(raw || "").replace(/[^\d]/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.length === 10 && p.startsWith("05")) p = "966" + p.slice(1);
  else if (p.length === 9 && p.startsWith("5")) p = "966" + p;
  if (!/^9665\d{8}$/.test(p)) return "";
  return "+" + p;
}

async function sendSms(to, text) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return { demo: true };
  const auth = "Basic " + Buffer.from(TWILIO_SID + ":" + TWILIO_TOKEN).toString("base64");
  const body = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: text });
  const res = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json", {
    method: "POST",
    headers: { "Authorization": auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!res.ok) throw new Error("Twilio HTTP " + res.status);
  return {};
}

async function readJSON(store, key, fallback) {
  try {
    const raw = await store.get(key);
    if (raw == null) return fallback;
    let text;
    if (typeof raw === "string") text = raw;
    else if (typeof raw === "object" && raw.arrayBuffer) text = Buffer.from(await raw.arrayBuffer()).toString("utf8");
    else if (Buffer.isBuffer(raw)) text = raw.toString("utf8");
    else text = String(raw);
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

function publicUser(a) {
  return {
    id: a.id,
    name: a.name,
    email: a.email || "",
    phone: a.phone || "",
    role: a.role,
    status: a.status,
    provider: a.provider,
    certName: a.certName || "",
    createdAt: a.createdAt
  };
}
function ownerUser(a) {
  const u = publicUser(a);
  if (a.role === "teacher") u.certData = a.certData || "";
  return u;
}
async function identityForToken(store, token) {
  if (!token) return null;
  const sessions = await readJSON(store, "sessions.json", {});
  const s = sessions[token];
  return s ? s.identity : null;
}
async function accountByIdentity(store, identity) {
  if (!identity) return null;
  const accounts = await readJSON(store, "accounts.json", []);
  return accounts.find((a) => a.email === identity || a.phone === identity) || null;
}
async function ownerTokenOk(store, token) {
  if (!token) return false;
  const os = await readJSON(store, "owner-sessions.json", {});
  return !!os[token];
}
async function userBookings(store, identity) {
  const bookings = await readJSON(store, "bookings.json", []);
  return bookings.filter((b) => b.email === identity);
}

exports.handler = async function (event) {
  try {
    return await route(event);
  } catch (err) {
    return fail("خطأ في الخادم: " + String((err && err.message) || err));
  }
};

async function openStore() {
  try { return await getStore({ name: STORE_NAME }); } catch (e) { return null; }
}
function storeErr() {
  try {
    getStore({ name: STORE_NAME });
  } catch (e) {
    return String((e && e.message) || e);
  }
  return "";
}

async function route(event) {
  if (event.httpMethod === "OPTIONS") return send(204, {});
  if (event.httpMethod !== "POST") return fail("Method not allowed");

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (e) { return fail("Bad JSON"); }
  const action = body.action;
  if (!action) return fail("Missing action");

  const store = await openStore();
  const norm = (s) => String(s || "").trim().toLowerCase();

  if (!store) {
    return action === "ping"
      ? ok({site: "madark", store: STORE_NAME, demo: true, error: "التخزين السحابي غير متاح", detail: storeErr()})
      : fail("التخزين السحابي غير متاح (Netlify Blobs) — فعّله من إعدادات الموقع ثم أعد الرفع");
  }

  switch (action) {

    case "ping":
      return ok({ site: "madark", store: STORE_NAME });

    case "sendOtp": {
      const phone = normalizePhone(body.phone);
      if (!phone) return fail("رقم جوال سعودي غير صحيح (مثال: 05xxxxxxxx)");
      const accounts = await readJSON(store, "accounts.json", []);
      if (accounts.some((a) => a.phone === phone)) return fail("هذا الرقم مسجل مسبقاً — سجّل دخولك");
      const otps = await readJSON(store, "otps.json", {});
      const key = "phone:" + phone;
      const prev = otps[key];
      if (prev && Date.now() - prev.createdAt < OTP_RESEND) return fail("انتظر دقيقة قبل إعادة إرسال الرمز");
      const code = newOtp();
      otps[key] = { code, createdAt: Date.now() };
      await store.set("otps.json", JSON.stringify(otps));
      let sent = {};
      try {
        sent = await sendSms(phone, "رمز التحقق الخاص بك في مدارك هو: " + code);
      } catch (e) {
        return fail("تعذر إرسال الرسالة — تأكد من إعدادات Twilio");
      }
      if (sent.demo) return ok({ phone, demo: true, code });
      return ok({ phone });
    }

    case "verifyOtp": {
      const phone = normalizePhone(body.phone);
      const code = String(body.code || "").trim();
      if (!phone) return fail("رقم جوال سعودي غير صحيح");
      const otps = await readJSON(store, "otps.json", {});
      const key = "phone:" + phone;
      const rec = otps[key];
      if (!rec) return fail("لم يُرسل رمز لهذا الرقم بعد");
      if (Date.now() - rec.createdAt > OTP_TTL) {
        delete otps[key];
        await store.set("otps.json", JSON.stringify(otps));
        return fail("انتهت صلاحية الرمز — أعد إرساله");
      }
      if (String(rec.code) !== code) return fail("رمز التحقق غير صحيح");
      delete otps[key];
      await store.set("otps.json", JSON.stringify(otps));
      const verifs = await readJSON(store, "verifications.json", {});
      verifs[phone] = { createdAt: Date.now() };
      await store.set("verifications.json", JSON.stringify(verifs));
      return ok({ phone });
    }

    case "signup": {
      const name = String(body.name || "").trim();
      const email = norm(body.email);
      const password = String(body.password || "");
      const role = body.role === "teacher" ? "teacher" : "student";
      const phone = body.phone ? normalizePhone(body.phone) : "";
      if (!name) return fail("الاسم مطلوب");
      if (password.length < 6) return fail("كلمة المرور قصيرة جداً (6 أحرف على الأقل)");
      if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("بريد إلكتروني غير صحيح");
      } else if (phone) {
        const verifs = await readJSON(store, "verifications.json", {});
        const v = verifs[phone];
        if (!v || Date.now() - v.createdAt > VERIFY_TTL) return fail("يجب التحقق من رقم الجوال برمز OTP أولاً");
        delete verifs[phone];
        await store.set("verifications.json", JSON.stringify(verifs));
      } else {
        return fail("أدخل البريد الإلكتروني أو رقم الجوال");
      }
      const accounts = await readJSON(store, "accounts.json", []);
      if (accounts.some((a) => (email && a.email === email) || (phone && a.phone === phone))) {
        return fail("البريد الإلكتروني أو رقم الجوال مسجل مسبقاً");
      }
      const certName = String(body.certName || "").trim();
      const certData = String(body.certData || "").trim();
      if (role === "teacher" && !certName && !certData) {
        return fail("يرجى إرفاق شهادة التخصص (صورة أو PDF) للموافقة على تسجيلك كمعلم");
      }
      const s = newSalt();
      const account = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        salt: s,
        hash: hashPassword(password, s),
        role,
        status: role === "teacher" ? "pending" : "active",
        provider: phone ? "phone" : "email",
        certName,
        certData: role === "teacher" ? certData : "",
        createdAt: new Date().toISOString()
      };
      accounts.push(account);
      await store.set("accounts.json", JSON.stringify(accounts));
      const t = newToken();
      const sessions = await readJSON(store, "sessions.json", {});
      sessions[t] = { identity: account.email || account.phone, createdAt: Date.now() };
      await store.set("sessions.json", JSON.stringify(sessions));
      return ok({ token: t, user: publicUser(account), bookings: [] });
    }

    case "login": {
      const idInput = String(body.identifier || body.email || "").trim();
      const password = String(body.password || "");
      const byEmail = norm(idInput);
      const byPhone = normalizePhone(idInput);
      const accounts = await readJSON(store, "accounts.json", []);
      const acc = accounts.find((a) => (byEmail && a.email === byEmail) || (byPhone && a.phone === byPhone));
      if (!acc || !verifyPassword(password, acc.salt, acc.hash)) return fail("بيانات الدخول غير صحيحة");
      if (acc.role === "teacher" && acc.status === "pending") return fail("حسابك قيد المراجعة — بانتظار موافقة إدارة المنصة");
      if (acc.role === "teacher" && acc.status === "rejected") return fail("عذراً، تم رفض طلبك من قبل الإدارة");
      const t = newToken();
      const sessions = await readJSON(store, "sessions.json", {});
      sessions[t] = { identity: acc.email || acc.phone, createdAt: Date.now() };
      await store.set("sessions.json", JSON.stringify(sessions));
      const bookings = await userBookings(store, acc.email || acc.phone);
      return ok({ token: t, user: publicUser(acc), bookings });
    }

    case "me": {
      const identity = await identityForToken(store, body.token);
      if (!identity) return fail("الجلسة منتهية — سجّل دخولك مجدداً");
      const acc = await accountByIdentity(store, identity);
      if (!acc) return fail("الحساب غير موجود");
      const bookings = await userBookings(store, identity);
      return ok({ user: publicUser(acc), bookings });
    }

    case "logout": {
      const sessions = await readJSON(store, "sessions.json", {});
      delete sessions[body.token];
      await store.set("sessions.json", JSON.stringify(sessions));
      return ok({});
    }

    case "book": {
      const identity = await identityForToken(store, body.token);
      if (!identity) return fail("الجلسة منتهية — سجّل دخولك مجدداً");
      const acc = await accountByIdentity(store, identity);
      const b = body.booking || {};
      const record = {
        id: crypto.randomUUID(),
        email: identity,
        name: b.name || (acc && acc.name) || "",
        teacher: b.teacher || "",
        date: b.date || "",
        time: b.time || "",
        type: b.type === "group" ? "group" : "individual",
        at: b.at || new Date().toISOString()
      };
      const bookings = await readJSON(store, "bookings.json", []);
      bookings.push(record);
      await store.set("bookings.json", JSON.stringify(bookings));
      return ok({ booking: record });
    }

    case "ownerLogin": {
      const email = norm(body.email);
      const password = String(body.password || "");
      if (email !== OWNER_EMAIL || password !== OWNER_PASSWORD) return fail("بيانات المالك غير صحيحة");
      const t = newToken();
      const os = await readJSON(store, "owner-sessions.json", {});
      os[t] = { createdAt: Date.now() };
      await store.set("owner-sessions.json", JSON.stringify(os));
      return ok({ ownerToken: t });
    }

    case "ownerReport": {
      if (!(await ownerTokenOk(store, body.token))) return fail("غير مصرح — سجّل دخول المالك أولاً");
      const users = await readJSON(store, "accounts.json", []);
      const bookings = await readJSON(store, "bookings.json", []);
      return ok({ users: users.map(ownerUser), bookings });
    }

    case "approveTeacher": {
      if (!(await ownerTokenOk(store, body.token))) return fail("غير مصرح — سجّل دخول المالك أولاً");
      const email = norm(body.email);
      const phone = normalizePhone(body.phone || body.email);
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : null;
      if (!email && !phone) return fail("بيانات غير صحيحة");
      if (!status) return fail("بيانات غير صحيحة");
      const accounts = await readJSON(store, "accounts.json", []);
      const acc = accounts.find((a) => (email && a.email === email) || (phone && a.phone === phone));
      if (!acc) return fail("الحساب غير موجود");
      acc.status = status;
      await store.set("accounts.json", JSON.stringify(accounts));
      return ok({ user: publicUser(acc) });
    }

    default:
      return fail("إجراء غير معروف");
  }
}
