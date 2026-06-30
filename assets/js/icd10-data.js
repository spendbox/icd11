/* =========================================================
   ICD-10 sample dataset + search.
   A teaching subset of common ward diagnoses with everyday
   synonyms, so the suggestion-pill demos can map free text
   ("htn", "fungal ear infection") to ICD-10 codes offline.
   Codes are illustrative; titles follow WHO ICD-10 (2019).
   ========================================================= */
window.ICD10 = (function () {
  "use strict";

  var ITEMS = [
    // circulatory
    { code: "I10",   title: "Essential (primary) hypertension", chapter: "IX Circulatory", terms: ["hypertension", "htn", "high blood pressure", "high bp", "raised bp", "elevated bp", "hypertensive"] },
    { code: "I50.9", title: "Heart failure, unspecified", chapter: "IX Circulatory", terms: ["heart failure", "ccf", "chf", "cardiac failure", "congestive cardiac failure", "decompensated heart failure"] },
    { code: "I21.9", title: "Acute myocardial infarction, unspecified", chapter: "IX Circulatory", terms: ["mi", "heart attack", "myocardial infarction", "acute mi", "ami", "stemi", "nstemi", "cardiac infarction"] },
    { code: "I63.9", title: "Cerebral infarction, unspecified", chapter: "IX Circulatory", terms: ["stroke", "ischaemic stroke", "ischemic stroke", "cva", "cerebral infarction", "brain attack"] },
    { code: "I64",   title: "Stroke, not specified as haemorrhage or infarction", chapter: "IX Circulatory", terms: ["stroke", "cva", "cerebrovascular accident"] },
    { code: "I48.9", title: "Atrial fibrillation and flutter", chapter: "IX Circulatory", terms: ["af", "atrial fibrillation", "afib", "irregular pulse"] },
    { code: "I83.9", title: "Varicose veins of lower extremities", chapter: "IX Circulatory", terms: ["varicose veins", "varicosities"] },

    // endocrine / metabolic
    { code: "E11.9", title: "Type 2 diabetes mellitus without complications", chapter: "IV Endocrine", terms: ["t2dm", "type 2 diabetes", "diabetes", "dm", "niddm", "type ii diabetes", "sugar"] },
    { code: "E11.2", title: "Type 2 diabetes mellitus with renal complications", chapter: "IV Endocrine", terms: ["diabetic nephropathy", "t2dm with renal", "diabetic kidney"] },
    { code: "E10.9", title: "Type 1 diabetes mellitus without complications", chapter: "IV Endocrine", terms: ["t1dm", "type 1 diabetes", "iddm", "type i diabetes"] },
    { code: "E78.5", title: "Hyperlipidaemia, unspecified", chapter: "IV Endocrine", terms: ["dyslipidaemia", "dyslipidemia", "high cholesterol", "hyperlipidaemia", "hyperlipidemia", "raised lipids"] },
    { code: "E66.9", title: "Obesity, unspecified", chapter: "IV Endocrine", terms: ["obesity", "obese", "overweight"] },
    { code: "E05.9", title: "Thyrotoxicosis, unspecified", chapter: "IV Endocrine", terms: ["hyperthyroidism", "thyrotoxicosis", "overactive thyroid", "graves"] },
    { code: "E03.9", title: "Hypothyroidism, unspecified", chapter: "IV Endocrine", terms: ["hypothyroidism", "underactive thyroid", "low thyroid"] },

    // infectious
    { code: "B54",   title: "Unspecified malaria", chapter: "I Infectious", terms: ["malaria", "fever malaria"] },
    { code: "B50.9", title: "Plasmodium falciparum malaria, unspecified", chapter: "I Infectious", terms: ["falciparum malaria", "severe malaria", "complicated malaria"] },
    { code: "A01.0", title: "Typhoid fever", chapter: "I Infectious", terms: ["typhoid", "enteric fever", "typhoid fever"] },
    { code: "A09",   title: "Diarrhoea and gastroenteritis of presumed infectious origin", chapter: "I Infectious", terms: ["gastroenteritis", "diarrhoea", "diarrhea", "ge", "loose stool", "ad", "acute gastroenteritis"] },
    { code: "A15.0", title: "Tuberculosis of lung, confirmed", chapter: "I Infectious", terms: ["tb", "tuberculosis", "ptb", "pulmonary tuberculosis", "koch"] },
    { code: "B24",   title: "Unspecified human immunodeficiency virus [HIV] disease", chapter: "I Infectious", terms: ["hiv", "aids", "retroviral disease", "rvd"] },
    { code: "A41.9", title: "Sepsis, unspecified organism", chapter: "I Infectious", terms: ["sepsis", "septicaemia", "septicemia", "septic", "bloodstream infection"] },
    { code: "A90",   title: "Dengue fever", chapter: "I Infectious", terms: ["dengue"] },
    { code: "B86",   title: "Scabies", chapter: "I Infectious", terms: ["scabies", "itch mite"] },
    { code: "B36.9", title: "Superficial mycosis, unspecified", chapter: "I Infectious", terms: ["otomycosis", "superficial fungal infection", "fungal infection skin"] },

    // respiratory
    { code: "J45.9", title: "Asthma, unspecified", chapter: "X Respiratory", terms: ["asthma", "reactive airway", "bronchial asthma", "wheeze"] },
    { code: "J44.9", title: "Chronic obstructive pulmonary disease, unspecified", chapter: "X Respiratory", terms: ["copd", "chronic obstructive pulmonary disease", "emphysema", "chronic bronchitis"] },
    { code: "J18.9", title: "Pneumonia, unspecified organism", chapter: "X Respiratory", terms: ["pneumonia", "lrti", "chest infection", "lower respiratory tract infection", "cap"] },
    { code: "J06.9", title: "Acute upper respiratory infection, unspecified", chapter: "X Respiratory", terms: ["urti", "common cold", "catarrh", "upper respiratory tract infection"] },
    { code: "J02.9", title: "Acute pharyngitis, unspecified", chapter: "X Respiratory", terms: ["sore throat", "pharyngitis"] },
    { code: "J03.9", title: "Acute tonsillitis, unspecified", chapter: "X Respiratory", terms: ["tonsillitis"] },

    // ENT (ear)
    { code: "H60.9", title: "Otitis externa, unspecified", chapter: "VIII Ear", terms: ["otitis externa", "outer ear infection", "swimmer's ear", "ear infection outer"] },
    { code: "H60.3", title: "Other infective otitis externa", chapter: "VIII Ear", terms: ["infective otitis externa", "diffuse otitis externa", "acute otitis externa"] },
    { code: "H60.8", title: "Other otitis externa (incl. chronic otitis externa)", chapter: "VIII Ear", terms: ["chronic otitis externa", "recurrent otitis externa"] },
    { code: "H62.2", title: "Otitis externa in mycoses", chapter: "VIII Ear", terms: ["otomycosis", "fungal otitis externa", "fungal ear infection", "fungal ear", "ear fungus"] },
    { code: "H66.9", title: "Otitis media, unspecified", chapter: "VIII Ear", terms: ["otitis media", "middle ear infection", "ear infection", "om"] },

    // digestive
    { code: "K27.9", title: "Peptic ulcer, site unspecified", chapter: "XI Digestive", terms: ["pud", "peptic ulcer", "ulcer", "peptic ulcer disease"] },
    { code: "K29.7", title: "Gastritis, unspecified", chapter: "XI Digestive", terms: ["gastritis", "epigastric pain", "dyspepsia"] },
    { code: "K35.8", title: "Acute appendicitis, other and unspecified", chapter: "XI Digestive", terms: ["appendicitis", "acute appendicitis"] },

    // genitourinary / renal
    { code: "N39.0", title: "Urinary tract infection, site not specified", chapter: "XIV Genitourinary", terms: ["uti", "urinary tract infection", "cystitis", "urine infection"] },
    { code: "N18.9", title: "Chronic kidney disease, unspecified", chapter: "XIV Genitourinary", terms: ["ckd", "chronic kidney disease", "chronic renal failure", "renal impairment"] },
    { code: "N17.9", title: "Acute kidney injury, unspecified", chapter: "XIV Genitourinary", terms: ["aki", "acute kidney injury", "acute renal failure", "arf"] },
    { code: "N40",   title: "Hyperplasia of prostate", chapter: "XIV Genitourinary", terms: ["bph", "benign prostatic hyperplasia", "enlarged prostate", "prostate enlargement"] },

    // blood
    { code: "D50.9", title: "Iron deficiency anaemia, unspecified", chapter: "III Blood", terms: ["iron deficiency anaemia", "ida", "iron deficiency", "anaemia", "anemia"] },
    { code: "D64.9", title: "Anaemia, unspecified", chapter: "III Blood", terms: ["anaemia", "anemia", "low blood", "low haemoglobin"] },
    { code: "D57.0", title: "Sickle-cell anaemia with crisis", chapter: "III Blood", terms: ["sickle cell crisis", "vaso-occlusive crisis", "scd crisis", "bone pain crisis"] },
    { code: "D57.1", title: "Sickle-cell anaemia without crisis", chapter: "III Blood", terms: ["sickle cell", "scd", "sickle cell disease", "hbss"] },

    // obstetric
    { code: "O80",   title: "Single spontaneous delivery", chapter: "XV Pregnancy", terms: ["normal delivery", "svd", "spontaneous delivery", "vaginal delivery"] },
    { code: "O14.9", title: "Pre-eclampsia, unspecified", chapter: "XV Pregnancy", terms: ["pre-eclampsia", "preeclampsia", "pet", "pregnancy hypertension"] },

    // injury / msk
    { code: "S52.9", title: "Fracture of forearm, part unspecified", chapter: "XIX Injury", terms: ["forearm fracture", "fracture forearm", "broken forearm"] },
    { code: "S72.9", title: "Fracture of femur, part unspecified", chapter: "XIX Injury", terms: ["femur fracture", "fractured femur", "broken thigh"] },
    { code: "M54.5", title: "Low back pain", chapter: "XIII Musculoskeletal", terms: ["low back pain", "lbp", "backache", "lumbago"] },
    { code: "M17.9", title: "Osteoarthritis of knee, unspecified", chapter: "XIII Musculoskeletal", terms: ["knee osteoarthritis", "oa knee", "knee arthritis"] },

    // skin
    { code: "L30.9", title: "Dermatitis, unspecified", chapter: "XII Skin", terms: ["dermatitis", "eczema", "rash", "skin rash"] },

    // neuro / mental
    { code: "G43.9", title: "Migraine, unspecified", chapter: "VI Nervous", terms: ["migraine"] },
    { code: "R51",   title: "Headache", chapter: "XVIII Symptoms", terms: ["headache", "cephalalgia"] },
    { code: "F32.9", title: "Depressive episode, unspecified", chapter: "V Mental", terms: ["depression", "depressive episode", "low mood"] },
    { code: "F41.9", title: "Anxiety disorder, unspecified", chapter: "V Mental", terms: ["anxiety", "anxiety disorder", "gad"] }
  ];

  function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }

  // Score one item against a query string.
  function scoreItem(it, q) {
    if (!q) return 0;
    var score = 0, title = norm(it.title);
    var terms = (it.terms || []).map(norm);
    terms.forEach(function (t) {
      if (t === q) score += 100;
      else if (t.indexOf(q) === 0) score += 45;
      else if (t.indexOf(q) >= 0) score += 22;
    });
    if (title === q) score += 90;
    else if (title.indexOf(q) === 0) score += 32;
    else if (title.indexOf(q) >= 0) score += 18;
    // token overlap (whole-word), so multi-word phrases still match
    // without short tokens like "ear" matching inside "forearm".
    norm(q).split(" ").forEach(function (tk) {
      if (tk.length < 3) return;
      var re = new RegExp("\\b" + tk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
      if (re.test(title)) score += 6;
      terms.forEach(function (t) { if (re.test(t)) score += 4; });
    });
    return score;
  }

  function search(q, limit) {
    q = norm(q);
    if (!q) return [];
    var scored = [];
    ITEMS.forEach(function (it) {
      var s = scoreItem(it, q);
      if (s > 0) scored.push({ it: it, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, limit || 6).map(function (x) { return x.it; });
  }

  function byCode(code) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].code === code) return ITEMS[i];
    return null;
  }

  return { ITEMS: ITEMS, search: search, byCode: byCode };
})();
