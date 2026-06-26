/* =========================================================
   Encounter coder — type a free-text clinical picture (or
   shorthand like "T2DM"); it splits into problems, suggests
   ICD-11 codes as pills you tap to add/remove, then lets you
   add context-aware extension codes (Chapter X) to each picked
   diagnosis to build a post-coordinated cluster. The codes
   (with & between stem and extensions) are written into the
   Diagnosis field.

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
  var selected = [];          // [{ key, pi, code, title, exts:[{cat,label,code}], isQuery }]
  var view = { parsed: [], lists: [] };   // cached so we can re-render on every toggle

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

  /* ---------- extension helpers ---------- */
  // Resolve a bare extension code (e.g. "XK8G") to its {cat,label,code} record.
  function extByCode(code) {
    var all = icd.EXT_CATALOG || [];
    for (var i = 0; i < all.length; i++) if (all[i].code === code) return { cat: all[i].cat, label: all[i].label, code: all[i].code };
    return null;
  }
  function buildCluster(entry) {
    return entry.code + entry.exts.map(function (e) { return " & " + e.code; }).join("");
  }

  /* ---------- selection ---------- */
  function findSel(key) { for (var i = 0; i < selected.length; i++) if (selected[i].key === key) return selected[i]; return null; }
  function removeSel(key) { selected = selected.filter(function (s) { return s.key !== key; }); }

  function toggleCode(pi, c, parsed) {
    var key = pi + ":" + c.code;
    if (findSel(key)) { removeSel(key); draw(); return; }
    // pre-apply any extension the free text already implies (laterality / severity)
    var exts = [];
    var dims = icd.applicableExt(c.title, c.code);
    if (dims.indexOf("laterality") !== -1 && parsed.laterality) { var l = extByCode(parsed.laterality); if (l) exts.push(l); }
    if (dims.indexOf("severity") !== -1 && parsed.severity) { var s = extByCode(parsed.severity); if (s) exts.push(s); }
    selected.push({ key: key, pi: pi, code: c.code, title: c.title, exts: exts, isQuery: false });
    draw();
  }

  function toggleQuery(pi, parsed) {
    var key = "q:" + pi;
    if (findSel(key)) removeSel(key);
    else selected.push({ key: key, pi: pi, code: "", title: parsed.term || parsed.raw, exts: [], isQuery: true });
    draw();
  }

  function toggleExt(entry, catKey, value) {
    var has = entry.exts.some(function (e) { return e.code === value.code; });
    if (has) { entry.exts = entry.exts.filter(function (e) { return e.code !== value.code; }); }
    else {
      entry.exts = entry.exts.filter(function (e) { return e.cat !== catKey; });   // one value per category
      entry.exts.push({ cat: catKey, label: value.label, code: value.code });
    }
    draw();
  }

  /* ---------- render ---------- */
  function renderSuggestions(parsed, lists) {
    view.parsed = parsed; view.lists = lists;
    draw();
  }

  function draw() {
    elSuggestions.innerHTML = "";
    view.parsed.forEach(function (p, i) {
      var cands = view.lists[i] || [];
      var block = document.createElement("div");
      block.className = "enc__sug";

      var head = '<div class="enc__sughead"><b>' + esc(p.term || p.raw) + '</b>';
      if (p.course) head += '<span class="enc__course-badge">' + esc(p.course) + '</span>';
      head += '</div>';
      block.innerHTML = head;

      var pills = document.createElement("div");
      pills.className = "enc__pills";
      cands.forEach(function (c) {
        var key = i + ":" + c.code;
        var pill = document.createElement("button");
        pill.type = "button";
        pill.className = "pill" + (findSel(key) ? " is-picked" : "");
        pill.innerHTML = '<code>' + esc(c.code) + '</code><span>' + esc(c.title) + '</span>';
        pill.addEventListener("click", function () { toggleCode(i, c, p); });
        pills.appendChild(pill);
      });

      // query option — for problems not yet diagnosed
      var qpill = document.createElement("button");
      qpill.type = "button";
      qpill.className = "pill pill--query" + (findSel("q:" + i) ? " is-picked" : "");
      qpill.innerHTML = '<span>⟲ Query — work up</span>';
      qpill.title = "Not yet diagnosed — flag for investigation";
      qpill.addEventListener("click", function () { toggleQuery(i, p); });
      pills.appendChild(qpill);

      block.appendChild(pills);

      // extension picker for each picked code in this problem
      selected.filter(function (s) { return s.pi === i && !s.isQuery; }).forEach(function (entry) {
        block.appendChild(renderExtBox(entry));
      });

      elSuggestions.appendChild(block);
    });
    renderOutput();
  }

  function renderExtBox(entry) {
    var box = document.createElement("div");
    box.className = "enc__extbox";
    box.innerHTML = '<span class="enc__extlabel">Add extensions to <code>' + esc(entry.code) + '</code></span>';
    var cats = icd.suggestExt(entry.title, entry.code);
    cats.forEach(function (catKey) {
      var group = icd.EXT_CATS[catKey];
      if (!group) return;
      var row = document.createElement("div");
      row.className = "extgroup";
      row.innerHTML = '<span class="extgroup__label">' + esc(group.label) + '</span>';
      group.values.forEach(function (v) {
        var on = entry.exts.some(function (e) { return e.code === v.code; });
        var b = document.createElement("button");
        b.type = "button";
        b.className = "rchip" + (on ? " active" : "");
        b.textContent = v.label + " · " + v.code;
        b.addEventListener("click", function () { toggleExt(entry, catKey, v); });
        row.appendChild(b);
      });
      box.appendChild(row);
    });
    return box;
  }

  // Each diagnosis is recorded both ways: the natural-language name as
  // written, and the ICD-11 code / post-coordinated cluster.
  function renderOutput() {
    if (!selected.length) { elOut.innerHTML = '<span class="encout__empty">—</span>'; return; }
    elOut.innerHTML = selected.map(function (s) {
      if (s.isQuery) {
        return '<div class="encout__row encout__row--query"><span class="encout__dx">' + esc(s.title) +
          '</span><span class="encout__q">⟲ Query · for work-up</span></div>';
      }
      var diagTitle = s.title + (s.exts.length ? " — " + s.exts.map(function (e) { return e.label.toLowerCase(); }).join(", ") : "");
      return '<div class="encout__row"><span class="encout__dx">' + esc(diagTitle) +
        '</span><code class="encout__code">' + esc(buildCluster(s)) + '</code></div>';
    }).join("");
  }

  /* ---------- run ---------- */
  function run() {
    var text = (narrative.value || "").trim();
    if (!text) { view = { parsed: [], lists: [] }; elSuggestions.innerHTML = '<p class="enc__hint">Type the clinical picture, then press Suggest.</p>'; return; }
    showStatus("Suggesting…");
    selected = [];
    parseNarrative(text).then(function (parsed) {
      if (!parsed.length) { showStatus(""); elSuggestions.innerHTML = '<p class="enc__hint">Couldn’t identify any problems — try rephrasing.</p>'; return; }
      return Promise.all(parsed.map(function (p) { return getCandidates(p.term || p.raw); }))
        .then(function (lists) { renderSuggestions(parsed, lists); showStatus(""); });
    }).catch(function () {
      showStatus("");
      elSuggestions.innerHTML = '<p class="enc__hint">Something went wrong — please try again.</p>';
    });
  }

  if (elSuggest) elSuggest.addEventListener("click", run);
  narrative.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  });

  var elClear = byId("encClear");
  if (elClear) elClear.addEventListener("click", function () {
    narrative.value = ""; selected = []; view = { parsed: [], lists: [] };
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
