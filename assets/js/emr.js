/* =========================================================
   Built-in ICD-11 sample data — the fallback used by the
   live coder when the WHO ICD-11 API is not reachable
   (e.g. the site is not hosted on Netlify, or the WHO
   credentials are not configured).

   Codes are real ICD-11 MMS stem codes. The extension
   codes (laterality / severity) illustrate how
   post-coordination clustering works.
   ========================================================= */
(function () {
  "use strict";

  /* Extension dimensions for post-coordination. The live coder
     lets you bolt one value from each group onto a stem code. */
  var EXT_GROUPS = [
    {
      key: "laterality",
      label: "Laterality",
      options: [
        { label: "Left",      ext: "XK8G" },
        { label: "Right",     ext: "XK9K" },
        { label: "Bilateral", ext: "XK70" }
      ]
    },
    {
      key: "severity",
      label: "Severity",
      options: [
        { label: "Mild",     ext: "XS5W" },
        { label: "Moderate", ext: "XS0T" },
        { label: "Severe",   ext: "XS25" }
      ]
    }
  ];

  /* Back-compat: older callers used ICD11.LAT for laterality. */
  var LAT = EXT_GROUPS[0].options;

  var ITEMS = [
    /* ---- 01 · Infectious & parasitic ---- */
    { code: "1F40",   title: "Malaria due to Plasmodium falciparum", chapter: "01 · Infectious", syn: ["malaria", "falciparum", "fever", "rdt", "plasmodium", "mp"] },
    { code: "1F40.0", title: "P. falciparum malaria with cerebral complications", chapter: "01 · Infectious", syn: ["cerebral malaria", "severe malaria"] },
    { code: "1F41",   title: "Malaria due to Plasmodium vivax", chapter: "01 · Infectious", syn: ["vivax malaria"] },
    { code: "1F4Z",   title: "Malaria, species unspecified", chapter: "01 · Infectious", syn: ["malaria unspecified"] },
    { code: "1A07",   title: "Typhoid fever", chapter: "01 · Infectious", syn: ["typhoid", "enteric fever", "salmonella", "widal"] },
    { code: "1A00",   title: "Cholera", chapter: "01 · Infectious", syn: ["cholera", "vibrio", "rice water stool"] },
    { code: "1A40",   title: "Gastroenteritis or colitis of infectious origin", chapter: "01 · Infectious", syn: ["gastroenteritis", "diarrhoea", "diarrhea", "vomiting", "loose stool"] },
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

    /* ---- 03 · Blood ---- */
    { code: "3A51",   title: "Sickle cell disorders or other haemoglobinopathies", chapter: "03 · Blood", syn: ["sickle", "sickle cell", "scd", "hbss", "crisis"] },
    { code: "3A00",   title: "Iron deficiency anaemia", chapter: "03 · Blood", syn: ["iron deficiency", "iron anaemia", "iron anemia"] },
    { code: "3A9Z",   title: "Anaemia, unspecified", chapter: "03 · Blood", syn: ["anaemia", "anemia", "pallor", "low pcv"] },

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
    { code: "1C62.1", title: "Conjunctivitis", chapter: "09 · Visual system", syn: ["conjunctivitis", "red eye", "apollo"] },

    /* ---- 11 · Circulatory ---- */
    { code: "BA00",   title: "Essential hypertension", chapter: "11 · Circulatory", syn: ["hypertension", "high bp", "htn", "blood pressure"] },
    { code: "BA40",   title: "Heart failure", chapter: "11 · Circulatory", syn: ["heart failure", "ccf", "chf", "cardiac failure"] },
    { code: "BA41",   title: "Acute myocardial infarction", chapter: "11 · Circulatory", syn: ["heart attack", "myocardial infarction", "mi", "stemi"] },
    { code: "8B20",   title: "Cerebral ischaemic stroke", chapter: "11 · Circulatory", syn: ["ischaemic stroke", "ischemic stroke"] },

    /* ---- 12 · Respiratory ---- */
    { code: "CA07",   title: "Acute upper respiratory infection", chapter: "12 · Respiratory", syn: ["urti", "cold", "catarrh", "sore throat", "uri"] },
    { code: "CA40",   title: "Pneumonia", chapter: "12 · Respiratory", syn: ["pneumonia", "chest infection", "lrti"] },
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

  var QUICK = ["malaria", "typhoid", "pneumonia", "hypertension", "diabetes", "tuberculosis", "asthma", "fracture", "uti", "sickle cell"];

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return ITEMS.map(function (e) {
      var title = e.title.toLowerCase();
      var hay = (title + " " + e.syn.join(" ") + " " + e.code).toLowerCase();
      var sc = 0;
      terms.forEach(function (t) {
        if (title.indexOf(t) === 0) sc += 6;                                   // title starts with term
        if (e.syn.some(function (s) { return s.indexOf(t) === 0; })) sc += 4;  // synonym starts with term
        if (e.code.toLowerCase().indexOf(t) === 0) sc += 5;                    // code prefix match
        if (hay.indexOf(t) !== -1) sc += 2;                                    // appears anywhere
      });
      return { e: e, sc: sc };
    }).filter(function (r) { return r.sc > 0; })
      .sort(function (a, b) { return b.sc - a.sc; })
      .slice(0, 10)
      .map(function (r) { return r.e; });
  }

  window.ICD11 = { ITEMS: ITEMS, QUICK: QUICK, LAT: LAT, EXT_GROUPS: EXT_GROUPS, search: search };
})();
