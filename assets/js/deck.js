/* =========================================================
   Deck interactions: nav, scroll progress, reveals,
   and the EMR demo wiring.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll progress ---------- */
  var progress = document.getElementById("scrollProgress");
  function onScroll() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progress) progress.style.width = (scrolled * 100) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var topnav = document.getElementById("topnav");
  if (hamburger && topnav) {
    hamburger.addEventListener("click", function () {
      var open = topnav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    topnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        topnav.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- reveal on scroll + active nav ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("in-view");
      });
    }, { threshold: 0.12 });
    slides.forEach(function (s) { revealObs.observe(s); });

    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { threshold: 0.5 });
    slides.forEach(function (s) { navObs.observe(s); });
  } else {
    slides.forEach(function (s) { s.classList.add("in-view"); });
  }

  /* ========================================================
     EMR DEMO
     ======================================================== */
  var engine = window.HCD_ENGINE;
  if (engine) {
    // build symptom checkboxes
    var checksWrap = document.getElementById("symptomChecks");
    engine.SYMPTOMS.forEach(function (s) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" value="' + s.id + '" /> ' + s.label;
      checksWrap.appendChild(label);
    });

    var form = document.getElementById("emrForm");
    var resultEmpty = document.getElementById("resultEmpty");
    var resultBody = document.getElementById("resultBody");

    // sample encounters to cycle through
    var SAMPLES = [
      {
        age: 28, sex: "male", temp: 38.9,
        complaint: "High fever and headache for 3 days",
        symptoms: ["fever", "chills", "headache", "bodyaches"],
        investigation: "rdt_pos", history: "none"
      },
      {
        age: 6, sex: "female", temp: 39.4,
        complaint: "Cough and fast breathing for 2 days",
        symptoms: ["cough", "fever", "breathless", "chestpain"],
        investigation: "cxr_consolidation", history: "none"
      },
      {
        age: 54, sex: "male", temp: 36.8,
        complaint: "Excessive thirst and passing urine often",
        symptoms: ["thirst", "polyuria", "weightloss"],
        investigation: "rbs_high", history: "none"
      },
      {
        age: 19, sex: "male", temp: 37.6,
        complaint: "Severe bone pain since yesterday",
        symptoms: ["bonepain", "bodyaches", "pallor", "jaundice"],
        investigation: "none", history: "sickle"
      },
      {
        age: 32, sex: "female", temp: 38.1,
        complaint: "Painful, frequent urination for 2 days",
        symptoms: ["dysuria", "frequency", "abdopain"],
        investigation: "urine_nitrite", history: "none"
      }
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
      // light parsing of the free-text complaint to catch obvious symptoms
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

      // reasoning
      var rList = document.getElementById("reasoningList");
      rList.innerHTML = "";
      var reasons = top.reasons.slice(0, 5);
      if (reasons.length === 0) reasons = ["matched the overall clinical pattern"];
      reasons.forEach(function (r) {
        var li = document.createElement("li");
        li.textContent = r.charAt(0).toUpperCase() + r.slice(1);
        rList.appendChild(li);
      });

      // differentials
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
      var ranked = engine.diagnose(ctx);
      render(ranked, ctx);
      // keep the result in view on small screens
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
  }

  /* ========================================================
     EXPORT BUTTONS
     ======================================================== */
  function bindPptx(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () {
      if (window.HCD_EXPORT && window.HCD_EXPORT.toPptx) window.HCD_EXPORT.toPptx(el);
    });
  }
  function bindPdf(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () {
      // close mobile menu first so it doesn't print
      if (topnav) topnav.classList.remove("open");
      window.print();
    });
  }
  ["btnPptx", "btnPptx2", "btnPptx3"].forEach(bindPptx);
  ["btnPdf", "btnPdf2"].forEach(bindPdf);
})();
