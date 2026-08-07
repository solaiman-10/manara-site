/* ============================================
   Madark — إنشاء عملية دفع عبر Tap Payments
   Netlify Function: المفتاح السري يُقرأ من
   متغيرات البيئة ولا يُنشر في أي ملف أمامي.
   الأسعار تُقرأ من خادم هنا (وليس من المتصفح)
   حتى لا يمكن لأي زائر تغيير السعر.
   ============================================ */

const TAP_API = "https://api.tap.company/v2";

/* أسعار موثوقة من الخادم — حدّثها عند تغيير الأسعار */
const PRICES = {
  course: {
    math: 299, python: 0, ai: 449, physics: 349, english: 259,
    webdev: 499, chemistry: 279, leadership: 199, data: 429
  },
  plan: { starter: 0, pro: 59, teacher: 199 }
};

exports.handler = async function (event) {
  const secretKey = process.env.TAP_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "TAP_SECRET_KEY غير مضبوط في متغيرات بيئة Netlify" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: "طلب غير صالح" }) }; }

  const type = body.type || "course";
  const key = body.key;
  const expectedPrice = PRICES[type] && PRICES[type][key];
  if (expectedPrice === undefined) {
    return { statusCode: 400, body: JSON.stringify({ error: "عنصر غير موجود" }) };
  }
  if (expectedPrice <= 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "هذا العنصر مجاني" }) };
  }

  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (amount !== expectedPrice) {
    return { statusCode: 400, body: JSON.stringify({ error: "تلاعب في السعر مرفوض" }) };
  }

  const siteUrl = (body.siteUrl || process.env.URL || "https://madark.edu").replace(/\/+$/, "");
  const name = body.name || "شراء من منصة Madark";

  const payload = {
    amount: amount,
    currency: (body.currency || "SAR"),
    description: name,
    customer: {
      first_name: (body.firstName || "زائر").slice(0, 40),
      last_name: (body.lastName || "Madark").slice(0, 40),
      email: (body.email || "guest@madark.edu")
    },
    source: { id: "src_all" },
    redirect: { url: siteUrl + "/payment-result.html" },
    post: { url: siteUrl + "/.netlify/functions/charge-status" },
    threeDSecure: true,
    metadata: { item_type: type, item_key: key }
  };

  try {
    const resp = await fetch(TAP_API + "/charges/", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + secretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: (data && data.message) || "فشل إنشاء الدفع", details: data }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: data.id,
        status: data.status,
        redirectUrl: data.transaction && data.transaction.url
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "خطأ في الاتصال بـ Tap" }) };
  }
};
