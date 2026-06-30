/* =========================================================
   Slide-deck engine: left/right navigation, the live
   ICD-11 coder (WHO ICD-11 API with sample fallback),
   and export bindings.
   ========================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var yearEl = byId("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     DECK NAVIGATION
     ========================================================= */
  var stage = byId("stage");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var progress = byId("scrollProgress");
  var counterNow = byId("counterNow");
  var counterTotal = byId("counterTotal");
  var btnPrev = byId("btnPrev");
  var btnNext = byId("btnNext");
  var dotsWrap = byId("dots");

  var idToIndex = {};
  slides.forEach(function (s, i) { idToIndex[s.id] = i; });

  var current = Math.max(0, slides.findIndex(function (s) { return s.classList.contains("is-active"); }));
  if (current < 0) current = 0;
  var animating = false;

  slides.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Slide " + (i + 1) + ": " + (s.dataset.title || ""));
    b.title = s.dataset.title || ("Slide " + (i + 1));
    b.addEventListener("click", function () { go(i); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);
  if (counterTotal) counterTotal.textContent = String(slides.length);

  function updateChrome() {
    if (counterNow) counterNow.textContent = String(current + 1);
    if (progress) progress.style.width = (((current + 1) / slides.length) * 100) + "%";
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === slides.length - 1;
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
      d.setAttribute("aria-selected", i === current ? "true" : "false");
    });
  }

  function go(to, dirOverride) {
    if (animating || to === current || to < 0 || to >= slides.length) return;
    var dir = dirOverride || (to > current ? "next" : "prev");
    animating = true;
    stage.setAttribute("data-dir", dir);
    var leaving = slides[current], entering = slides[to];
    leaving.classList.remove("is-active");
    leaving.classList.add("is-leaving");
    entering.classList.add("is-active");
    entering.scrollTop = 0;
    window.setTimeout(function () { leaving.classList.remove("is-leaving"); animating = false; }, 560);
    current = to;
    updateChrome();
    onEnterSlide(entering);
  }

  // Per-slide hooks. Called on navigation and on initial load so the
  // walkthrough reliably plays the first time the slide is shown.
  function onEnterSlide(slide) {
    if (!slide) return;
    if (slide.id === "demo-walkthrough") {
      // start after the slide-in transition (~560ms) so the typing is
      // visible from the very first character.
      window.setTimeout(playWalkthrough, 620);
    } else if (slide.id === "rx-demo") {
      window.setTimeout(playRx, 620);
    }
    // Generic hook: let per-deck add-on scripts (e.g. icd10.js) drive their
    // own timed animations without the shared engine knowing each slide id.
    slide.dispatchEvent(new CustomEvent("slide:enter", { bubbles: true, detail: { id: slide.id } }));
  }
  function next() { go(current + 1, "next"); }
  function prev() { go(current - 1, "prev"); }

  if (btnNext) btnNext.addEventListener("click", next);
  if (btnPrev) btnPrev.addEventListener("click", prev);

  document.querySelectorAll("[data-target]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var id = el.getAttribute("data-target");
      if (id && idToIndex[id] != null) { e.preventDefault(); go(idToIndex[id]); }
    });
  });

  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": e.preventDefault(); next(); break;
      case "ArrowLeft":  case "PageUp":   e.preventDefault(); prev(); break;
      case " ": e.preventDefault(); next(); break;
      case "Home": e.preventDefault(); go(0); break;
      case "End":  e.preventDefault(); go(slides.length - 1); break;
    }
  });

  var touchX = null, touchY = null;
  stage.addEventListener("touchstart", function (e) { var t = e.changedTouches[0]; touchX = t.clientX; touchY = t.clientY; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var t = e.changedTouches[0], dx = t.clientX - touchX, dy = t.clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (dx < 0) next(); else prev(); }
    touchX = touchY = null;
  }, { passive: true });

  updateChrome();
  // If the deck happens to load directly on the walkthrough slide, play it.
  onEnterSlide(slides[current]);

  /* =========================================================
     WALKTHROUGH — auto-playing illustration
     ========================================================= */
  var wtEl = document.querySelector("#demo-walkthrough .wt");
  var wtTyped = byId("wtTyped");
  var wtToken = 0;
  var WT_WORD = "fracture";

  function playWalkthrough() {
    if (!wtEl || !wtTyped) return;
    var myToken = ++wtToken;
    wtEl.classList.remove("show-results", "show-pick", "show-ext", "show-cluster");
    wtTyped.textContent = "";
    var i = 0;
    (function type() {
      if (myToken !== wtToken) return;
      if (i <= WT_WORD.length) { wtTyped.textContent = WT_WORD.slice(0, i); i++; window.setTimeout(type, 95); return; }
      step("show-results", 450);
    })();
    function step(cls, delay) {
      window.setTimeout(function () {
        if (myToken !== wtToken) return;
        wtEl.classList.add(cls);
        if (cls === "show-results") step("show-pick", 750);
        else if (cls === "show-pick") step("show-ext", 850);
        else if (cls === "show-ext") step("show-cluster", 750);
      }, delay);
    }
  }
  var wtReplay = byId("wtReplay");
  if (wtReplay) wtReplay.addEventListener("click", playWalkthrough);

  /* =========================================================
     PRESCRIBING DEMO — auto-typing + confirmation pills
     ========================================================= */
  var rxEl = document.querySelector("#rx-demo .rx");
  var rxTyped = byId("rxTyped");
  var rxToken = 0;
  var RX_TEXT = "tabs pcm 1g tds x 5/7, tabs ACT 80/480mg bd x 3/7";

  function playRx() {
    if (!rxEl || !rxTyped) return;
    var myToken = ++rxToken;
    rxEl.classList.remove("show-suggestions", "pick-1", "pick-2", "show-synced");
    rxTyped.textContent = "";
    var i = 0;
    (function type() {
      if (myToken !== rxToken) return;
      if (i <= RX_TEXT.length) { rxTyped.textContent = RX_TEXT.slice(0, i); i++; window.setTimeout(type, 45); return; }
      seq();
    })();
    function at(cls, delay) { window.setTimeout(function () { if (myToken === rxToken) rxEl.classList.add(cls); }, delay); }
    function seq() {
      at("show-suggestions", 400);
      at("pick-1", 1150);
      at("pick-2", 1700);
      at("show-synced", 2350);
    }
  }
  var rxReplay = byId("rxReplay");
  if (rxReplay) rxReplay.addEventListener("click", playRx);

  /* =========================================================
     LIVE ICD-11 CODER  (WHO API + sample fallback)
     ========================================================= */
  var icd = window.ICD11;
  if (icd && byId("icdSearch")) {
    var input = byId("icdSearch");
    var results = byId("icdResults");
    var quick = byId("coderQuick");
    var statusEl = byId("coderStatus");
    var extChips = byId("extChips");
    var sel = { item: null, exts: [] };   // selected extensions: [{cat,label,code}]
    var debounce;
    var reqToken = 0;                      // guards against out-of-order responses
    var activeIdx = -1;                    // keyboard-highlighted result
    var lastResults = [];

    // apiConfigured: null = unknown (not yet probed), true/false once known.
    var apiConfigured = null;

    // quick-search chips
    icd.QUICK.forEach(function (term) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "quickchip";
      b.textContent = term.charAt(0).toUpperCase() + term.slice(1);
      b.addEventListener("click", function () { input.value = term; input.focus(); runSearch(term, true); });
      quick.appendChild(b);
    });

    function setStatus(kind, extra) {
      if (!statusEl) return;
      var map = {
        idle:      ["", "Type a diagnosis to search the WHO ICD-11 classification"],
        ready:     ["is-live", "Connected to the WHO ICD-11 API — start typing"],
        searching: ["is-searching", "Searching ICD-11…"],
        live:      ["is-live", "Live results from the WHO ICD-11 API"],
        sample:    ["is-sample", "Built-in ICD-11 sample data (WHO API not configured)"],
        error:     ["is-sample", extra || "WHO API unavailable — showing sample data"]
      };
      var m = map[kind] || map.idle;
      statusEl.className = "coder__status " + m[0];
      statusEl.innerHTML = '<span class="dotpulse"></span> ' + esc(m[1]);
    }

    // One-time probe so the status reflects reality before the first search.
    function probeApi() {
      return fetch("/.netlify/functions/icd-search?ping=1", { headers: { Accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : { configured: false }; })
        .then(function (j) { apiConfigured = !!(j && j.configured); return apiConfigured; })
        .catch(function () { apiConfigured = false; return false; }); // function not deployed → sample mode
    }

    function apiSearch(q) {
      return fetch("/.netlify/functions/icd-search?q=" + encodeURIComponent(q), { headers: { Accept: "application/json" } })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            return { ok: r.ok, status: r.status, body: j };
          });
        });
    }

    function runSearch(q, autoSelect) {
      q = (q || "").trim();
      var myToken = ++reqToken;
      if (!q) { renderResults([], false); setStatus(apiConfigured ? "ready" : "idle"); return; }

      // If we already know the API isn't configured, skip the round-trip.
      if (apiConfigured === false) {
        setStatus("sample"); renderResults(icd.search(q), autoSelect); return;
      }

      setStatus("searching");
      apiSearch(q).then(function (res) {
        if (myToken !== reqToken) return;          // a newer search superseded this one
        var body = res.body || {};
        if (res.ok && body.results && body.results.length) {
          apiConfigured = true;
          setStatus("live"); renderResults(body.results, autoSelect); return;
        }
        if (res.ok && body.results && !body.results.length) {
          // API answered but found nothing — try the local set so the user still sees codes.
          apiConfigured = true;
          setStatus("live");
          renderResults(icd.search(q), autoSelect); return;
        }
        // Not configured (503) or upstream error (5xx) — fall back to sample.
        apiConfigured = body.configured === true ? true : (res.status === 503 ? false : apiConfigured);
        setStatus(res.status === 503 ? "sample" : "error");
        renderResults(icd.search(q), autoSelect);
      }).catch(function () {
        if (myToken !== reqToken) return;
        apiConfigured = false;                     // endpoint unreachable (e.g. not on Netlify)
        setStatus("sample"); renderResults(icd.search(q), autoSelect);
      });
    }

    function highlight(idx) {
      var lis = results.querySelectorAll(".coder__result");
      activeIdx = idx;
      Array.prototype.forEach.call(lis, function (li, i) {
        li.classList.toggle("is-active", i === idx);
        if (i === idx) li.scrollIntoView({ block: "nearest" });
      });
    }

    function renderResults(list, autoSelect) {
      results.innerHTML = "";
      lastResults = list || [];
      activeIdx = -1;
      if (!lastResults.length) {
        results.innerHTML = '<li class="coder__noresult">No match &mdash; try &ldquo;malaria&rdquo;, &ldquo;asthma&rdquo;, &ldquo;fracture&rdquo;…</li>';
        return;
      }
      lastResults.forEach(function (it, i) {
        var li = document.createElement("li");
        li.className = "coder__result";
        li.setAttribute("role", "option");
        li.innerHTML = '<code>' + esc(it.code) + '</code><span class="coder__result-body"><b>' +
          esc(it.title) + '</b><small>' + esc(it.chapter || "ICD-11 MMS") + '</small></span>';
        li.addEventListener("click", function () { selectItem(it); });
        li.addEventListener("mousemove", function () { if (activeIdx !== i) highlight(i); });
        results.appendChild(li);
      });
      if (autoSelect) selectItem(lastResults[0]);
    }

    var extSearchEl = byId("extSearch");
    var extResultsEl = byId("extResults");
    var extChosenEl = byId("extChosen");
    var extChosenWrap = byId("extChosenWrap");
    var selForEl = byId("selFor");

    function hasExt(code) { return sel.exts.some(function (e) { return e.code === code; }); }

    function toggleExt(cat, label, code) {
      if (hasExt(code)) {
        sel.exts = sel.exts.filter(function (e) { return e.code !== code; });
      } else {
        sel.exts = sel.exts.filter(function (e) { return e.cat !== cat; });   // one value per category
        sel.exts.push({ cat: cat, label: label, code: code });
      }
      renderSuggested(); renderChosen(); renderExtResults(); renderOutput();
    }

    function selectItem(it) {
      sel.item = it; sel.exts = [];
      results.innerHTML = "";
      lastResults = []; activeIdx = -1;
      byId("selChapter").textContent = it.chapter || "ICD-11 MMS";
      byId("selTitle").textContent = it.title;
      if (selForEl) selForEl.textContent = it.title.length > 32 ? "this diagnosis" : it.title.toLowerCase();
      if (extSearchEl) extSearchEl.value = "";
      renderSuggested(); renderExtResults(); renderChosen(); renderOutput();
    }

    // Context-aware suggested extension categories — varies by diagnosis.
    function renderSuggested() {
      extChips.innerHTML = "";
      if (!sel.item) return;
      var cats = icd.suggestExt(sel.item.title, sel.item.code);
      cats.forEach(function (key) {
        var group = icd.EXT_CATS[key];
        if (!group) return;
        var row = document.createElement("div");
        row.className = "extgroup";
        row.innerHTML = '<span class="extgroup__label">' + esc(group.label) + '</span>';
        group.values.forEach(function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "rchip" + (hasExt(v.code) ? " active" : "");
          b.textContent = v.label + " · " + v.code;
          b.addEventListener("click", function () { toggleExt(key, v.label, v.code); });
          row.appendChild(b);
        });
        extChips.appendChild(row);
      });
    }

    // Free search across the FULL extension catalogue.
    var extFocused = false;
    function renderExtResults() {
      if (!extResultsEl) return;
      var q = extSearchEl ? extSearchEl.value : "";
      var list;
      if (q.trim()) {
        list = icd.extSearch(q).slice(0, 8);
      } else if (extFocused) {
        list = icd.extSearch("").slice(0, 8);   // show options as soon as the box is focused
      } else {
        extResultsEl.innerHTML = ""; return;
      }
      extResultsEl.innerHTML = "";
      if (!list.length) { extResultsEl.innerHTML = '<li class="extfind__none">No extension matches</li>'; return; }
      list.forEach(function (e) {
        var li = document.createElement("li");
        li.className = "extfind__item" + (hasExt(e.code) ? " is-on" : "");
        li.innerHTML = '<code>' + esc(e.code) + '</code><span>' + esc(e.label) + '</span><em>' + esc(e.catLabel) + '</em>';
        li.addEventListener("mousedown", function (ev) { ev.preventDefault(); toggleExt(e.cat, e.label, e.code); });
        extResultsEl.appendChild(li);
      });
    }

    function renderChosen() {
      if (!extChosenEl) return;
      extChosenEl.innerHTML = "";
      if (!sel.exts.length) { if (extChosenWrap) extChosenWrap.hidden = true; return; }
      if (extChosenWrap) extChosenWrap.hidden = false;
      sel.exts.forEach(function (e) {
        var chip = document.createElement("button");
        chip.type = "button"; chip.className = "chosenchip";
        chip.innerHTML = esc(e.label) + ' · ' + esc(e.code) + ' <span aria-hidden="true">×</span>';
        chip.setAttribute("aria-label", "Remove " + e.label);
        chip.addEventListener("click", function () { toggleExt(e.cat, e.label, e.code); });
        extChosenEl.appendChild(chip);
      });
    }

    function renderOutput() {
      var it = sel.item;
      if (!it) return;
      var cluster = it.code + sel.exts.map(function (e) { return " & " + e.code; }).join("");
      var title = it.title + (sel.exts.length ? " — " + sel.exts.map(function (e) { return e.label.toLowerCase(); }).join(", ") : "");
      byId("outIcd").textContent = cluster;
      byId("outIcdTitle").textContent = title;
      byId("coderNote").textContent = sel.exts.length
        ? "Cluster: stem " + it.code + " post-coordinated with " + sel.exts.map(function (e) { return e.code; }).join(" + ") + "."
        : "Pick a suggested extension, or search to add any extension.";
    }

    if (extSearchEl) {
      extSearchEl.addEventListener("input", renderExtResults);
      extSearchEl.addEventListener("focus", function () { extFocused = true; renderExtResults(); });
      extSearchEl.addEventListener("blur", function () {
        extFocused = false;
        window.setTimeout(function () { if (!extFocused && !extSearchEl.value.trim()) extResultsEl.innerHTML = ""; }, 120);
      });
    }

    input.addEventListener("input", function () {
      clearTimeout(debounce);
      var q = input.value;
      debounce = window.setTimeout(function () { runSearch(q, false); }, 250);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" && lastResults.length) {
        e.preventDefault(); highlight(Math.min(activeIdx + 1, lastResults.length - 1));
      } else if (e.key === "ArrowUp" && lastResults.length) {
        e.preventDefault(); highlight(Math.max(activeIdx - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault(); clearTimeout(debounce);
        if (activeIdx >= 0 && lastResults[activeIdx]) selectItem(lastResults[activeIdx]);
        else runSearch(input.value, true);
      } else if (e.key === "Escape") {
        renderResults([], false);
      }
    });

    // start with a worked example so the panel is never blank, then probe the API
    selectItem(icd.ITEMS[0]);
    setStatus("idle");
    probeApi().then(function (configured) {
      if (!input.value) setStatus(configured ? "ready" : "idle");
    });
  }
})();
