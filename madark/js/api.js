/* ============================================
   مدارك — عميل الخادم المشترك (Netlify Function)
   يوفّر:
   - MadarkApi.call(action, payload) → POST إلى
     /.netlify/functions/madark-api
   - إدارة التوكنات والمستخدم والحجوزات في localStorage
   التوكنات: madark-token (مستخدم) / madark-owner-token (مالك)
   ============================================ */

(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/madark-api";
  var TOKEN_KEY = "madark-token";
  var OWNER_KEY = "madark-owner-token";
  var USER_KEY = "madark-user";
  var BOOKINGS_KEY = "madark-bookings";

  function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function lsDel(key) { try { localStorage.removeItem(key); } catch (e) {} }

  function getToken() { return lsGet(TOKEN_KEY) || ""; }
  function setToken(t) { if (t) lsSet(TOKEN_KEY, t); }
  function clearToken() { lsDel(TOKEN_KEY); }

  function getOwnerToken() { return lsGet(OWNER_KEY) || ""; }
  function setOwnerToken(t) { if (t) lsSet(OWNER_KEY, t); }
  function clearOwnerToken() { lsDel(OWNER_KEY); }

  function getUser() { try { return JSON.parse(lsGet(USER_KEY) || "null"); } catch (e) { return null; } }
  function setUser(u) { lsSet(USER_KEY, JSON.stringify(u)); }
  function clearUser() { lsDel(USER_KEY); }

  function getBookings() { try { return JSON.parse(lsGet(BOOKINGS_KEY) || "[]"); } catch (e) { return []; } }
  function setBookings(list) { lsSet(BOOKINGS_KEY, JSON.stringify(list)); }

  /* الإجراءات التي تمرر التوكن يدوياً ولا نحقنه تلقائياً */
  var MANUAL_TOKEN = { login: 1, signup: 1, ownerLogin: 1, ownerReport: 1 };

  function call(action, payload) {
    var body = payload || {};
    body.action = action;
    if (!MANUAL_TOKEN[action] && !body.token && getToken()) body.token = getToken();
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false, error: "خطأ في استجابة الخادم" }; });
    }).catch(function () {
      return { ok: false, error: "network" };
    });
  }

  window.MadarkApi = {
    call: call,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    getOwnerToken: getOwnerToken,
    setOwnerToken: setOwnerToken,
    clearOwnerToken: clearOwnerToken,
    getUser: getUser,
    setUser: setUser,
    clearUser: clearUser,
    getBookings: getBookings,
    setBookings: setBookings
  };
})();
