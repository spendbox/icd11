/* =========================================================
   Built-in ICD-11 sample data + clinical helpers.

   Used as the fallback for the live coders when the WHO
   ICD-11 API is not reachable (site not on Netlify, or
   WHO credentials not configured).

   Codes are real ICD-11 MMS stem codes. Extension codes
   (Chapter X) illustrate post-coordination clustering:
     laterality  XK8G left · XK9K right · XK70 bilateral
     severity    XS5W mild · XS0T moderate · XS25 severe
   ========================================================= */
(function () {
  "use strict";

  /* ---- Extension dimensions (Chapter X) ---- */
  var EXT_CATS = {
    laterality: { key: "laterality", label: "Laterality", values: [
      { label: "Left", code: "XK8G" }, { label: "Right", code: "XK9K" }, { label: "Bilateral", code: "XK70" } ] },
    severity:   { key: "severity", label: "Severity", values: [
      { label: "Mild", code: "XS5W" }, { label: "Moderate", code: "XS0T" }, { label: "Severe", code: "XS25" } ] },
    course:     { key: "course", label: "Temporality / course", values: [
      { label: "Acute", code: "XT8W" }, { label: "Chronic", code: "XT5R" }, { label: "Recurrent", code: "XT4F" }, { label: "In remission", code: "XT2P" } ] },
    injury:     { key: "injury", label: "Type of injury", values: [
      { label: "Open", code: "XK4M" }, { label: "Closed", code: "XK5N" }, { label: "Displaced", code: "XK6P" }, { label: "Non-displaced", code: "XK7Q" } ] },
    topology:   { key: "topology", label: "Anatomical relation", values: [
      { label: "Proximal", code: "XK9R" }, { label: "Distal", code: "XK8S" }, { label: "Upper", code: "XK3T" }, { label: "Lower", code: "XK2U" } ] },
    certainty:  { key: "certainty", label: "Diagnosis certainty", values: [
      { label: "Confirmed", code: "XY7A" }, { label: "Suspected", code: "XY6B" }, { label: "Provisional", code: "XY5C" } ] }
  };

  /* Back-compat shape ({label,ext}) for the encounter coder. */
  var EXT = {
    laterality: { key: "laterality", label: "Laterality", options: EXT_CATS.laterality.values.map(function (v) { return { label: v.label, ext: v.code }; }) },
    severity:   { key: "severity",   label: "Severity",   options: EXT_CATS.severity.values.map(function (v) { return { label: v.label, ext: v.code }; }) }
  };

  /* Context-aware inference — drives which extensions are SUGGESTED for a
     given diagnosis (works for built-in items and live WHO results alike).
     Laterality/severity codes are the commonly-cited real ones; the other
     example codes illustrate post-coordination. */
  var LATERAL_RE   = /\b(fracture|dislocation|sprain|cataract|glaucoma|conjunctivit|otitis|breast|kidney|renal|ovar|testic|eye|eyelid|ear|limb|arm|leg|hand|foot|knee|hip|shoulder|ankle|wrist|elbow|femur|tibia|fibula|radius|ulna|humerus|clavicle|cellulitis|hernia|burn)\b/;
  var SEVERITY_RE  = /\b(malaria|pneumonia|asthma|copd|chronic obstructive|sepsis|septic|depress|anaemia|anemia|dengue|undernutrition|malnutrition|burn|dehydrat|tuberculosis|bronchiolitis|pre-?eclampsia|pancreatitis)\b/;
  var INJURY_RE    = /\b(fracture|dislocation|sprain|burn|wound|laceration|amputat|injur)\b/;
  var INFECTION_RE = /\b(malaria|pneumonia|sepsis|septic|tuberculosis|infection|infective|hepatitis|hiv|covid|dengue|cellulitis|uti|urinary tract infection|typhoid|cholera|measles|meningitis|gastroenteritis|conjunctivit|leprosy|amoebiasis)\b/;
  var CHRONIC_RE   = /\b(hypertension|diabetes|asthma|copd|chronic|kidney disease|ckd|heart failure|arthritis|epilepsy|depress|anxiety|obesity|hypothyroid|thyrotox|migraine|sickle)\b/;
  var NEOPLASM_RE  = /\b(cancer|neoplasm|tumour|tumor|carcinoma|sarcoma|leiomyoma|fibroid|malignant)\b/;

  /* laterality/severity only — used by the encounter coder to pre-apply
     extensions detected in free text. */
  function applicableExt(title) {
    var t = (title || "").toLowerCase();
    var dims = [];
    if (LATERAL_RE.test(t)) dims.push("laterality");
    if (SEVERITY_RE.test(t) || INFECTION_RE.test(t)) dims.push("severity");
    return dims;
  }

  /* Context-aware SUGGESTED categories — genuinely varies by diagnosis. */
  function suggestExt(title) {
    var t = (title || "").toLowerCase();
    var cats = [];
    function add(c) { if (cats.indexOf(c) === -1) cats.push(c); }
    if (INJURY_RE.test(t)) { add("injury"); add("laterality"); add("severity"); }
    else if (LATERAL_RE.test(t)) { add("laterality"); add("severity"); }
    if (INFECTION_RE.test(t)) { add("severity"); add("course"); add("certainty"); }
    if (CHRONIC_RE.test(t)) { add("severity"); add("course"); }
    if (NEOPLASM_RE.test(t)) { add("laterality"); add("topology"); add("certainty"); }
    if (!cats.length) { add("severity"); add("certainty"); }   // never empty
    return cats;
  }

  /* Flat catalogue so the user can SEARCH and add ANY extension. */
  var EXT_CATALOG = (function () {
    var a = [];
    Object.keys(EXT_CATS).forEach(function (k) {
      EXT_CATS[k].values.forEach(function (v) {
        a.push({ cat: k, catLabel: EXT_CATS[k].label, label: v.label, code: v.code });
      });
    });
    return a;
  })();

  function extSearch(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return EXT_CATALOG.slice();
    return EXT_CATALOG.filter(function (e) {
      return (e.label + " " + e.code + " " + e.catLabel).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---- Clinical course / status (encounter annotations, NOT codes) ---- */
  var COURSE = ["Admitted for", "Active", "Stable", "Improving", "Worsening", "Uncontrolled", "Resolving"];

  var ITEMS = [
    /* ---- 01 · Infectious & parasitic ---- */
    { code: "1F40",   title: "Malaria due to Plasmodium falciparum", chapter: "01 · Infectious", syn: ["malaria", "falciparum", "fever", "rdt", "plasmodium", "mp"] },
    { code: "1F40.0", title: "P. falciparum malaria with cerebral complications", chapter: "01 · Infectious", syn: ["cerebral malaria", "severe malaria"] },
    { code: "1F41",   title: "Malaria due to Plasmodium vivax", chapter: "01 · Infectious", syn: ["vivax malaria"] },
    { code: "1F4Z",   title: "Malaria, species unspecified", chapter: "01 · Infectious", syn: ["malaria unspecified"] },
    { code: "1A07",   title: "Typhoid fever", chapter: "01 · Infectious", syn: ["typhoid", "enteric fever", "salmonella", "widal"] },
    { code: "1A00",   title: "Cholera", chapter: "01 · Infectious", syn: ["cholera", "vibrio", "rice water stool"] },
    { code: "1A40",   title: "Gastroenteritis or colitis of infectious origin", chapter: "01 · Infectious", syn: ["gastroenteritis", "diarrhoea", "diarrhea", "vomiting", "loose stool", "gastritis infective"] },
    { code: "1G40",   title: "Sepsis", chapter: "01 · Infectious", syn: ["sepsis", "septicaemia", "septicemia", "blood infection"] },
    { code: "1B10",   title: "Tuberculosis of the respiratory system", chapter: "01 · Infectious", syn: ["tuberculosis", "tb", "pulmonary tb", "cough"] },
    { code: "1B10.0", title: "Respiratory tuberculosis, confirmed", chapter: "01 · Infectious", syn: ["tb confirmed", "afb positive"] },
    { code: "1C62",   title: "HIV disease", chapter: "01 · Infectious", syn: ["hiv", "aids", "retroviral", "rvd"] },
    { code: "1E50.0", title: "COVID-19, virus identified", chapter: "01 · Infectious", syn: ["covid", "covid-19", "coronavirus", "sars-cov-2"] },
    { code: "1E31",   title: "Dengue fever", chapter: "01 · Infectious", syn: ["dengue", "breakbone fever"] },
    { code: "1D60",   title: "Measles", chapter: "01 · Infectious", syn: ["measles", "rubeola"] },
    { code: "1F00",   title: "Amoebiasis", chapter: "01 · Infectious", syn: ["amoebiasis", "amebiasis", "entamoeba"] },
    { code: "1B70",   title: "Leprosy", chapter: "01 · Infectious", syn: ["leprosy", "hansen"] },

    /* ---- 02 · Neoplasms ---- */
    { code: "2C25",   title: "Malignant neoplasms of breast", chapter: "02 · Neoplasms", syn: ["breast cancer", "breast tumour", "breast lump"] },
    { code: "2C61",   title: "Malignant neoplasm of prostate", chapter: "02 · Neoplasms", syn: ["prostate cancer", "prostate"] },
    { code: "2B90",   title: "Malignant neoplasms of cervix uteri", chapter: "02 · Neoplasms", syn: ["cervical cancer", "cervix cancer"] },
    { code: "2C10",   title: "Malignant neoplasms of liver", chapter: "02 · Neoplasms", syn: ["liver cancer", "hepatocellular", "hcc"] },
    { code: "2E86",   title: "Leiomyoma of uterus", chapter: "02 · Neoplasms", syn: ["fibroid", "fibroids", "uterine fibroid", "leiomyoma", "myoma"] },

    /* ---- 03 · Blood ---- */
    { code: "3A51",   title: "Sickle cell disorders or other haemoglobinopathies", chapter: "03 · Blood", syn: ["sickle", "sickle cell", "scd", "hbss", "crisis"] },
    { code: "3A00",   title: "Iron deficiency anaemia", chapter: "03 · Blood", syn: ["iron deficiency", "iron anaemia", "iron anemia"] },
    { code: "3A9Z",   title: "Anaemia, unspecified", chapter: "03 · Blood", syn: ["anaemia", "anemia", "pallor", "low pcv", "low haemoglobin"] },

    /* ---- 05 · Endocrine, nutritional & metabolic ---- */
    { code: "5A11",   title: "Type 2 diabetes mellitus", chapter: "05 · Endocrine", syn: ["diabetes", "type 2", "dm", "sugar", "t2dm"] },
    { code: "5A10",   title: "Type 1 diabetes mellitus", chapter: "05 · Endocrine", syn: ["type 1 diabetes", "t1dm"] },
    { code: "5A00",   title: "Hypothyroidism", chapter: "05 · Endocrine", syn: ["hypothyroid", "low thyroid", "myxoedema"] },
    { code: "5A02",   title: "Thyrotoxicosis", chapter: "05 · Endocrine", syn: ["hyperthyroid", "thyrotoxicosis", "graves"] },
    { code: "5B81",   title: "Obesity", chapter: "05 · Endocrine", syn: ["obesity", "overweight", "high bmi"] },
    { code: "5B50",   title: "Undernutrition", chapter: "05 · Endocrine", syn: ["malnutrition", "undernutrition", "wasting"] },

    /* ---- 06 · Mental & behavioural ---- */
    { code: "6A70",   title: "Single episode depressive disorder", chapter: "06 · Mental health", syn: ["depression", "depressive", "low mood"] },
    { code: "6B00",   title: "Generalised anxiety disorder", chapter: "06 · Mental health", syn: ["anxiety", "gad", "worry"] },
    { code: "6A20",   title: "Schizophrenia", chapter: "06 · Mental health", syn: ["schizophrenia", "psychosis"] },

    /* ---- 08 · Nervous system ---- */
    { code: "8A80",   title: "Migraine", chapter: "08 · Nervous system", syn: ["migraine", "headache"] },
    { code: "8A60",   title: "Epilepsy", chapter: "08 · Nervous system", syn: ["epilepsy", "seizure", "convulsion", "fits"] },
    { code: "8B00",   title: "Stroke not known if ischaemic or haemorrhagic", chapter: "08 · Nervous system", syn: ["stroke", "cva", "cerebrovascular"] },

    /* ---- 09 · Visual system ---- */
    { code: "9B71",   title: "Cataract", chapter: "09 · Visual system", syn: ["cataract", "cloudy lens"] },
    { code: "9C61",   title: "Glaucoma", chapter: "09 · Visual system", syn: ["glaucoma", "raised iop"] },
    { code: "1C81",   title: "Conjunctivitis", chapter: "09 · Visual system", syn: ["conjunctivitis", "red eye", "apollo"] },

    /* ---- 11 · Circulatory ---- */
    { code: "BA00",   title: "Essential hypertension", chapter: "11 · Circulatory", syn: ["hypertension", "high bp", "htn", "blood pressure", "raised bp"] },
    { code: "BA40",   title: "Heart failure", chapter: "11 · Circulatory", syn: ["heart failure", "ccf", "chf", "cardiac failure"] },
    { code: "BA41",   title: "Acute myocardial infarction", chapter: "11 · Circulatory", syn: ["heart attack", "myocardial infarction", "mi", "stemi"] },
    { code: "8B20",   title: "Cerebral ischaemic stroke", chapter: "11 · Circulatory", syn: ["ischaemic stroke", "ischemic stroke"] },

    /* ---- 12 · Respiratory ---- */
    { code: "CA07",   title: "Acute upper respiratory infection", chapter: "12 · Respiratory", syn: ["urti", "cold", "catarrh", "sore throat", "uri"] },
    { code: "CA40",   title: "Pneumonia", chapter: "12 · Respiratory", syn: ["pneumonia", "chest infection", "lrti", "cap"] },
    { code: "CA40.Z", title: "Pneumonia, organism unspecified", chapter: "12 · Respiratory", syn: ["pneumonia unspecified"] },
    { code: "CA23",   title: "Asthma", chapter: "12 · Respiratory", syn: ["asthma", "wheeze", "wheezing"] },
    { code: "CA22",   title: "Chronic obstructive pulmonary disease", chapter: "12 · Respiratory", syn: ["copd", "emphysema", "chronic bronchitis"] },

    /* ---- 13 · Digestive ---- */
    { code: "DA60",   title: "Peptic ulcer", chapter: "13 · Digestive", syn: ["peptic ulcer", "gastric ulcer", "duodenal ulcer", "pud"] },
    { code: "DA63",   title: "Gastritis", chapter: "13 · Digestive", syn: ["gastritis", "epigastric pain"] },
    { code: "DA90",   title: "Appendicitis", chapter: "13 · Digestive", syn: ["appendicitis", "appendix"] },
    { code: "DC30",   title: "Hernia of abdominal wall", chapter: "13 · Digestive", syn: ["hernia", "inguinal hernia"] },

    /* ---- 14 · Skin ---- */
    { code: "EA80",   title: "Dermatitis", chapter: "14 · Skin", syn: ["dermatitis", "eczema", "rash"] },
    { code: "1B72",   title: "Cellulitis", chapter: "14 · Skin", syn: ["cellulitis", "skin infection"] },

    /* ---- 15 · Musculoskeletal ---- */
    { code: "FA20",   title: "Osteoarthritis", chapter: "15 · Musculoskeletal", syn: ["osteoarthritis", "oa", "joint pain", "arthritis"] },
    { code: "FA01",   title: "Rheumatoid arthritis", chapter: "15 · Musculoskeletal", syn: ["rheumatoid", "ra"] },
    { code: "ME84.2", title: "Low back pain", chapter: "15 · Musculoskeletal", syn: ["back pain", "low back pain", "lbp", "lumbago"] },

    /* ---- 16 · Genitourinary ---- */
    { code: "GC08",   title: "Urinary tract infection, site not specified", chapter: "16 · Genitourinary", syn: ["uti", "urine infection", "dysuria", "cystitis"] },
    { code: "GC08.0", title: "Urinary tract infection due to Escherichia coli", chapter: "16 · Genitourinary", syn: ["uti e coli", "e coli uti"] },
    { code: "GB61",   title: "Acute kidney failure", chapter: "16 · Genitourinary", syn: ["acute kidney injury", "aki", "renal failure"] },
    { code: "GB6Z",   title: "Chronic kidney disease", chapter: "16 · Genitourinary", syn: ["ckd", "chronic kidney"] },
    { code: "GA15",   title: "Menorrhagia", chapter: "16 · Genitourinary", syn: ["menorrhagia", "heavy periods", "heavy menstrual bleeding"] },

    /* ---- 18 · Pregnancy & childbirth ---- */
    { code: "JA24",   title: "Pre-eclampsia", chapter: "18 · Pregnancy", syn: ["pre-eclampsia", "preeclampsia", "pregnancy hypertension"] },
    { code: "JB40",   title: "Single spontaneous delivery", chapter: "18 · Pregnancy", syn: ["delivery", "labour", "labor", "childbirth"] },

    /* ---- 22 · Injury, poisoning ---- */
    { code: "NC32",   title: "Fracture of forearm", chapter: "22 · Injury", syn: ["fracture", "broken arm", "radius", "ulna", "forearm", "broken"] },
    { code: "NC72",   title: "Fracture of femur", chapter: "22 · Injury", syn: ["fracture", "femur", "thigh", "broken leg"] },
    { code: "NC92",   title: "Fracture of lower leg, including ankle", chapter: "22 · Injury", syn: ["fracture", "tibia", "fibula", "ankle", "lower leg"] },
    { code: "NA07",   title: "Fracture of skull or facial bones", chapter: "22 · Injury", syn: ["skull fracture", "head injury"] },
    { code: "ND56",   title: "Burn of skin", chapter: "22 · Injury", syn: ["burn", "scald"] }
  ];

  /* ---- Clinical shorthand → ICD-11 code (so a doctor can type "T2DM") ---- */
  var ABBREV = {
    t2dm: "5A11", "t2 dm": "5A11", t1dm: "5A10", dm: "5A11", htn: "BA00",
    ccf: "BA40", chf: "BA40", mi: "BA41", stemi: "BA41", copd: "CA22",
    uti: "GC08", tb: "1B10", pud: "DA60", aki: "GB61", ckd: "GB6Z",
    hiv: "1C62", scd: "3A51", oa: "FA20", ra: "FA01", urti: "CA07",
    cap: "CA40", lrti: "CA40", uri: "CA07", cva: "8B00", ihd: "BA41",
    gca: "1A40", ge: "1A40", "ca breast": "2C25"
  };

  var QUICK = ["malaria", "typhoid", "pneumonia", "hypertension", "diabetes", "tuberculosis", "asthma", "fracture", "uti", "sickle cell"];

  function byCode(code) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].code === code) return ITEMS[i];
    return null;
  }

  function expandAbbrev(term) {
    var k = (term || "").trim().toLowerCase();
    return ABBREV[k] ? byCode(ABBREV[k]) : null;
  }

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    var out = [];
    var seen = {};
    var abbr = expandAbbrev(q);            // exact shorthand wins, placed first
    if (abbr) { out.push(abbr); seen[abbr.code] = true; }

    var terms = q.split(/\s+/);
    ITEMS.map(function (e) {
      var title = e.title.toLowerCase();
      var hay = (title + " " + e.syn.join(" ") + " " + e.code).toLowerCase();
      var sc = 0;
      terms.forEach(function (t) {
        var numeric = /^[0-9]+$/.test(t);   // a bare "2" shouldn't match every chapter-2 code
        if (title.indexOf(t) === 0) sc += 6;
        if (e.syn.some(function (s) { return s.indexOf(t) === 0; })) sc += 4;
        if (!numeric && t.length >= 2 && e.code.toLowerCase().indexOf(t) === 0) sc += 5;
        if (!numeric && t.length >= 3 && hay.indexOf(t) !== -1) sc += 2;
      });
      return { e: e, sc: sc };
    }).filter(function (r) { return r.sc > 0; })
      .sort(function (a, b) { return b.sc - a.sc; })
      .forEach(function (r) { if (!seen[r.e.code]) { seen[r.e.code] = true; out.push(r.e); } });

    return out.slice(0, 10);
  }

  window.ICD11 = {
    ITEMS: ITEMS, QUICK: QUICK, EXT: EXT, EXT_CATS: EXT_CATS, EXT_CATALOG: EXT_CATALOG,
    COURSE: COURSE, ABBREV: ABBREV,
    LAT: EXT_CATS.laterality.values,        // back-compat
    applicableExt: applicableExt,
    suggestExt: suggestExt,
    extSearch: extSearch,
    expandAbbrev: expandAbbrev,
    byCode: byCode,
    search: search
  };
})();
