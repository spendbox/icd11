/* =========================================================
   Encounter coder — type a free-text clinical picture (or
   shorthand like "T2DM"), get suggested ICD-11 clusters as
   pills, pick them into a problem list, and tag each with a
   clinical course (stable / uncontrolled / improving…).

   Parsing:
     1. If an OpenAI key is configured server-side
        (/.netlify/functions/icd-parse), use the AI parser.
     2. Otherwise fall back to a built-in rule-based parser.
   Codes:
     WHO ICD-11 API (/.netlify/functions/icd-search) when
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
  var elList = byId("encList");
  var elOut = byId("encOut");
  var elCount = byId("encCount");
  var elStatus = byId("encStatus");
  var elExamples = byId("encExamples");

  var apiConfigured = null;   // WHO search proxy
  var aiAvailable = null;     // OpenAI parse function
  var problems = [];          // accepted problem list

  var EXAMPLES = [
    "symptomatic uterine fibroids with anaemia, uncontrolled HTN, T2DM",
    "severe falciparum malaria with AKI",
    "left forearm fracture, mild pneumonia"
  ];

  /* ---------- status line ---------- */
  function setStatus(cls, text) {
    if (!elStatus) return;
    elStatus.className = "coder__status " + (cls || "");
    elStatus.innerHTML = '<span class="dotpulse"></span> ' + esc(text);
  }

  /* ---------- probes ---------- */
  function probe(url) {
    return fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }
  Promise.all([
    probe("/.netlify/functions/icd-search?ping=1"),
    probe("/.netlify/functions/icd-parse?ping=1")
  ]).then(function (res) {
    apiConfigured = !!(res[0] && res[0].configured);
    aiAvailable = !!(res[1] && res[1].openai);
  });

  /* ---------- clinical-course & extension detection (rules) ---------- */
  var COURSE_RULES = [
    [/\b(uncontrolled|poorly controlled|out of control)\b/i, "Uncontrolled"],
    [/\b(improving|recovering|better)\b/i, "Improving"],
    [/\b(worsening|deteriorating|progressing)\b/i, "Worsening"],
    [/\b(resolv(ing|ed)|settling)\b/i, "Resolving"],
    [/\b(stable|controlled|well controlled)\b/i, "Stable"],
    [/\b(admitted for|presenting with|admission)\b/i, "Admitted for"],
    [/\b(new(ly diagnosed)?|first episode)\b/i, "Active"]
  ];
  function detectCourse(s) {
    for (var i = 0; i < COURSE_RULES.length; i++) if (COURSE_RULES[i][0].test(s)) return COURSE_RULES[i][1];
    return "Active";
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

  /* strip course/qualifier words so the search term is the diagnosis itself */
  var NOISE_RE = /\b(uncontrolled|poorly controlled|well controlled|controlled|improving|recovering|worsening|deteriorating|progressing|resolving|resolved|settling|stable|admitted for|presenting with|admission|newly diagnosed|new|first episode|symptomatic|known|chronic|acute|severe|moderate|mild|left|right|bilateral|of)\b/gi;
  function cleanTerm(s) {
    return s.replace(NOISE_RE, " ").replace(/\s+/g, " ").trim();
  }

  /* ---------- rule-based splitter ---------- */
  function ruleParse(text) {
    var parts = text.split(/[,;\n]|\band\b|\bwith\b|\bplus\b|\+|&/i);
    return parts.map(function (p) { return p.trim(); }).filter(Boolean).map(function (clause) {
      return {
        raw: clause,
        term: cleanTerm(clause) || clause,
        course: detectCourse(clause),
        laterality: detectLaterality(clause),
        severity: detectSeverity(clause)
      };
    });
  }

  /* ---------- AI parser (optional) ---------- */
  function aiParse(text) {
    return fetch("/.netlify/functions/icd-parse", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ text: text })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.problems || !j.problems.length) return null;
        return j.problems.map(function (p) {
          return {
            raw: p.term || "",
            term: p.term || "",
            course: p.course || "Active",
            laterality: p.laterality || null,
            severity: p.severity || null
          };
        });
      }).catch(function () { return null; });
  }

  function parseNarrative(text) {
    if (aiAvailable) {
      return aiParse(text).then(function (ai) { return ai || ruleParse(text); });
    }
    return Promise.resolve(ruleParse(text));
  }

  /* ---------- candidate lookup (WHO proxy → local fallback) ---------- */
  function getCandidates(term) {
    var local = icd.search(term).slice(0, 4);
    var abbr = icd.expandAbbrev(term);
    function withAbbr(list) {
      if (!abbr) return list;
      var has = list.some(function (x) { return x.code === abbr.code; });
      return has ? list : [abbr].concat(list);
    }
    if (apiConfigured === false) return Promise.resolve(withAbbr(local).slice(0, 4));
    return fetch("/.netlify/functions/icd-search?q=" + encodeURIComponent(term), { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.results && res.j.results.length) {
          apiConfigured = true;
          return withAbbr(res.j.results.slice(0, 4));
        }
        if (res.j && res.j.configured === false) apiConfigured = false;
        return withAbbr(local).slice(0, 4);
      })
      .catch(function () { apiConfigured = false; return withAbbr(local).slice(0, 4); });
  }

  /* ---------- render suggestions (pills) ---------- */
  function renderSuggestions(parsed, candidateLists) {
    elSuggestions.innerHTML = "";
    var any = false;
    parsed.forEach(function (p, i) {
      var cands = candidateLists[i] || [];
      var block = document.createElement("div");
      block.className = "enc__sug";
      var head = '<div class="enc__sughead"><b>' + esc(p.term || p.raw) + '</b>';
      if (p.course && p.course !== "Active") head += '<span class="enc__course-badge">' + esc(p.course) + '</span>';
      head += '</div>';
      block.innerHTML = head;
      var pills = document.createElement("div");
      pills.className = "enc__pills";
      if (!cands.length) {
        pills.innerHTML = '<span class="enc__nomatch">no match — refine the wording</span>';
      } else {
        any = true;
        cands.forEach(function (c) {
          var pill = document.createElement("button");
          pill.type = "button"; pill.className = "pill";
          pill.innerHTML = '<code>' + esc(c.code) + '</code><span>' + esc(c.title) + '</span>';
          pill.addEventListener("click", function () {
            addProblem(c, p);
            pill.classList.add("is-picked");
          });
          pills.appendChild(pill);
        });
      }
      block.appendChild(pills);
      elSuggestions.appendChild(block);
    });
    if (!any && parsed.length) {
      elSuggestions.insertAdjacentHTML("afterbegin", '<p class="enc__hint">No codes matched. Try fuller terms (e.g. “anaemia”, “hypertension”).</p>');
    }
  }

  /* ---------- problem list ---------- */
  function buildExts(item, parsed) {
    // pre-apply detected extensions only when they apply to this diagnosis
    var dims = icd.applicableExt(item.title, item.code);
    var exts = [];
    function findOpt(key, code) {
      var g = icd.EXT[key]; if (!g) return null;
      for (var i = 0; i < g.options.length; i++) if (g.options[i].ext === code) return g.options[i];
      return null;
    }
    if (dims.indexOf("laterality") !== -1 && parsed.laterality) {
      var l = findOpt("laterality", parsed.laterality); if (l) exts.push(l);
    }
    if (dims.indexOf("severity") !== -1 && parsed.severity) {
      var s = findOpt("severity", parsed.severity); if (s) exts.push(s);
    }
    return exts;
  }

  function addProblem(item, parsed) {
    if (problems.some(function (p) { return p.code === item.code; })) { renderList(); return; }
    problems.push({
      code: item.code,
      title: item.title,
      chapter: item.chapter || "ICD-11 MMS",
      course: parsed ? parsed.course : "Active",
      exts: parsed ? buildExts(item, parsed) : []
    });
    renderList();
  }

  function clusterOf(p) {
    return p.code + p.exts.map(function (e) { return " & " + e.ext; }).join("");
  }

  function renderList() {
    elList.innerHTML = "";
    if (!problems.length) {
      elList.innerHTML = '<li class="enc__empty">No problems added yet.</li>';
    }
    problems.forEach(function (p, idx) {
      var li = document.createElement("li");
      li.className = "enc__item";

      var sel = document.createElement("select");
      sel.className = "enc__select";
      sel.title = "Assessment / clinical course";
      sel.setAttribute("aria-label", "Assessment for " + p.title);
      icd.COURSE.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c; o.textContent = c; if (c === p.course) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { p.course = sel.value; renderOut(); });

      var rm = document.createElement("button");
      rm.type = "button"; rm.className = "enc__rm"; rm.setAttribute("aria-label", "Remove"); rm.textContent = "×";
      rm.addEventListener("click", function () { problems.splice(idx, 1); renderList(); });

      li.innerHTML =
        '<code class="enc__code">' + esc(clusterOf(p)) + '</code>' +
        '<span class="enc__body"><b>' + esc(p.title) + '</b><small>' + esc(p.chapter) + '</small></span>';
      var ctl = document.createElement("span");
      ctl.className = "enc__ctl";
      var clab = document.createElement("span");
      clab.className = "enc__ctllabel"; clab.textContent = "Assessment";
      ctl.appendChild(clab);
      ctl.appendChild(sel);
      ctl.appendChild(rm);
      li.appendChild(ctl);
      elList.appendChild(li);
    });
    renderOut();
  }

  function renderOut() {
    elCount.textContent = problems.length + (problems.length === 1 ? " problem" : " problems");
    if (!problems.length) { elOut.textContent = "—"; return; }
    elOut.textContent = problems.map(function (p) {
      var label = p.course && p.course !== "Active" ? "  [" + p.course + "]" : "";
      return clusterOf(p) + label;
    }).join("\n");
  }

  /* ---------- run ---------- */
  function run() {
    var text = (narrative.value || "").trim();
    if (!text) { setStatus("", "Type the clinical picture, then press Suggest"); return; }
    setStatus("is-searching", "Parsing the clinical picture…");
    parseNarrative(text).then(function (parsed) {
      if (!parsed.length) { setStatus("is-sample", "Couldn’t identify any problems — try rephrasing."); return; }
      return Promise.all(parsed.map(function (p) { return getCandidates(p.term || p.raw); }))
        .then(function (lists) {
          renderSuggestions(parsed, lists);
          var src = aiAvailable ? "AI parser" : "rule-based parser";
          var codes = apiConfigured ? "WHO ICD-11 API" : "sample data";
          setStatus(apiConfigured ? "is-live" : "is-sample",
            "Parsed " + parsed.length + " problem" + (parsed.length === 1 ? "" : "s") + " · " + src + " · codes from " + codes);
        });
    });
  }

  if (elSuggest) elSuggest.addEventListener("click", run);
  narrative.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  });

  var elClear = byId("encClear");
  if (elClear) elClear.addEventListener("click", function () {
    narrative.value = "";
    problems = [];
    elSuggestions.innerHTML = '<p class="enc__hint">Suggestions will appear here once you press Suggest.</p>';
    renderList();
    setStatus("", "Type the clinical picture, then press Suggest");
    narrative.focus();
  });

  EXAMPLES.forEach(function (ex) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "quickchip";
    b.textContent = ex.length > 38 ? ex.slice(0, 36) + "…" : ex;
    b.title = ex;
    b.addEventListener("click", function () { narrative.value = ex; run(); });
    elExamples.appendChild(b);
  });

  renderList();
})();
