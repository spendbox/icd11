/* =========================================================
   Netlify Function — WHO ICD-11 API proxy (MMS search)
   ---------------------------------------------------------
   The WHO ICD-11 API uses OAuth2 client-credentials, which
   must stay server-side. This function holds the secret,
   fetches a token (cached), and proxies search queries.

   SET THESE ENV VARS IN NETLIFY (Site settings → Environment):
     WHO_CLIENT_ID       your ICD-API client id
     WHO_CLIENT_SECRET   your ICD-API client secret
     WHO_ICD_RELEASE     (optional) e.g. 2024-01  [default]

   Register for free credentials at: https://icd.who.int/icdapi
   ========================================================= */

const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";
const RELEASE = process.env.WHO_ICD_RELEASE || "2024-01";
const SEARCH_URL = "https://id.who.int/icd/release/11/" + RELEASE + "/mms/search";

let cachedToken = null;
let tokenExpiry = 0;

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
  return (html || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

function reply(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
    body: JSON.stringify(obj)
  };
}

exports.handler = async function (event) {
  const q = ((event.queryStringParameters && event.queryStringParameters.q) || "").trim();
  if (!q) return reply(200, { results: [], source: "who" });

  try {
    const token = await getToken();
    const url = SEARCH_URL + "?q=" + encodeURIComponent(q) + "&flatResults=true";
    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
        "Accept-Language": "en",
        "API-Version": "v2"
      }
    });
    if (!res.ok) return reply(502, { error: "who-api:" + res.status });

    const data = await res.json();
    const results = (data.destinationEntities || [])
      .filter(function (e) { return e.theCode; })
      .slice(0, 10)
      .map(function (e) {
        return {
          code: e.theCode,
          title: strip(e.title),
          chapter: e.chapter ? ("Chapter " + e.chapter) : "ICD-11 MMS"
        };
      });
    return reply(200, { results: results, source: "who" });
  } catch (err) {
    const code = err.message === "missing-credentials" ? 503 : 500;
    return reply(code, { error: err.message, source: "none" });
  }
};
