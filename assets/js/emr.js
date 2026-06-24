/* =========================================================
   Mock ICD-11 search index + HCD mapping.
   Mirrors how a real EMR codes a diagnosis: the clinician
   SEARCHES, picks a stem code, optionally refines it or
   adds an extension (post-coordination). Each ICD-11 entity
   carries the HCD code it maps to.

   Codes are real ICD-11 MMS stem codes (verified against the
   WHO classification) used here for demonstration. Extension
   codes (XK8G/XK9K/XK70 = left/right/bilateral) are shown to
   illustrate post-coordination.
   ========================================================= */
(function () {
  "use strict";

  // ICD-11 laterality extension codes (post-coordination)
  var LAT = [
    { label: "Left",      ext: "XK8G", suffix: ".L" },
    { label: "Right",     ext: "XK9K", suffix: ".R" },
    { label: "Bilateral", ext: "XK70", suffix: ".B" }
  ];

  /* The searchable ICD-11 entities — weighted to the common
     caseload at Harvey Road General Hospital, Yaba. */
  var INDEX = [
    {
      id: "malaria", code: "1F4Z", title: "Malaria",
      chapter: "01 · Infectious & parasitic diseases",
      syn: ["malaria", "plasmodium", "fever", "rdt", "falciparum", "mp"],
      hcd: "HCD-COM-01", hcdTitle: "Communicable › Malaria",
      refine: [
        { label: "P. falciparum", code: "1F40", suffix: ".Pf" },
        { label: "P. falciparum, cerebral (severe)", code: "1F40.0", suffix: ".Sv" },
        { label: "P. vivax", code: "1F41", suffix: ".Pv" },
        { label: "Species unspecified", code: "1F4Z", suffix: "" }
      ]
    },
    {
      id: "typhoid", code: "1A07", title: "Typhoid fever",
      chapter: "01 · Infectious & parasitic diseases",
      syn: ["typhoid", "enteric fever", "salmonella", "widal"],
      hcd: "HCD-COM-02", hcdTitle: "Communicable › Enteric fever"
    },
    {
      id: "gastro", code: "1A40", title: "Gastroenteritis or colitis of infectious origin",
      chapter: "01 · Infectious & parasitic diseases",
      syn: ["gastroenteritis", "diarrhoea", "diarrhea", "loose stool", "vomiting", "enteritis"],
      hcd: "HCD-COM-05", hcdTitle: "Communicable › GI infection",
      refine: [
        { label: "Agent unspecified", code: "1A40.Z", suffix: "" }
      ]
    },
    {
      id: "tb", code: "1B10", title: "Tuberculosis of the respiratory system",
      chapter: "01 · Infectious & parasitic diseases",
      syn: ["tuberculosis", "tb", "pulmonary tb", "koch", "afb", "cough blood"],
      hcd: "HCD-COM-07", hcdTitle: "Communicable › Tuberculosis",
      refine: [
        { label: "Bacteriologically confirmed", code: "1B10.0", suffix: ".Cf" },
        { label: "Not confirmed (clinical)", code: "1B10.1", suffix: ".Cl" }
      ]
    },
    {
      id: "urti", code: "CA07", title: "Acute upper respiratory infection",
      chapter: "12 · Respiratory system",
      syn: ["urti", "cold", "catarrh", "sore throat", "runny nose", "uri"],
      hcd: "HCD-COM-04", hcdTitle: "Communicable › Upper respiratory infection"
    },
    {
      id: "pneumonia", code: "CA40", title: "Pneumonia",
      chapter: "12 · Respiratory system",
      syn: ["pneumonia", "chest infection", "lrti", "consolidation", "lower respiratory"],
      hcd: "HCD-COM-03", hcdTitle: "Communicable › Lower respiratory infection",
      refine: [
        { label: "Bacterial", code: "CA40.0", suffix: ".Bac" },
        { label: "Organism unspecified", code: "CA40.Z", suffix: "" }
      ]
    },
    {
      id: "uti", code: "GC08", title: "Urinary tract infection, site not specified",
      chapter: "16 · Genitourinary system",
      syn: ["uti", "urine infection", "dysuria", "cystitis", "frequency"],
      hcd: "HCD-COM-06", hcdTitle: "Communicable › Urinary tract infection",
      refine: [
        { label: "Due to E. coli", code: "GC08.0", suffix: ".Ec" },
        { label: "Agent unspecified", code: "GC08.Z", suffix: "" }
      ]
    },
    {
      id: "htn", code: "BA00", title: "Essential hypertension",
      chapter: "11 · Circulatory system",
      syn: ["hypertension", "high bp", "htn", "blood pressure", "raised bp"],
      hcd: "HCD-NCD-01", hcdTitle: "Non-communicable › Hypertension"
    },
    {
      id: "dm", code: "5A11", title: "Type 2 diabetes mellitus",
      chapter: "05 · Endocrine, nutritional or metabolic",
      syn: ["diabetes", "type 2", "dm", "sugar", "hyperglycaemia", "t2dm"],
      hcd: "HCD-NCD-02", hcdTitle: "Non-communicable › Diabetes mellitus"
    },
    {
      id: "sickle", code: "3A51", title: "Sickle cell disorders or other haemoglobinopathies",
      chapter: "03 · Blood & blood-forming organs",
      syn: ["sickle", "sickle cell", "scd", "hbss", "crisis", "bone pain"],
      hcd: "HCD-NCD-03", hcdTitle: "Non-communicable › Haemoglobinopathy"
    },
    {
      id: "fracture", code: "NC92", title: "Fracture of forearm",
      chapter: "22 · Injury, poisoning & external causes",
      syn: ["fracture", "broken arm", "radius", "ulna", "forearm", "break"],
      hcd: "HCD-INJ-01", hcdTitle: "Injury › Limb fracture",
      laterality: true
    },
    {
      id: "anaemia", code: "3A9Z", title: "Anaemia, unspecified",
      chapter: "03 · Blood & blood-forming organs",
      syn: ["anaemia", "anemia", "low blood", "pallor", "low pcv"],
      hcd: "HCD-NCD-05", hcdTitle: "Non-communicable › Anaemia"
    }
  ];

  // The common-presentation quick picks for HRGH (ids into INDEX)
  var QUICK = ["malaria", "typhoid", "pneumonia", "uti", "htn", "dm", "sickle", "fracture"];

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return INDEX.map(function (e) {
      var hay = (e.title + " " + e.syn.join(" ") + " " + e.code).toLowerCase();
      var score = 0;
      terms.forEach(function (t) {
        if (e.title.toLowerCase().indexOf(t) === 0) score += 6;        // title prefix
        if (e.syn.some(function (s) { return s.indexOf(t) === 0; })) score += 4; // synonym prefix
        if (hay.indexOf(t) !== -1) score += 2;                          // anywhere
      });
      return { e: e, score: score };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8)
      .map(function (r) { return r.e; });
  }

  window.ICD11 = {
    INDEX: INDEX,
    QUICK: QUICK,
    LAT: LAT,
    search: search,
    byId: function (id) { return INDEX.filter(function (e) { return e.id === id; })[0]; }
  };
})();
