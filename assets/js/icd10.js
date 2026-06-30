/* =========================================================
   ICD-10 deck — timed flourishes (count-up + typewriter).
   Self-contained: listens for the generic `slide:enter` event
   dispatched by deck.js, so it needs no per-slide wiring there.
   ========================================================= */
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- count-up numbers (ICD-10 in brief) ---------- */
  function fmt(n, comma) {
    n = Math.round(n);
    return comma ? n.toLocaleString("en-US") : String(n);
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var comma = el.getAttribute("data-comma") === "1";
    var finalText = prefix + fmt(target, comma);
    if (reduce) { el.textContent = finalText; return; }
    var dur = 1100, start = null;
    // token guards against overlap if the slide is re-entered mid-animation
    var token = (el._c10 = (el._c10 || 0) + 1);
    function step(ts) {
      if (token !== el._c10) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // ease-out cubic
      el.textContent = prefix + fmt(target * eased, comma);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = finalText;
    }
    el.textContent = prefix + fmt(0, comma);
    requestAnimationFrame(step);
  }
  function playCounts() {
    var slide = byId("brief");
    if (!slide) return;
    slide.querySelectorAll("[data-count]").forEach(countUp);
  }

  /* ---------- typewriter walkthrough (Reading codes) ---------- */
  var wtEl = document.querySelector("#reading .a10wt");
  var wtTyped = byId("a10Typed");
  var wtToken = 0;
  var WT_WORD = "malaria";

  function playWalkthrough() {
    if (!wtEl || !wtTyped) return;
    var myToken = ++wtToken;
    wtEl.classList.remove("show-results", "show-pick");
    wtTyped.textContent = "";
    if (reduce) { wtTyped.textContent = WT_WORD; wtEl.classList.add("show-results", "show-pick"); return; }
    var i = 0;
    (function type() {
      if (myToken !== wtToken) return;
      if (i <= WT_WORD.length) { wtTyped.textContent = WT_WORD.slice(0, i); i++; window.setTimeout(type, 105); return; }
      step("show-results", 450);
    })();
    function step(cls, delay) {
      window.setTimeout(function () {
        if (myToken !== wtToken) return;
        wtEl.classList.add(cls);
        if (cls === "show-results") step("show-pick", 900);
      }, delay);
    }
  }
  var wtReplay = byId("a10Replay");
  if (wtReplay) wtReplay.addEventListener("click", playWalkthrough);

  /* ---------- wire to slide entry ---------- */
  document.addEventListener("slide:enter", function (e) {
    var id = e.detail && e.detail.id;
    if (id === "brief") playCounts();
    else if (id === "reading") window.setTimeout(playWalkthrough, 200);
  });
})();
