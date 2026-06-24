/* =========================================================
   Netlify Function — WHO ICD-11 API proxy (MMS search)
   ---------------------------------------------------------
   The WHO ICD-11 API uses OAuth2 client-credentials, whose
   secret must stay server-side. This function holds the
   secret, fetches a token (cached), and proxies search
   queries to the WHO ICD-11 MMS classification.

   SET THESE ENV VARS IN NETLIFY (Site settings → Environment):
     WHO_CLIENT_ID       your ICD-API client id        (required)
     WHO_CLIENT_SECRET   your ICD-API client secret    (required)
     WHO_ICD_RELEASE     (optional) MMS release, e.g. 2024-01

   Register for free credentials at: https://icd.who.int/icdapi

   Endpoints (all under /.netlify/functions/icd-search):
     ?q=malaria   → search; returns { results:[...], source:"who" }
     ?ping=1      → health check; returns { configured:true|false }
   ========================================================= */

const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";
const RELEASE = process.env.WHO_ICD_RELEASE || "2024-01";
const SEARCH_URL = "https://id.who.int/icd/release/11/" + RELEASE + "/mms/search";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept"
};

let cachedToken = null;
let tokenExpiry = 0;

function hasCredentials() {
  return Boolean(process.env.WHO_CLIENT_ID && process.env.WHO_CLIENT_SECRET);
}

async function getToken() {
  const id = process.env.WHO_CLIENT_ID;
  const secret = process.env.WHO_CLIENT_SECRET;
  if (!id || !secret) throw new Error("missing-credentials");

  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) return cachedToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "icdapi_access",
    client_id: id,
    client_secret: secret
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!res.ok) throw new Error("token-failed:" + res.status);
  const json = await res.json();
  cachedToken = json.access_token;
  tokenExpiry = now + (json.expires_in || 3600) * 1000;
  return cachedToken;
}

function strip(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* WHO flat results expose the chapter as a number/string; turn it
   into a readable label, falling back to a generic one. */
function chapterLabel(entity) {
  const c = entity.chapter || entity.chapterCode;
  if (!c) return "ICD-11 MMS";
  return "Chapter " + String(c);
}

function reply(statusCode, obj, extraHeaders) {
  return {
    statusCode: statusCode,
    headers: Object.assign(
      { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
      CORS,
      extraHeaders || {}
    ),
    body: JSON.stringify(obj)
  };
}

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const params = event.queryStringParameters || {};

  // Health check — lets the front-end show an accurate "live vs sample" status
  // without burning a search, and without leaking whether the credentials work.
  if (params.ping) {
    return reply(200, { configured: hasCredentials(), release: RELEASE }, { "Cache-Control": "no-store" });
  }

  const q = (params.q || "").trim();
  if (!q) return reply(200, { results: [], source: "who" });

  if (!hasCredentials()) {
    return reply(503, { error: "missing-credentials", source: "none", configured: false });
  }

  try {
    const token = await getToken();
    const url = SEARCH_URL + "?q=" + encodeURIComponent(q) + "&flatResults=true&useFlexisearch=true";
    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
        "Accept-Language": "en",
        "API-Version": "v2"
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(function () { return ""; });
      return reply(502, { error: "who-api:" + res.status, detail: strip(text).slice(0, 200), source: "who" });
    }

    const data = await res.json();
    const results = (data.destinationEntities || [])
      .filter(function (e) { return e.theCode; })
      .slice(0, 12)
      .map(function (e) {
        return {
          code: e.theCode,
          title: strip(e.title),
          chapter: chapterLabel(e)
        };
      });
    return reply(200, { results: results, source: "who", configured: true });
  } catch (err) {
    const code = err.message === "missing-credentials" ? 503 : 502;
    return reply(code, { error: err.message, source: "none", configured: hasCredentials() });
  }
};
