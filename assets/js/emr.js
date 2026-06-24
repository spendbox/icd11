/* =========================================================
   EMR diagnosis-support engine (mock / illustrative)
   Derives a likely diagnosis from a clinical encounter and
   assigns an HCD code and the ICD-11 cluster it maps to.
   This is decision-support for demonstration only.
   ========================================================= */
(function () {
  "use strict";

  /* ---- The symptoms a clinician can tick ---- */
  const SYMPTOMS = [
    { id: "fever",      label: "Fever" },
    { id: "chills",     label: "Chills / rigors" },
    { id: "headache",   label: "Headache" },
    { id: "bodyaches",  label: "Body / joint aches" },
    { id: "cough",      label: "Cough" },
    { id: "breathless", label: "Breathlessness" },
    { id: "chestpain",  label: "Chest pain" },
    { id: "diarrhoea",  label: "Diarrhoea" },
    { id: "vomiting",   label: "Vomiting" },
    { id: "abdopain",   label: "Abdominal pain" },
    { id: "dysuria",    label: "Painful urination" },
    { id: "frequency",  label: "Urinary frequency" },
    { id: "thirst",     label: "Excessive thirst" },
    { id: "polyuria",   label: "Passing lots of urine" },
    { id: "weightloss", label: "Weight loss" },
    { id: "bonepain",   label: "Severe bone pain" },
    { id: "pallor",     label: "Pallor" },
    { id: "jaundice",   label: "Yellow eyes (jaundice)" },
    { id: "nightsweats",label: "Night sweats" },
    { id: "dizziness",  label: "Dizziness" }
  ];

  /* ---- Knowledge base: conditions common at HRGH, Yaba ----
     Each condition scores against findings. Codes are
     representative of ICD-11 and a proposed HCD scheme.       */
  const CONDITIONS = [
    {
      key: "malaria",
      name: "Malaria (uncomplicated)",
      hcd: "HCD-COM-01", hcdDesc: "Communicable › Malaria",
      icd: "1F4Z", icdDesc: "Malaria, Plasmodium species unspecified",
      base: 6,
      symptoms: { fever: 5, chills: 4, headache: 3, bodyaches: 3, vomiting: 1, dizziness: 1 },
      invest: { rdt_pos: 12, rdt_neg: -10 },
      tempBoost: true
    },
    {
      key: "typhoid",
      name: "Typhoid (enteric) fever",
      hcd: "HCD-COM-02", hcdDesc: "Communicable › Enteric fever",
      icd: "1A07", icdDesc: "Typhoid fever",
      base: 4,
      symptoms: { fever: 5, abdopain: 4, headache: 2, diarrhoea: 2, vomiting: 1, bodyaches: 1 },
      invest: { widal_pos: 12, rdt_neg: 2 },
      tempBoost: true
    },
    {
      key: "pneumonia",
      name: "Community-acquired pneumonia",
      hcd: "HCD-COM-03", hcdDesc: "Communicable › Lower respiratory infection",
      icd: "CA40.Z", icdDesc: "Pneumonia, organism unspecified",
      base: 3,
      symptoms: { cough: 5, fever: 4, breathless: 4, chestpain: 3, chills: 1 },
      invest: { cxr_consolidation: 12 },
      tempBoost: true
    },
    {
      key: "urti",
      name: "Acute upper respiratory tract infection",
      hcd: "HCD-COM-04", hcdDesc: "Communicable › Upper respiratory infection",
      icd: "CA07", icdDesc: "Acute upper respiratory infection",
      base: 3,
      symptoms: { cough: 4, headache: 2, fever: 2, bodyaches: 1 },
      invest: {}
    },
    {
      key: "gastro",
      name: "Acute gastroenteritis",
      hcd: "HCD-COM-05", hcdDesc: "Communicable › Gastrointestinal infection",
      icd: "1A40", icdDesc: "Gastroenteritis, presumed infectious",
      base: 3,
      symptoms: { diarrhoea: 5, vomiting: 4, abdopain: 3, fever: 1 },
      invest: {}
    },
    {
      key: "uti",
      name: "Urinary tract infection",
      hcd: "HCD-COM-06", hcdDesc: "Communicable › Urinary tract infection",
      icd: "GC08.0", icdDesc: "Urinary tract infection, site unspecified",
      base: 3,
      symptoms: { dysuria: 5, frequency: 4, abdopain: 2, fever: 2 },
      invest: { urine_nitrite: 12 }
    },
    {
      key: "htn",
      name: "Essential hypertension",
      hcd: "HCD-NCD-01", hcdDesc: "Non-communicable › Hypertension",
      icd: "BA00", icdDesc: "Essential hypertension",
      base: 2,
      symptoms: { headache: 3, dizziness: 3, chestpain: 1 },
      invest: { bp_high: 12 },
      historyKey: "htn"
    },
    {
      key: "dm",
      name: "Type 2 diabetes mellitus",
      hcd: "HCD-NCD-02", hcdDesc: "Non-communicable › Diabetes mellitus",
      icd: "5A11", icdDesc: "Type 2 diabetes mellitus",
      base: 2,
      symptoms: { thirst: 5, polyuria: 5, weightloss: 3, dizziness: 1 },
      invest: { rbs_high: 12 },
      historyKey: "dm"
    },
    {
      key: "sickle",
      name: "Sickle cell vaso-occlusive crisis",
      hcd: "HCD-NCD-03", hcdDesc: "Non-communicable › Haemoglobinopathy crisis",
      icd: "3A51", icdDesc: "Sickle cell disease with crisis",
      base: 1,
      symptoms: { bonepain: 6, bodyaches: 3, pallor: 3, jaundice: 3, fever: 1 },
      invest: {},
      historyKey: "sickle"
    },
    {
      key: "tb",
      name: "Pulmonary tuberculosis",
      hcd: "HCD-COM-07", hcdDesc: "Communicable › Tuberculosis",
      icd: "1B11", icdDesc: "Tuberculosis of the lung",
      base: 1,
      symptoms: { cough: 4, nightsweats: 5, weightloss: 5, fever: 2, chestpain: 1 },
      invest: { cxr_consolidation: 4 }
    }
  ];

  /* ---- Local modifiers (the .xx suffix on an HCD code) ---- */
  function localModifier(cond, ctx) {
    if (cond.key === "malaria") {
      if (ctx.investigation === "rdt_pos") return { suffix: ".Rc", text: "RDT-confirmed", icdExt: " & XS25", icdExtText: "(severity per parasitaemia)" };
      return { suffix: ".Cl", text: "clinical diagnosis, awaiting confirmation", icdExt: "", icdExtText: "" };
    }
    if (cond.key === "pneumonia" && ctx.investigation === "cxr_consolidation") {
      return { suffix: ".Rx", text: "radiologically confirmed", icdExt: "", icdExtText: "" };
    }
    if (cond.key === "uti" && ctx.investigation === "urine_nitrite") {
      return { suffix: ".Ux", text: "urinalysis-supported", icdExt: "", icdExtText: "" };
    }
    if (cond.key === "htn" && ctx.investigation === "bp_high") {
      return { suffix: ".S2", text: "stage per measured BP", icdExt: "", icdExtText: "" };
    }
    if (cond.key === "sickle") {
      return { suffix: ".Vo", text: "vaso-occlusive crisis", icdExt: " & XS25", icdExtText: "(crisis severity)" };
    }
    if (ctx.age != null && ctx.age < 16) {
      return { suffix: ".Pa", text: "paediatric presentation", icdExt: "", icdExtText: "" };
    }
    return { suffix: "", text: "", icdExt: "", icdExtText: "" };
  }

  /* ---- Scoring engine ---- */
  function diagnose(ctx) {
    const ranked = CONDITIONS.map(function (cond) {
      let score = cond.base;
      const reasons = [];

      // symptom matches
      Object.keys(cond.symptoms).forEach(function (sym) {
        if (ctx.symptoms.indexOf(sym) !== -1) {
          score += cond.symptoms[sym];
          const meta = SYMPTOMS.find(function (s) { return s.id === sym; });
          if (meta && cond.symptoms[sym] >= 4) reasons.push(meta.label.toLowerCase() + " is a strong pointer");
          else if (meta) reasons.push(meta.label.toLowerCase() + " supports this");
        }
      });

      // investigation
      if (ctx.investigation && cond.invest && cond.invest[ctx.investigation] != null) {
        const w = cond.invest[ctx.investigation];
        score += w;
        if (w >= 8) reasons.push("the investigation result strongly confirms it");
        else if (w > 0) reasons.push("the investigation result is consistent");
        else reasons.push("a negative test makes this less likely");
      }

      // fever / temperature
      if (cond.tempBoost && ctx.temp >= 38) {
        score += 3;
        reasons.push("documented fever of " + ctx.temp.toFixed(1) + "°C");
      }

      // known history
      if (cond.historyKey && ctx.history === cond.historyKey) {
        score += 8;
        reasons.push("known history on file");
      }

      return { cond: cond, score: Math.max(0, score), reasons: reasons };
    });

    ranked.sort(function (a, b) { return b.score - a.score; });

    const total = ranked.reduce(function (s, r) { return s + r.score; }, 0) || 1;
    ranked.forEach(function (r) { r.pct = Math.round((r.score / total) * 100); });

    return ranked;
  }

  /* expose */
  window.HCD_ENGINE = {
    SYMPTOMS: SYMPTOMS,
    CONDITIONS: CONDITIONS,
    diagnose: diagnose,
    localModifier: localModifier
  };
})();
