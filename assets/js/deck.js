/* =========================================================
   Slide-deck engine: left/right navigation (buttons,
   keyboard, swipe, dots), direction-aware transitions,
   plus the EMR demo and export wiring.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- year ---------- */
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

  // build dots
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
    navLinks.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("data-target") === activeId);
    });
  }

  function go(to, dirOverride) {
    if (animating || to === current || to < 0 || to >= slides.length) return;
    var dir = dirOverride || (to > current ? "next" : "prev");
    animating = true;
    stage.setAttribute("data-dir", dir);

    var leaving = slides[current];
    var entering = slides[to];

    leaving.classList.remove("is-active");
    leaving.classList.add("is-leaving");
    entering.classList.add("is-active");
    entering.scrollTop = 0;

    window.setTimeout(function () {
      leaving.classList.remove("is-leaving");
      animating = false;
    }, 560);

    current = to;
    updateChrome();
  }

  function next() { go(current + 1, "next"); }
  function prev() { go(current - 1, "prev"); }

  if (btnNext) btnNext.addEventListener("click", next);
  if (btnPrev) btnPrev.addEventListener("click", prev);

  // any element with data-target jumps to that slide
  document.querySelectorAll("[data-target]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var id = el.getAttribute("data-target");
      if (id && idToIndex[id] != null) {
        e.preventDefault();
        go(idToIndex[id]);
        closeMenu();
      }
    });
  });

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    var typing = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
    if (typing) return;
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case " ":
        e.preventDefault(); next(); break;
      case "Home":
        e.preventDefault(); go(0); break;
      case "End":
        e.preventDefault(); go(slides.length - 1); break;
    }
  });

  /* ---------- touch swipe ---------- */
  var touchX = null, touchY = null;
  stage.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0]; touchX = t.clientX; touchY = t.clientY;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX, dy = t.clientY - touchY;
    // horizontal swipe that isn't really a vertical scroll
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next(); else prev();
    }
    touchX = touchY = null;
  }, { passive: true });

  /* ---------- mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var topnav = document.getElementById("topnav");
  function closeMenu() {
    if (topnav) topnav.classList.remove("open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  }
  if (hamburger && topnav) {
    hamburger.addEventListener("click", function () {
      var open = topnav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  updateChrome();

  /* =========================================================
     EMR DEMO
     ========================================================= */
  var engine = window.HCD_ENGINE;
  if (engine) {
    var checksWrap = document.getElementById("symptomChecks");
    engine.SYMPTOMS.forEach(function (s) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" value="' + s.id + '" /> ' + s.label;
      checksWrap.appendChild(label);
    });

    var form = document.getElementById("emrForm");
    var resultEmpty = document.getElementById("resultEmpty");
    var resultBody = document.getElementById("resultBody");

    var SAMPLES = [
      { age: 28, sex: "male", temp: 38.9, complaint: "High fever and headache for 3 days",
        symptoms: ["fever", "chills", "headache", "bodyaches"], investigation: "rdt_pos", history: "none" },
      { age: 6, sex: "female", temp: 39.4, complaint: "Cough and fast breathing for 2 days",
        symptoms: ["cough", "fever", "breathless", "chestpain"], investigation: "cxr_consolidation", history: "none" },
      { age: 54, sex: "male", temp: 36.8, complaint: "Excessive thirst and passing urine often",
        symptoms: ["thirst", "polyuria", "weightloss"], investigation: "rbs_high", history: "none" },
      { age: 19, sex: "male", temp: 37.6, complaint: "Severe bone pain since yesterday",
        symptoms: ["bonepain", "bodyaches", "pallor", "jaundice"], investigation: "none", history: "sickle" },
      { age: 32, sex: "female", temp: 38.1, complaint: "Painful, frequent urination for 2 days",
        symptoms: ["dysuria", "frequency", "abdopain"], investigation: "urine_nitrite", history: "none" }
    ];
    var sampleIdx = 0;

    function setForm(s) {
      document.getElementById("age").value = s.age;
      document.getElementById("sex").value = s.sex;
      document.getElementById("temp").value = s.temp;
      document.getElementById("complaint").value = s.complaint;
      document.getElementById("investigation").value = s.investigation;
      document.getElementById("history").value = s.history;
      checksWrap.querySelectorAll("input").forEach(function (cb) {
        cb.checked = s.symptoms.indexOf(cb.value) !== -1;
      });
    }

    function readForm() {
      var symptoms = [];
      checksWrap.querySelectorAll("input:checked").forEach(function (cb) { symptoms.push(cb.value); });
      var text = (document.getElementById("complaint").value || "").toLowerCase();
      var hints = { fever: "fever", headache: "headache", cough: "cough", vomiting: "vomit",
        diarrhoea: "diarrh", thirst: "thirst", bonepain: "bone pain", dysuria: "painful urin" };
      Object.keys(hints).forEach(function (k) {
        if (text.indexOf(hints[k]) !== -1 && symptoms.indexOf(k) === -1) symptoms.push(k);
      });
      return {
        age: parseInt(document.getElementById("age").value, 10) || 0,
        sex: document.getElementById("sex").value,
        temp: parseFloat(document.getElementById("temp").value) || 36.5,
        investigation: document.getElementById("investigation").value,
        history: document.getElementById("history").value,
        symptoms: symptoms
      };
    }

    function render(ranked, ctx) {
      var top = ranked[0];
      var mod = engine.localModifier(top.cond, ctx);

      document.getElementById("dxName").textContent = top.cond.name;
      var conf = Math.min(96, Math.max(35, top.pct + 18));
      document.getElementById("confBar").style.width = conf + "%";
      document.getElementById("confText").textContent = conf + "% confidence";

      document.getElementById("hcdCode").textContent = top.cond.hcd + mod.suffix;
      document.getElementById("hcdDesc").textContent = top.cond.hcdDesc + (mod.text ? " — " + mod.text : "");
      document.getElementById("icdCode").textContent = top.cond.icd + mod.icdExt;
      document.getElementById("icdDesc").textContent = top.cond.icdDesc + (mod.icdExtText ? " " + mod.icdExtText : "");

      var rList = document.getElementById("reasoningList");
      rList.innerHTML = "";
      var reasons = top.reasons.slice(0, 5);
      if (reasons.length === 0) reasons = ["matched the overall clinical pattern"];
      reasons.forEach(function (r) {
        var li = document.createElement("li");
        li.textContent = r.charAt(0).toUpperCase() + r.slice(1);
        rList.appendChild(li);
      });

      var dList = document.getElementById("diffList");
      dList.innerHTML = "";
      ranked.slice(1, 4).forEach(function (r) {
        if (r.score <= 0) return;
        var li = document.createElement("li");
        li.innerHTML = "<b>" + r.cond.name + "</b> <span class='pct'>" + r.pct + "%</span>";
        dList.appendChild(li);
      });

      resultEmpty.hidden = true;
      resultBody.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ctx = readForm();
      render(engine.diagnose(ctx), ctx);
      if (window.innerWidth < 900) {
        document.getElementById("emrResult").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    document.getElementById("btnReset").addEventListener("click", function () {
      form.reset();
      checksWrap.querySelectorAll("input").forEach(function (cb) { cb.checked = false; });
      resultBody.hidden = true;
      resultEmpty.hidden = false;
    });

    document.getElementById("btnSample").addEventListener("click", function () {
      sampleIdx = (sampleIdx + 1) % SAMPLES.length;
      setForm(SAMPLES[sampleIdx]);
    });

    // start from a complete, representative encounter
    setForm(SAMPLES[0]);
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
