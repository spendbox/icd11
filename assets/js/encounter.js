/* =========================================================
   Encounter coder — type a free-text clinical picture (or
   shorthand like "T2DM"); it splits into problems, suggests
   ICD-11 clusters as pills you tap to add/remove, and writes
   the codes (with & for post-coordination) into the Diagnosis
   field. Assessment is a separate, free-text field.

   Parsing: optional OpenAI layer (/.netlify/functions/icd-parse)
   when a key is set, else a built-in rule-based parser.
   Codes: WHO ICD-11 API (/.netlify/functions/icd-search) when
   configured, else the built-in sample dataset.
   ========================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var icd = window.ICD11;
  var narrative = byId("encNarrative");
  if (!icd || !narrative) return;

  var elSuggest = byId("encSuggest");
  var elSuggestions = byId("encSuggestions");
  var elOut = byId("encOut");
  var elStatus = byId("encStatus");
  var elExamples = byId("encExamples");

  var apiConfigured = null;   // WHO search proxy
  var aiAvailable = null;     // OpenAI parse function
  var selected = [];          // [{ id, code, title, cluster, isQuery }]

  var EXAMPLES = [
    "symptomatic uterine fibroids with anaemia, uncontrolled HTN, T2DM",
    "severe falciparum malaria with AKI",
    "left forearm fracture, mild pneumonia"
  ];

  function showStatus(text) {
    if (!elStatus) return;
    if (!text) { elStatus.hidden = true; elStatus.textContent = ""; return; }
    elStatus.hidden = false;
    elStatus.className = "coder__status is-searching";
    elStatus.innerHTML = '<span class="dotpulse"></span> ' + esc(text);
  }

  /* ---------- probes ---------- */
  function probe(url) {
    return fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
  }
  Promise.all([
    probe("/.netlify/functions/icd-search?ping=1"),
    probe("/.netlify/functions/icd-parse?ping=1")
  ]).then(function (res) {
    apiConfigured = !!(res[0] && res[0].configured);
    aiAvailable = !!(res[1] && res[1].openai);
  });

  /* ---------- rule-based parsing ---------- */
  var COURSE_RULES = [
    [/\b(uncontrolled|poorly controlled|out of control)\b/i, "Uncontrolled"],
    [/\b(improving|recovering|better)\b/i, "Improving"],
    [/\b(worsening|deteriorating|progressing)\b/i, "Worsening"],
    [/\b(resolv(ing|ed)|settling)\b/i, "Resolving"],
    [/\b(stable|controlled|well controlled)\b/i, "Stable"],
    [/\b(admitted for|presenting with|admission)\b/i, "Admitted for"]
  ];
  function detectCourse(s) {
    for (var i = 0; i < COURSE_RULES.length; i++) if (COURSE_RULES[i][0].test(s)) return COURSE_RULES[i][1];
    return "";
  }
  function detectLaterality(s) {
    if (/\bbilateral\b/i.test(s)) return "XK70";
    if (/\bleft\b/i.test(s)) return "XK8G";
    if (/\bright\b/i.test(s)) return "XK9K";
    return null;
  }
  function detectSeverity(s) {
    if (/\bsevere\b/i.test(s)) return "XS25";
    if (/\bmoderate\b/i.test(s)) return "XS0T";
    if (/\bmild\b/i.test(s)) return "XS5W";
    return null;
  }
  var NOISE_RE = /\b(uncontrolled|poorly controlled|well controlled|controlled|improving|recovering|worsening|deteriorating|progressing|resolving|resolved|settling|stable|admitted for|presenting with|admission|newly diagnosed|new|first episode|symptomatic|known|chronic|acute|severe|moderate|mild|left|right|bilateral|of)\b/gi;
  function cleanTerm(s) { return s.replace(NOISE_RE, " ").replace(/\s+/g, " ").trim(); }

  function ruleParse(text) {
    var parts = text.split(/[,;\n]|\band\b|\bwith\b|\bplus\b|\+|&/i);
    return parts.map(function (p) { return p.trim(); }).filter(Boolean).map(function (clause) {
      return { raw: clause, term: cleanTerm(clause) || clause, course: detectCourse(clause),
        laterality: detectLaterality(clause), severity: detectSeverity(clause) };
    });
  }

  function aiParse(text) {
    return fetch("/.netlify/functions/icd-parse", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ text: text })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.problems || !j.problems.length) return null;
        return j.problems.map(function (p) {
          return { raw: p.term || "", term: p.term || "", course: p.course || "",
            laterality: p.laterality || null, severity: p.severity || null };
        });
      }).catch(function () { return null; });
  }

  function parseNarrative(text) {
    if (aiAvailable) return aiParse(text).then(function (ai) { return ai || ruleParse(text); });
    return Promise.resolve(ruleParse(text));
  }

  /* ---------- candidate lookup ---------- */
  function getCandidates(term) {
    var local = icd.search(term).slice(0, 4);
    var abbr = icd.expandAbbrev(term);
    function withAbbr(list) {
      if (!abbr) return list;
      return list.some(function (x) { return x.code === abbr.code; }) ? list : [abbr].concat(list);
    }
    if (apiConfigured === false) return Promise.resolve(withAbbr(local).slice(0, 4));
    return fetch("/.netlify/functions/icd-search?q=" + encodeURIComponent(term), { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.results && res.j.results.length) { apiConfigured = true; return withAbbr(res.j.results.slice(0, 4)); }
        if (res.j && res.j.configured === false) apiConfigured = false;
        return withAbbr(local).slice(0, 4);
      }).catch(function () { apiConfigured = false; return withAbbr(local).slice(0, 4); });
  }

  /* ---------- cluster building ---------- */
  function clusterFor(item, parsed) {
    var dims = icd.applicableExt(item.title, item.code);
    var exts = [];
    function ext(key, code) {
      var g = icd.EXT[key]; if (!g) return;
      g.options.forEach(function (o) { if (o.ext === code) exts.push(o.ext); });
    }
    if (dims.indexOf("laterality") !== -1 && parsed.laterality) ext("laterality", parsed.laterality);
    if (dims.indexOf("severity") !== -1 && parsed.severity) ext("severity", parsed.severity);
    return item.code + exts.map(function (e) { return " & " + e; }).join("");
  }

  /* ---------- selection ---------- */
  function isSel(id) { return selected.some(function (s) { return s.id === id; }); }
  function toggle(entry) {
    if (isSel(entry.id)) selected = selected.filter(function (s) { return s.id !== entry.id; });
    else selected.push(entry);
    renderSuggestionsState(); renderOutput();
  }

  /* ---------- render suggestions ---------- */
  function renderSuggestions(parsed, lists) {
    elSuggestions.innerHTML = "";
    parsed.forEach(function (p, i) {
      var cands = lists[i] || [];
      var block = document.createElement("div");
      block.className = "enc__sug";
      var head = '<div class="enc__sughead"><b>' + esc(p.term || p.raw) + '</b>';
      if (p.course) head += '<span class="enc__course-badge">' + esc(p.course) + '</span>';
      head += '</div>';
      block.innerHTML = head;

      var pills = document.createElement("div");
      pills.className = "enc__pills";
      cands.forEach(function (c) {
        var cluster = clusterFor(c, p);
        var entry = { id: cluster, code: c.code, title: c.title, cluster: cluster, isQuery: false };
        var pill = document.createElement("button");
        pill.type = "button";
        pill.className = "pill" + (isSel(entry.id) ? " is-picked" : "");
        pill.dataset.id = entry.id;
        pill.innerHTML = '<code>' + esc(cluster) + '</code><span>' + esc(c.title) + '</span>';
        pill.addEventListener("click", function () { toggle(entry); });
        pills.appendChild(pill);
      });

      // query option — for problems not yet diagnosed
      var qid = "q:" + (p.term || p.raw);
      var q = { id: qid, code: "", title: p.term || p.raw, cluster: "", isQuery: true };
      var qpill = document.createElement("button");
      qpill.type = "button";
      qpill.className = "pill pill--query" + (isSel(qid) ? " is-picked" : "");
      qpill.dataset.id = qid;
      qpill.innerHTML = '<span>⟲ Query — work up</span>';
      qpill.title = "Not yet diagnosed — flag for investigation";
      qpill.addEventListener("click", function () { toggle(q); });
      pills.appendChild(qpill);

      block.appendChild(pills);
      elSuggestions.appendChild(block);
    });
  }

  // sync only the picked state (no full rebuild) when toggling
  function renderSuggestionsState() {
    var pills = elSuggestions.querySelectorAll(".pill");
    Array.prototype.forEach.call(pills, function (pill) {
      pill.classList.toggle("is-picked", isSel(pill.dataset.id));
    });
  }

  function renderOutput() {
    if (!selected.length) { elOut.textContent = "—"; return; }
    elOut.textContent = selected.map(function (s) {
      return s.isQuery ? "Query: " + s.title + " (for work-up)" : s.cluster;
    }).join("\n");
  }

  /* ---------- run ---------- */
  function run() {
    var text = (narrative.value || "").trim();
    if (!text) { elSuggestions.innerHTML = '<p class="enc__hint">Type the clinical picture, then press Suggest.</p>'; return; }
    showStatus("Suggesting…");
    parseNarrative(text).then(function (parsed) {
      if (!parsed.length) { showStatus(""); elSuggestions.innerHTML = '<p class="enc__hint">Couldn’t identify any problems — try rephrasing.</p>'; return; }
      return Promise.all(parsed.map(function (p) { return getCandidates(p.term || p.raw); }))
        .then(function (lists) { renderSuggestions(parsed, lists); showStatus(""); });
    });
  }

  if (elSuggest) elSuggest.addEventListener("click", run);
  narrative.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  });

  var elClear = byId("encClear");
  if (elClear) elClear.addEventListener("click", function () {
    narrative.value = ""; selected = [];
    elSuggestions.innerHTML = '<p class="enc__hint">Suggestions will appear here once you press Suggest.</p>';
    renderOutput(); showStatus(""); narrative.focus();
  });

  EXAMPLES.forEach(function (ex) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "quickchip";
    b.textContent = ex.length > 38 ? ex.slice(0, 36) + "…" : ex;
    b.title = ex;
    b.addEventListener("click", function () { narrative.value = ex; run(); });
    elExamples.appendChild(b);
  });

  renderOutput();
})();
