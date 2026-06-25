/* =========================================================
   Netlify Function — OPTIONAL AI clinical-narrative parser.
   ---------------------------------------------------------
   Turns a free-text clinical picture into a structured list
   of problems for the Encounter coder. Used only as an
   enhancement: if no key is set the front-end falls back to
   its built-in rule-based parser, so the feature still works.

   SET THIS ENV VAR IN NETLIFY to enable the AI layer:
     OPENAI_API_KEY      your OpenAI API key
     OPENAI_MODEL        (optional) default: gpt-4o-mini

   Endpoints (/.netlify/functions/icd-parse):
     ?ping=1             → { openai: true|false }
     POST { text }       → { problems: [ {term,course,laterality,severity} ], source:"openai" }
   ========================================================= */

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept"
};

function hasKey() { return Boolean(process.env.OPENAI_API_KEY); }

function reply(statusCode, obj, noStore) {
  return {
    statusCode: statusCode,
    headers: Object.assign(
      { "Content-Type": "application/json", "Cache-Control": noStore ? "no-store" : "no-store" },
      CORS
    ),
    body: JSON.stringify(obj)
  };
}

const SYSTEM = [
  "You are a clinical coding assistant. Extract the distinct active problems from a",
  "doctor's free-text clinical picture so they can be coded in ICD-11.",
  "Return STRICT JSON only: {\"problems\":[{\"term\":string,\"course\":string,",
  "\"laterality\":string|null,\"severity\":string|null}]}.",
  "Rules:",
  "- term: the diagnosis in plain clinical English, expanded from abbreviations",
  "  (T2DM -> type 2 diabetes mellitus, HTN -> hypertension, AKI -> acute kidney injury).",
  "  Do NOT include severity/laterality/course words in term.",
  "- Split comorbidities into separate problems (e.g. 'fibroids with anaemia' -> two).",
  "- course: one of Admitted for, Active, Stable, Improving, Worsening, Uncontrolled, Resolving.",
  "- laterality: one of XK8G (left), XK9K (right), XK70 (bilateral), or null.",
  "- severity: one of XS5W (mild), XS0T (moderate), XS25 (severe), or null.",
  "Only set laterality/severity when clearly stated."
].join(" ");

async function callOpenAI(text) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text }
      ]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(function () { return ""; });
    throw new Error("openai:" + res.status + ":" + detail.slice(0, 160));
  }
  const data = await res.json();
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  const parsed = JSON.parse(content || "{}");
  const problems = Array.isArray(parsed.problems) ? parsed.problems : [];
  return problems
    .filter(function (p) { return p && p.term; })
    .map(function (p) {
      return {
        term: String(p.term).trim(),
        course: p.course || "Active",
        laterality: p.laterality || null,
        severity: p.severity || null
      };
    });
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };

  const params = event.queryStringParameters || {};
  if (params.ping) return reply(200, { openai: hasKey(), model: hasKey() ? MODEL : null }, true);

  if (!hasKey()) return reply(503, { error: "no-openai-key", configured: false });

  let text = "";
  try { text = (JSON.parse(event.body || "{}").text || "").trim(); } catch (e) { text = ""; }
  if (!text) return reply(200, { problems: [], source: "openai" });

  try {
    const problems = await callOpenAI(text);
    return reply(200, { problems: problems, source: "openai" });
  } catch (err) {
    return reply(502, { error: err.message, source: "openai" });
  }
};
