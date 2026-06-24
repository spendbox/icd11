/* =========================================================
   Slide-deck engine: left/right navigation (buttons,
   keyboard, swipe, dots), direction-aware transitions,
   the interactive ICD-11 coder demo, and export wiring.
   ========================================================= */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     DECK NAVIGATION
     ========================================================= */
  var stage   = document.getElementById("stage");
  var slides  = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var progress = document.getElementById("scrollProgress");
  var counterNow = document.getElementById("counterNow");
  var counterTotal = document.getElementById("counterTotal");
  var btnPrev = document.getElementById("btnPrev");
  var btnNext = document.getElementById("btnNext");
  var dotsWrap = document.getElementById("dots");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));

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
    var activeId = slides[current].id;
    navLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-target") === activeId); });
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
  }
  function next() { go(current + 1, "next"); }
  function prev() { go(current - 1, "prev"); }

  if (btnNext) btnNext.addEventListener("click", next);
  if (btnPrev) btnPrev.addEventListener("click", prev);

  document.querySelectorAll("[data-target]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var id = el.getAttribute("data-target");
      if (id && idToIndex[id] != null) { e.preventDefault(); go(idToIndex[id]); closeMenu(); }
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

  var hamburger = document.getElementById("hamburger");
  var topnav = document.getElementById("topnav");
  function closeMenu() { if (topnav) topnav.classList.remove("open"); if (hamburger) hamburger.setAttribute("aria-expanded", "false"); }
  if (hamburger && topnav) {
    hamburger.addEventListener("click", function () {
      var open = topnav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  updateChrome();

  /* =========================================================
     ICD-11 CODER DEMO
     ========================================================= */
  var icd = window.ICD11;
  if (icd) {
    var input   = document.getElementById("icdSearch");
    var results = document.getElementById("icdResults");
    var quick   = document.getElementById("coderQuick");
    var selected = document.getElementById("coderSelected");

    var state = { entity: null, refine: null, lat: null };

    // quick-pick chips for common HRGH presentations
    icd.QUICK.forEach(function (id) {
      var e = icd.byId(id);
      if (!e) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "quickchip"; b.textContent = e.title.split(",")[0].split(" or ")[0];
      b.addEventListener("click", function () { input.value = ""; results.innerHTML = ""; selectEntity(e); });
      quick.appendChild(b);
    });

    function renderResults(list) {
      results.innerHTML = "";
      list.forEach(function (e) {
        var li = document.createElement("li");
        li.className = "coder__result";
        li.innerHTML =
          '<code>' + e.code + '</code>' +
          '<span class="coder__result-body"><b>' + e.title + '</b>' +
          '<small>' + e.chapter + '</small></span>';
        li.addEventListener("click", function () { selectEntity(e); });
        results.appendChild(li);
      });
    }

    input.addEventListener("input", function () {
      var q = input.value;
      if (!q.trim()) { results.innerHTML = ""; return; }
      var list = icd.search(q);
      if (list.length) renderResults(list);
      else results.innerHTML = '<li class="coder__noresult">No match &mdash; try &ldquo;malaria&rdquo;, &ldquo;sugar&rdquo;, &ldquo;BP&rdquo;…</li>';
    });
    // Enter selects the top result
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var list = icd.search(input.value);
        if (list.length) { results.innerHTML = ""; selectEntity(list[0]); }
      }
    });

    function selectEntity(e) {
      state.entity = e; state.refine = null; state.lat = null;
      results.innerHTML = "";

      document.getElementById("selChapter").textContent = e.chapter;
      document.getElementById("selTitle").textContent = e.title;

      // refine chips
      var refineWrap = document.getElementById("refineWrap");
      var refineChips = document.getElementById("refineChips");
      refineChips.innerHTML = "";
      if (e.refine && e.refine.length) {
        refineWrap.hidden = false;
        e.refine.forEach(function (r) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "rchip"; b.textContent = r.label + " · " + r.code;
          b.addEventListener("click", function () {
            state.refine = (state.refine === r) ? null : r;
            Array.prototype.forEach.call(refineChips.children, function (c) { c.classList.remove("active"); });
            if (state.refine) b.classList.add("active");
            renderOutput();
          });
          refineChips.appendChild(b);
        });
      } else { refineWrap.hidden = true; }

      // laterality (post-coordination) chips
      var latWrap = document.getElementById("latWrap");
      var latChips = document.getElementById("latChips");
      latChips.innerHTML = "";
      if (e.laterality) {
        latWrap.hidden = false;
        icd.LAT.forEach(function (l) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "rchip"; b.textContent = l.label + " · " + l.ext;
          b.addEventListener("click", function () {
            state.lat = (state.lat === l) ? null : l;
            Array.prototype.forEach.call(latChips.children, function (c) { c.classList.remove("active"); });
            if (state.lat) b.classList.add("active");
            renderOutput();
          });
          latChips.appendChild(b);
        });
      } else { latWrap.hidden = true; }

      renderOutput();
    }

    function renderOutput() {
      var e = state.entity;
      var stemCode = state.refine ? state.refine.code : e.code;
      var stemTitle = state.refine ? (e.title.split(",")[0] + " — " + state.refine.label) : e.title;
      var icdStr = stemCode + (state.lat ? " & " + state.lat.ext : "");
      var hcdStr = e.hcd + (state.refine ? state.refine.suffix : "") + (state.lat ? state.lat.suffix : "");

      document.getElementById("outIcd").textContent = icdStr;
      document.getElementById("outIcdTitle").textContent = stemTitle + (state.lat ? " (" + state.lat.label.toLowerCase() + ")" : "");
      document.getElementById("outHcd").textContent = hcdStr;
      document.getElementById("outHcdTitle").textContent = e.hcdTitle;
    }

    // start with a worked example so the panel is never blank
    var first = icd.byId("malaria");
    if (first) selectEntity(first);
  }

  /* =========================================================
     EXPORT BUTTONS
     ========================================================= */
  function bindPptx(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () {
      if (window.HCD_EXPORT && window.HCD_EXPORT.toPptx) window.HCD_EXPORT.toPptx(el);
    });
  }
  function bindPdf(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () { closeMenu(); window.print(); });
  }
  ["btnPptx", "btnPptx2", "btnPptx3"].forEach(bindPptx);
  ["btnPdf", "btnPdf2"].forEach(bindPdf);
})();
