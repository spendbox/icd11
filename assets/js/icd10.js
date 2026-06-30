/* =========================================================
   ICD-10 deck — animations & interactive demos.
   Self-contained: listens for the generic `slide:enter` event
   dispatched by deck.js. Uses window.ICD10 (icd10-data.js) for
   the suggestion-pill and look-up demos.
   ========================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  var DB = window.ICD10 || { search: function () { return []; } };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- count-up numbers (ICD-10 in brief) ---------- */
  function fmt(n, comma) { n = Math.round(n); return comma ? n.toLocaleString("en-US") : String(n); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var comma = el.getAttribute("data-comma") === "1";
    var finalText = prefix + fmt(target, comma);
    if (reduce) { el.textContent = finalText; return; }
    var dur = 1100, start = null, token = (el._c10 = (el._c10 || 0) + 1);
    function step(ts) {
      if (token !== el._c10) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased, comma);
      if (p < 1) requestAnimationFrame(step); else el.textContent = finalText;
    }
    el.textContent = prefix + fmt(0, comma);
    requestAnimationFrame(step);
  }
  function playCounts() {
    var slide = byId("brief");
    if (slide) slide.querySelectorAll("[data-count]").forEach(countUp);
  }

  /* =========================================================
     ANATOMY — the 4th character cycles through subcategories
     ========================================================= */
  var SUBS = [
    { d: "0", t: "anterior wall", full: "Acute transmural MI of anterior wall" },
    { d: "1", t: "inferior wall", full: "Acute transmural MI of inferior wall" },
    { d: "2", t: "other sites", full: "Acute transmural MI of other sites" },
    { d: "4", t: "subendocardial (NSTEMI)", full: "Acute subendocardial MI" },
    { d: "9", t: "unspecified site", full: "Acute MI, unspecified site" }
  ];
  var anaTimer = null, anaIdx = 0;
  function setSub(s, flash) {
    var dg = byId("a10SubDigit"), lg = byId("a10SubLegendDigit"), tx = byId("a10SubText"),
        dc = byId("a10DxCode"), dt = byId("a10DxText"), line = document.querySelector("#anatomy .a10dxline");
    if (!dg) return;
    function apply() {
      dg.textContent = s.d; if (lg) lg.textContent = s.d; if (tx) tx.textContent = s.t;
      if (dc) dc.textContent = "I21." + s.d; if (dt) dt.textContent = s.full;
    }
    if (flash && !reduce) {
      if (line) line.classList.add("is-changing");
      dg.classList.remove("is-changing"); void dg.offsetWidth; dg.classList.add("is-changing");
      window.setTimeout(function () { apply(); if (line) line.classList.remove("is-changing"); }, 180);
      window.setTimeout(function () { dg.classList.remove("is-changing"); }, 540);
    } else { apply(); }
  }
  function stopAnatomy() { if (anaTimer) { clearInterval(anaTimer); anaTimer = null; } }
  function startAnatomy() {
    stopAnatomy(); anaIdx = 0; setSub(SUBS[0], false);
    if (reduce) return;
    anaTimer = window.setInterval(function () {
      var slide = byId("anatomy");
      if (!slide || !slide.classList.contains("is-active")) { stopAnatomy(); return; }
      anaIdx = (anaIdx + 1) % SUBS.length;
      setSub(SUBS[anaIdx], true);
    }, 2000);
  }

  /* =========================================================
     READING — typewriter that cycles through real look-ups
     ========================================================= */
  var readEl = document.querySelector("#reading .a10wt");
  var readTyped = byId("a10Typed");
  var readResults = byId("a10Results");
  var READ_WORDS = ["malaria", "asthma", "diabetes", "fracture"];
  var readToken = 0;

  function renderReadResults(word) {
    if (!readResults) return;
    var list = DB.search(word, 3);
    readResults.innerHTML = "";
    list.forEach(function (it, i) {
      var li = document.createElement("li");
      if (i === 0) li.setAttribute("data-pick", "1");
      li.innerHTML = "<code>" + esc(it.code) + "</code><span>" + esc(it.title) + "</span>";
      readResults.appendChild(li);
    });
  }
  function playReading() {
    if (!readEl || !readTyped) return;
    var myToken = ++readToken, wi = 0;
    function cycle() {
      if (myToken !== readToken) return;
      var slide = byId("reading");
      if (!slide || !slide.classList.contains("is-active")) return;
      var word = READ_WORDS[wi % READ_WORDS.length];
      readEl.classList.remove("show-results", "show-pick");
      readTyped.textContent = "";
      renderReadResults(word);
      if (reduce) { readTyped.textContent = word; readEl.classList.add("show-results", "show-pick"); return; }
      var i = 0;
      (function type() {
        if (myToken !== readToken) return;
        if (i <= word.length) { readTyped.textContent = word.slice(0, i); i++; window.setTimeout(type, 100); return; }
        window.setTimeout(function () { if (myToken === readToken) readEl.classList.add("show-results"); }, 350);
        window.setTimeout(function () { if (myToken === readToken) readEl.classList.add("show-pick"); }, 1150);
        window.setTimeout(function () { wi++; cycle(); }, 2900);     // next look-up
      })();
    }
    cycle();
  }
  var readReplay = byId("a10Replay");
  if (readReplay) readReplay.addEventListener("click", playReading);

  /* =========================================================
     WRITE-FREELY → ICD-10 SUGGESTION PILLS (interactive)
     ========================================================= */
  (function dxDemo() {
    var textEl = byId("a10dxText"), suggestEl = byId("a10dxSuggest"),
        rawEl = byId("a10dxRawEcho"), chosenEl = byId("a10dxChosen");
    if (!textEl || !suggestEl) return;
    var chosen = [];                       // [{code,title}]
    var debounce;

    function splitPhrases(text) {
      return text.split(/[,;\n]|—| with | and | & /i)
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length >= 2; });
    }
    function gatherSuggestions(text) {
      var phrases = splitPhrases(text), seen = {}, out = [];
      phrases.forEach(function (p) {
        DB.search(p, 3).forEach(function (it) {
          if (!seen[it.code]) { seen[it.code] = 1; out.push(it); }
        });
      });
      return out.slice(0, 8);
    }
    function isChosen(code) { return chosen.some(function (c) { return c.code === code; }); }
    function toggle(it) {
      if (isChosen(it.code)) chosen = chosen.filter(function (c) { return c.code !== it.code; });
      else chosen.push(it);
      render();
    }
    function render() {
      var text = textEl.value.trim();
      rawEl.innerHTML = text ? esc(text) : '<span class="a10dx__rawempty">&mdash;</span>';
      var sugg = text ? gatherSuggestions(text) : [];
      suggestEl.innerHTML = "";
      if (!text) { suggestEl.innerHTML = '<p class="a10dx__hint">Start typing a diagnosis to see suggestions.</p>'; }
      else if (!sugg.length) { suggestEl.innerHTML = '<p class="a10dx__hint">No match yet &mdash; try &ldquo;malaria&rdquo;, &ldquo;HTN&rdquo;, &ldquo;fungal ear&rdquo;&hellip;</p>'; }
      else sugg.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "a10pill" + (isChosen(it.code) ? " is-on" : "");
        b.innerHTML = "<code>" + esc(it.code) + "</code><span>" + esc(it.title) + "</span><span class=\"a10pill__add\">" + (isChosen(it.code) ? "✓" : "+") + "</span>";
        b.addEventListener("click", function () { toggle(it); });
        suggestEl.appendChild(b);
      });
      // chosen
      chosenEl.innerHTML = "";
      if (!chosen.length) { chosenEl.innerHTML = '<span class="a10dx__none">No codes selected yet</span>'; }
      else chosen.forEach(function (it) {
        var c = document.createElement("button");
        c.type = "button"; c.className = "a10chosen";
        c.innerHTML = "<code>" + esc(it.code) + "</code> " + esc(it.title) + ' <span class="x" aria-hidden="true">×</span>';
        c.setAttribute("aria-label", "Remove " + it.code);
        c.addEventListener("click", function () { toggle(it); });
        chosenEl.appendChild(c);
      });
    }
    textEl.addEventListener("input", function () { clearTimeout(debounce); debounce = window.setTimeout(render, 180); });
    document.querySelectorAll("#dx-pills .a10dx__ex").forEach(function (b) {
      b.addEventListener("click", function () { textEl.value = b.getAttribute("data-ex") || ""; render(); textEl.focus(); });
    });

    // gentle auto-demo the first time the slide is shown (only if empty)
    var demoed = false;
    document.addEventListener("slide:enter", function (e) {
      if ((e.detail && e.detail.id) !== "dx-pills" || demoed || textEl.value.trim()) return;
      demoed = true;
      window.setTimeout(function () {
        if (textEl.value.trim()) return;
        textEl.value = "otomycosis — fungal ear infection";
        render();
      }, 500);
    });

    render();
  })();

  /* =========================================================
     PRESCRIBING DEMO — auto-typing + confirmation pills
     ========================================================= */
  var rxEl = byId("a10rx");
  var rxTyped = byId("a10rxTyped");
  var rxToken = 0;
  var RX_TEXT = "tabs augmentin 625mg tds x 7/7, tabs pcm 1g qds prn";
  function playRx() {
    if (!rxEl || !rxTyped) return;
    var myToken = ++rxToken;
    rxEl.classList.remove("show-suggestions", "pick-1", "pick-2", "show-synced");
    rxTyped.textContent = "";
    if (reduce) { rxTyped.textContent = RX_TEXT; rxEl.classList.add("show-suggestions", "pick-1", "pick-2", "show-synced"); return; }
    var i = 0;
    (function type() {
      if (myToken !== rxToken) return;
      if (i <= RX_TEXT.length) { rxTyped.textContent = RX_TEXT.slice(0, i); i++; window.setTimeout(type, 42); return; }
      seq();
    })();
    function at(cls, delay) { window.setTimeout(function () { if (myToken === rxToken) rxEl.classList.add(cls); }, delay); }
    function seq() { at("show-suggestions", 400); at("pick-1", 1150); at("pick-2", 1700); at("show-synced", 2350); }
  }
  var rxReplay = byId("a10rxReplay");
  if (rxReplay) rxReplay.addEventListener("click", playRx);

  /* ---------- wire everything to slide entry ---------- */
  document.addEventListener("slide:enter", function (e) {
    var id = e.detail && e.detail.id;
    if (id === "brief") playCounts();
    else if (id === "anatomy") window.setTimeout(startAnatomy, 1800);
    else if (id === "reading") window.setTimeout(playReading, 200);
    else if (id === "faster-rx") window.setTimeout(playRx, 200);
    else stopAnatomy();          // leaving anatomy stops its timer
  });
})();
