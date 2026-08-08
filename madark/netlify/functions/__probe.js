exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, who: "madark-probe" }),
    headers: { "Content-Type": "application/json" }
  };
};