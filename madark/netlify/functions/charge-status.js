/* ============================================
   مدارك — التحقق من حالة الدفع عبر Tap Payments
   يُستدعى بعد عودة العميل من صفحة Tap
   (GET مع charge_id في الرابط) أو كـ webhook
   (POST من Tap) للتأكد من أن الدفع مكتمل.
   ============================================ */

const TAP_API = "https://api.tap.company/v2";

exports.handler = async function (event) {
  const secretKey = process.env.TAP_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "TAP_SECRET_KEY غير مضبوط" }) };
  }

  let chargeId = null;

  if (event.httpMethod === "GET") {
    chargeId = (event.queryStringParameters && (event.queryStringParameters.charge_id || event.queryStringParameters.id)) || null;
  } else if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      chargeId = body.id || (body.object && body.object.id) || null;
    } catch (e) { /* تجاهل */ }
  }

  if (!chargeId) {
    return { statusCode: 400, body: JSON.stringify({ error: "charge_id مطلوب" }) };
  }

  try {
    const resp = await fetch(TAP_API + "/charges/" + chargeId, {
      method: "GET",
      headers: { "Authorization": "Bearer " + secretKey }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: "تعذر التحقق من الدفع" }) };
    }

    const paid = data.status === "CAPTURED" || data.status === "AUTHORIZED";
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: data.id,
        status: data.status,
        paid: paid,
        amount: data.amount,
        currency: data.currency,
        message: data.response && data.response.message
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "خطأ في الاتصال بـ Tap" }) };
  }
};
