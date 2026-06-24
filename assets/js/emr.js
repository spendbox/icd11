/* =========================================================
   Built-in ICD-11 sample data — the fallback used by the
   live demo when the WHO ICD-11 API is not configured.
   Codes are real ICD-11 MMS codes. Laterality extension
   codes (XK8G/XK9K/XK70) illustrate post-coordination.
   ========================================================= */
(function () {
  "use strict";

  var LAT = [
    { label: "Left",      ext: "XK8G" },
    { label: "Right",     ext: "XK9K" },
    { label: "Bilateral", ext: "XK70" }
  ];

  var ITEMS = [
    { code: "1F40",   title: "Malaria due to Plasmodium falciparum", chapter: "01 · Infectious", syn: ["malaria", "falciparum", "fever", "rdt", "plasmodium", "mp"] },
    { code: "1F40.0", title: "P. falciparum malaria with cerebral complications", chapter: "01 · Infectious", syn: ["cerebral malaria", "severe malaria"] },
    { code: "1F41",   title: "Malaria due to Plasmodium vivax", chapter: "01 · Infectious", syn: ["vivax malaria"] },
    { code: "1F4Z",   title: "Malaria, species unspecified", chapter: "01 · Infectious", syn: ["malaria unspecified"] },
    { code: "1A07",   title: "Typhoid fever", chapter: "01 · Infectious", syn: ["typhoid", "enteric fever", "salmonella", "widal"] },
    { code: "1A40",   title: "Gastroenteritis or colitis of infectious origin", chapter: "01 · Infectious", syn: ["gastroenteritis", "diarrhoea", "diarrhea", "vomiting", "loose stool"] },
    { code: "1G40",   title: "Sepsis", chapter: "01 · Infectious", syn: ["sepsis", "septicaemia", "septicemia"] },
    { code: "1B10",   title: "Tuberculosis of the respiratory system", chapter: "01 · Infectious", syn: ["tuberculosis", "tb", "pulmonary tb", "cough"] },
    { code: "1B10.0", title: "Respiratory tuberculosis, confirmed", chapter: "01 · Infectious", syn: ["tb confirmed", "afb positive"] },
    { code: "CA07",   title: "Acute upper respiratory infection", chapter: "12 · Respiratory", syn: ["urti", "cold", "catarrh", "sore throat", "uri"] },
    { code: "CA40",   title: "Pneumonia", chapter: "12 · Respiratory", syn: ["pneumonia", "chest infection", "lrti"] },
    { code: "CA40.Z", title: "Pneumonia, organism unspecified", chapter: "12 · Respiratory", syn: ["pneumonia unspecified"] },
    { code: "CA23",   title: "Asthma", chapter: "12 · Respiratory", syn: ["asthma", "wheeze", "wheezing"] },
    { code: "GC08",   title: "Urinary tract infection, site not specified", chapter: "16 · Genitourinary", syn: ["uti", "urine infection", "dysuria", "cystitis"] },
    { code: "GC08.0", title: "Urinary tract infection due to Escherichia coli", chapter: "16 · Genitourinary", syn: ["uti e coli", "e coli uti"] },
    { code: "BA00",   title: "Essential hypertension", chapter: "11 · Circulatory", syn: ["hypertension", "high bp", "htn", "blood pressure"] },
    { code: "5A11",   title: "Type 2 diabetes mellitus", chapter: "05 · Endocrine", syn: ["diabetes", "type 2", "dm", "sugar", "t2dm"] },
    { code: "5A10",   title: "Type 1 diabetes mellitus", chapter: "05 · Endocrine", syn: ["type 1 diabetes", "t1dm"] },
    { code: "3A51",   title: "Sickle cell disorders or other haemoglobinopathies", chapter: "03 · Blood", syn: ["sickle", "sickle cell", "scd", "hbss", "crisis"] },
    { code: "3A9Z",   title: "Anaemia, unspecified", chapter: "03 · Blood", syn: ["anaemia", "anemia", "pallor", "low pcv"] },
    { code: "8A80",   title: "Migraine", chapter: "08 · Nervous system", syn: ["migraine", "headache"] },
    { code: "NC32",   title: "Fracture of forearm", chapter: "22 · Injury", syn: ["fracture", "broken arm", "radius", "ulna", "forearm", "broken"] },
    { code: "NC72",   title: "Fracture of femur", chapter: "22 · Injury", syn: ["fracture", "femur", "thigh", "broken leg"] },
    { code: "NC92",   title: "Fracture of lower leg, including ankle", chapter: "22 · Injury", syn: ["fracture", "tibia", "fibula", "ankle", "lower leg"] }
  ];

  var QUICK = ["malaria", "typhoid", "pneumonia", "hypertension", "diabetes", "tuberculosis", "asthma", "fracture"];

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return ITEMS.map(function (e) {
      var hay = (e.title + " " + e.syn.join(" ") + " " + e.code).toLowerCase();
      var sc = 0;
      terms.forEach(function (t) {
        if (e.title.toLowerCase().indexOf(t) === 0) sc += 6;
        if (e.syn.some(function (s) { return s.indexOf(t) === 0; })) sc += 4;
        if (hay.indexOf(t) !== -1) sc += 2;
      });
      return { e: e, sc: sc };
    }).filter(function (r) { return r.sc > 0; })
      .sort(function (a, b) { return b.sc - a.sc; })
      .slice(0, 10)
      .map(function (r) { return r.e; });
  }

  window.ICD11 = { ITEMS: ITEMS, QUICK: QUICK, LAT: LAT, search: search };
})();
