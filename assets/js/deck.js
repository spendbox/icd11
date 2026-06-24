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
    if (entering.id === "demo-walkthrough") window.setTimeout(playWalkthrough, 300);
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
     LIVE ICD-11 CODER  (WHO API + sample fallback)
     ========================================================= */
  var icd = window.ICD11;
  if (icd) {
    var input = byId("icdSearch");
    var results = byId("icdResults");
    var quick = byId("coderQuick");
    var statusEl = byId("coderStatus");
    var extChips = byId("extChips");
    var sel = { item: null, ext: null };
    var debounce;

    // quick-search chips
    icd.QUICK.forEach(function (term) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "quickchip";
      b.textContent = term.charAt(0).toUpperCase() + term.slice(1);
      b.addEventListener("click", function () { input.value = term; runSearch(term, true); });
      quick.appendChild(b);
    });

    function setStatus(kind) {
      if (!statusEl) return;
      var map = {
        idle:      ["", "Type a diagnosis to search ICD-11"],
        searching: ["is-searching", "Searching the WHO ICD-11 API…"],
        live:      ["is-live", "Connected to the WHO ICD-11 API"],
        sample:    ["is-sample", "Using built-in ICD-11 sample data (WHO API not configured)"]
      };
      var m = map[kind] || map.idle;
      statusEl.className = "coder__status " + m[0];
      statusEl.innerHTML = '<span class="dotpulse"></span> ' + m[1];
    }

    function apiSearch(q) {
      return fetch("/.netlify/functions/icd-search?q=" + encodeURIComponent(q), { headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
        .then(function (j) { if (j && j.results && j.results.length) return j.results; throw new Error("empty"); });
    }

    function runSearch(q, autoSelect) {
      q = (q || "").trim();
      if (!q) { results.innerHTML = ""; setStatus("idle"); return; }
      setStatus("searching");
      apiSearch(q).then(function (list) {
        setStatus("live"); renderResults(list, autoSelect);
      }).catch(function () {
        setStatus("sample"); renderResults(icd.search(q), autoSelect);
      });
    }

    function renderResults(list, autoSelect) {
      results.innerHTML = "";
      if (!list.length) {
        results.innerHTML = '<li class="coder__noresult">No match &mdash; try &ldquo;malaria&rdquo;, &ldquo;asthma&rdquo;, &ldquo;fracture&rdquo;…</li>';
        return;
      }
      list.forEach(function (it) {
        var li = document.createElement("li");
        li.className = "coder__result";
        li.innerHTML = '<code>' + esc(it.code) + '</code><span class="coder__result-body"><b>' +
          esc(it.title) + '</b><small>' + esc(it.chapter || "ICD-11 MMS") + '</small></span>';
        li.addEventListener("click", function () { selectItem(it); });
        results.appendChild(li);
      });
      if (autoSelect) selectItem(list[0]);
    }

    function selectItem(it) {
      sel.item = it; sel.ext = null;
      results.innerHTML = "";
      byId("selChapter").textContent = it.chapter || "ICD-11 MMS";
      byId("selTitle").textContent = it.title;

      extChips.innerHTML = "";
      icd.LAT.forEach(function (l) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "rchip"; b.textContent = l.label + " · " + l.ext;
        b.addEventListener("click", function () {
          sel.ext = (sel.ext === l) ? null : l;
          Array.prototype.forEach.call(extChips.children, function (c) { c.classList.remove("active"); });
          if (sel.ext) b.classList.add("active");
          renderOutput();
        });
        extChips.appendChild(b);
      });
      renderOutput();
    }

    function renderOutput() {
      var it = sel.item;
      var cluster = it.code + (sel.ext ? " & " + sel.ext.ext : "");
      var title = it.title + (sel.ext ? " — " + sel.ext.label.toLowerCase() : "");
      byId("outIcd").textContent = cluster;
      byId("outIcdTitle").textContent = title;
      byId("coderNote").textContent = sel.ext
        ? "Cluster: stem " + it.code + " post-coordinated with extension " + sel.ext.ext + "."
        : "Add an extension above to post-coordinate (e.g. laterality).";
    }

    input.addEventListener("input", function () {
      clearTimeout(debounce);
      var q = input.value;
      debounce = window.setTimeout(function () { runSearch(q, false); }, 250);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); clearTimeout(debounce); runSearch(input.value, true); }
    });

    // start with a worked example so the panel is never blank
    setStatus("idle");
    selectItem(icd.ITEMS[0]);
  }

  /* =========================================================
     EXPORT BUTTONS  (download deck — unchanged feature)
     ========================================================= */
  function bindPptx(id) {
    var el = byId(id);
    if (el) el.addEventListener("click", function () {
      if (window.HCD_EXPORT && window.HCD_EXPORT.toPptx) window.HCD_EXPORT.toPptx(el);
    });
  }
  function bindPdf(id) {
    var el = byId(id);
    if (el) el.addEventListener("click", function () { window.print(); });
  }
  ["btnPptx", "btnPptx2", "btnPptx3"].forEach(bindPptx);
  ["btnPdf", "btnPdf2"].forEach(bindPdf);
})();
