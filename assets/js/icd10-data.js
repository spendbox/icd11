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
    { code: "F41.9", title: "Anxiety disorder, unspecified", chapter: "V Mental", terms: ["anxiety", "anxiety disorder", "gad"] },
    { code: "F03",   title: "Unspecified dementia", chapter: "V Mental", terms: ["dementia", "alzheimer", "alzheimer's", "memory loss"] },
    { code: "F20.9", title: "Schizophrenia, unspecified", chapter: "V Mental", terms: ["schizophrenia", "psychosis", "psychotic"] },
    { code: "F31.9", title: "Bipolar affective disorder, unspecified", chapter: "V Mental", terms: ["bipolar", "bipolar disorder", "mania", "manic"] },
    { code: "F10.2", title: "Mental & behavioural disorders due to alcohol, dependence syndrome", chapter: "V Mental", terms: ["alcohol dependence", "alcoholism", "alcohol use disorder", "alcohol abuse"] },

    // diabetes complications (incl. diabetic foot)
    { code: "E11.5", title: "Type 2 diabetes mellitus with peripheral circulatory complications", chapter: "IV Endocrine", terms: ["diabetic foot", "diabetic foot ulcer", "diabetic foot disease", "diabetic peripheral vascular disease", "diabetes foot"] },
    { code: "E11.4", title: "Type 2 diabetes mellitus with neurological complications", chapter: "IV Endocrine", terms: ["diabetic neuropathy", "diabetic peripheral neuropathy", "diabetic nerve"] },
    { code: "E11.3", title: "Type 2 diabetes mellitus with ophthalmic complications", chapter: "IV Endocrine", terms: ["diabetic retinopathy", "diabetic eye"] },
    // diabetes mellitus with foot ulcer (ICD-10-CM .621 series)
    { code: "E11.621", title: "Type 2 diabetes mellitus with foot ulcer", chapter: "IV Endocrine", terms: ["diabetic foot ulcer", "type 2 diabetes foot ulcer", "t2dm foot ulcer", "diabetic foot", "diabetes foot ulcer"] },
    { code: "E10.621", title: "Type 1 diabetes mellitus with foot ulcer", chapter: "IV Endocrine", terms: ["diabetic foot ulcer", "type 1 diabetes foot ulcer", "t1dm foot ulcer"] },
    { code: "E13.621", title: "Other specified diabetes mellitus with foot ulcer", chapter: "IV Endocrine", terms: ["other diabetes foot ulcer", "other specified diabetes foot ulcer"] },
    { code: "E08.621", title: "Diabetes mellitus due to underlying condition with foot ulcer", chapter: "IV Endocrine", terms: ["secondary diabetes foot ulcer", "diabetes due to underlying condition foot ulcer"] },
    { code: "E09.621", title: "Drug or chemical induced diabetes mellitus with foot ulcer", chapter: "IV Endocrine", terms: ["drug induced diabetes foot ulcer", "steroid induced diabetes foot ulcer"] },
    { code: "L97",   title: "Ulcer of lower limb, not elsewhere classified", chapter: "XII Skin", terms: ["foot ulcer", "leg ulcer", "venous ulcer", "chronic ulcer", "non-healing ulcer", "non-healing wound"] },
    { code: "L89.9", title: "Pressure ulcer, unspecified", chapter: "XII Skin", terms: ["pressure ulcer", "bed sore", "bedsore", "decubitus ulcer", "pressure sore"] },
    { code: "E55.9", title: "Vitamin D deficiency, unspecified", chapter: "IV Endocrine", terms: ["vitamin d deficiency", "low vitamin d"] },

    // more cardiovascular / respiratory
    { code: "I11.9", title: "Hypertensive heart disease without heart failure", chapter: "IX Circulatory", terms: ["hypertensive heart disease", "hhd"] },
    { code: "I20.9", title: "Angina pectoris, unspecified", chapter: "IX Circulatory", terms: ["angina", "stable angina", "angina pectoris", "cardiac chest pain"] },
    { code: "I26.9", title: "Pulmonary embolism without acute cor pulmonale", chapter: "IX Circulatory", terms: ["pe", "pulmonary embolism", "lung clot"] },
    { code: "I82.9", title: "Embolism and thrombosis of unspecified vein", chapter: "IX Circulatory", terms: ["dvt", "deep vein thrombosis", "venous thrombosis", "leg clot"] },
    { code: "J81",   title: "Pulmonary oedema", chapter: "X Respiratory", terms: ["pulmonary oedema", "pulmonary edema", "fluid on the lungs"] },
    { code: "J30.9", title: "Allergic rhinitis, unspecified", chapter: "X Respiratory", terms: ["allergic rhinitis", "hay fever", "rhinitis"] },
    { code: "J32.9", title: "Chronic sinusitis, unspecified", chapter: "X Respiratory", terms: ["sinusitis", "chronic sinusitis"] },

    // gastro / hepatobiliary
    { code: "K21.9", title: "Gastro-oesophageal reflux disease without oesophagitis", chapter: "XI Digestive", terms: ["gerd", "gord", "reflux", "acid reflux", "heartburn", "gastro-oesophageal reflux"] },
    { code: "K80.2", title: "Calculus of gallbladder without cholecystitis", chapter: "XI Digestive", terms: ["gallstones", "cholelithiasis", "gall stones", "gallstone"] },
    { code: "K81.0", title: "Acute cholecystitis", chapter: "XI Digestive", terms: ["cholecystitis", "gallbladder inflammation"] },
    { code: "K74.6", title: "Other and unspecified cirrhosis of liver", chapter: "XI Digestive", terms: ["cirrhosis", "liver cirrhosis", "hepatic cirrhosis"] },
    { code: "K76.0", title: "Fatty (change of) liver, not elsewhere classified", chapter: "XI Digestive", terms: ["fatty liver", "hepatic steatosis", "nafld"] },
    { code: "B18.1", title: "Chronic viral hepatitis B without delta-agent", chapter: "I Infectious", terms: ["hepatitis b", "hbv", "chronic hep b"] },
    { code: "B18.2", title: "Chronic viral hepatitis C", chapter: "I Infectious", terms: ["hepatitis c", "hcv", "chronic hep c"] },
    { code: "U07.1", title: "COVID-19, virus identified", chapter: "XXII Special", terms: ["covid", "covid-19", "coronavirus", "sars-cov-2"] },
    { code: "G03.9", title: "Meningitis, unspecified", chapter: "VI Nervous", terms: ["meningitis", "meningococcal", "bacterial meningitis"] },

    // renal / urology
    { code: "N20.0", title: "Calculus of kidney", chapter: "XIV Genitourinary", terms: ["kidney stone", "renal stone", "renal calculus", "nephrolithiasis", "kidney stones"] },
    { code: "N23",   title: "Unspecified renal colic", chapter: "XIV Genitourinary", terms: ["renal colic", "ureteric colic"] },
    { code: "N18.5", title: "Chronic kidney disease, stage 5", chapter: "XIV Genitourinary", terms: ["esrd", "end stage renal disease", "kidney failure", "dialysis", "end-stage kidney"] },
    { code: "N76.0", title: "Acute vaginitis", chapter: "XIV Genitourinary", terms: ["vaginitis", "vaginal infection"] },

    // symptoms & signs (R)
    { code: "R10.4", title: "Other and unspecified abdominal pain", chapter: "XVIII Symptoms", terms: ["abdominal pain", "abdo pain", "tummy pain", "stomach pain", "belly pain"] },
    { code: "R50.9", title: "Fever, unspecified", chapter: "XVIII Symptoms", terms: ["fever", "pyrexia", "febrile", "high temperature", "raised temperature"] },
    { code: "R11",   title: "Nausea and vomiting", chapter: "XVIII Symptoms", terms: ["vomiting", "nausea", "throwing up"] },
    { code: "R05",   title: "Cough", chapter: "XVIII Symptoms", terms: ["cough", "persistent cough"] },
    { code: "R06.0", title: "Dyspnoea", chapter: "XVIII Symptoms", terms: ["shortness of breath", "breathlessness", "dyspnoea", "sob", "difficulty breathing"] },
    { code: "R07.4", title: "Chest pain, unspecified", chapter: "XVIII Symptoms", terms: ["chest pain"] },
    { code: "R42",   title: "Dizziness and giddiness", chapter: "XVIII Symptoms", terms: ["dizziness", "vertigo", "lightheadedness", "giddiness"] },
    { code: "R60.9", title: "Oedema, unspecified", chapter: "XVIII Symptoms", terms: ["oedema", "edema", "leg swelling", "swelling", "swollen legs"] },
    { code: "R53",   title: "Malaise and fatigue", chapter: "XVIII Symptoms", terms: ["fatigue", "tiredness", "weakness", "malaise", "lethargy"] },
    { code: "K59.0", title: "Constipation", chapter: "XI Digestive", terms: ["constipation"] },
    { code: "E86",   title: "Volume depletion", chapter: "IV Endocrine", terms: ["dehydration", "volume depletion", "fluid depletion"] },

    // neuro
    { code: "G40.9", title: "Epilepsy, unspecified", chapter: "VI Nervous", terms: ["epilepsy", "seizures", "seizure disorder", "convulsions", "fits"] },
    { code: "G20",   title: "Parkinson disease", chapter: "VI Nervous", terms: ["parkinson", "parkinsons", "parkinsonism", "parkinson's disease"] },

    // rheumatology / MSK
    { code: "M06.9", title: "Rheumatoid arthritis, unspecified", chapter: "XIII Musculoskeletal", terms: ["rheumatoid arthritis", "ra"] },
    { code: "M10.9", title: "Gout, unspecified", chapter: "XIII Musculoskeletal", terms: ["gout", "gouty arthritis"] },
    { code: "M81.9", title: "Osteoporosis, unspecified", chapter: "XIII Musculoskeletal", terms: ["osteoporosis", "thin bones"] },
    { code: "M16.9", title: "Osteoarthritis of hip, unspecified", chapter: "XIII Musculoskeletal", terms: ["hip osteoarthritis", "oa hip", "hip arthritis"] },

    // skin / soft-tissue
    { code: "L03.9", title: "Cellulitis, unspecified", chapter: "XII Skin", terms: ["cellulitis", "skin infection"] },
    { code: "L02.9", title: "Cutaneous abscess, furuncle and carbuncle, unspecified", chapter: "XII Skin", terms: ["abscess", "boil", "furuncle", "skin abscess"] },
    { code: "L40.9", title: "Psoriasis, unspecified", chapter: "XII Skin", terms: ["psoriasis"] },
    { code: "L50.9", title: "Urticaria, unspecified", chapter: "XII Skin", terms: ["urticaria", "hives", "nettle rash"] },
    { code: "T78.4", title: "Allergy, unspecified", chapter: "XIX Injury", terms: ["allergy", "allergic reaction", "allergies"] },

    // eye
    { code: "H10.9", title: "Conjunctivitis, unspecified", chapter: "VII Eye", terms: ["conjunctivitis", "red eye", "pink eye"] },
    { code: "H25.9", title: "Senile cataract, unspecified", chapter: "VII Eye", terms: ["cataract", "cataracts"] },
    { code: "H40.9", title: "Glaucoma, unspecified", chapter: "VII Eye", terms: ["glaucoma"] },

    // oncology
    { code: "C50.9", title: "Malignant neoplasm of breast, unspecified", chapter: "II Neoplasms", terms: ["breast cancer", "carcinoma of breast", "breast carcinoma", "breast ca"] },
    { code: "C61",   title: "Malignant neoplasm of prostate", chapter: "II Neoplasms", terms: ["prostate cancer", "prostate carcinoma", "prostate ca"] },
    { code: "C18.9", title: "Malignant neoplasm of colon, unspecified", chapter: "II Neoplasms", terms: ["colon cancer", "colorectal cancer", "bowel cancer"] },
    { code: "C34.9", title: "Malignant neoplasm of bronchus or lung, unspecified", chapter: "II Neoplasms", terms: ["lung cancer", "lung carcinoma", "lung ca"] },
    { code: "C22.0", title: "Liver cell carcinoma", chapter: "II Neoplasms", terms: ["hepatocellular carcinoma", "hcc", "liver cancer"] },
    { code: "C53.9", title: "Malignant neoplasm of cervix uteri, unspecified", chapter: "II Neoplasms", terms: ["cervical cancer", "cervix cancer"] },

    // electrolytes
    { code: "E87.6", title: "Hypokalaemia", chapter: "IV Endocrine", terms: ["hypokalaemia", "hypokalemia", "low potassium"] },
    { code: "E87.1", title: "Hypo-osmolality and hyponatraemia", chapter: "IV Endocrine", terms: ["hyponatraemia", "hyponatremia", "low sodium"] },

    // obstetric / neonatal / general
    { code: "Z34.9", title: "Supervision of normal pregnancy, unspecified", chapter: "XXI Factors", terms: ["antenatal", "pregnancy", "pregnant", "anc", "antenatal care"] },
    { code: "O03.9", title: "Complete or unspecified spontaneous abortion", chapter: "XV Pregnancy", terms: ["miscarriage", "spontaneous abortion", "incomplete abortion"] },
    { code: "P59.9", title: "Neonatal jaundice, unspecified", chapter: "XVI Perinatal", terms: ["neonatal jaundice", "jaundice newborn", "newborn jaundice"] },
    { code: "Z00.0", title: "General medical examination", chapter: "XXI Factors", terms: ["medical examination", "check up", "general checkup", "health check"] },

    // gynaecology / obstetrics
    { code: "D25.9", title: "Leiomyoma of uterus, unspecified", chapter: "II Neoplasms", terms: ["fibroid", "fibroids", "uterine fibroid", "leiomyoma", "myoma"] },
    { code: "N80.9", title: "Endometriosis, unspecified", chapter: "XIV Genitourinary", terms: ["endometriosis"] },
    { code: "N83.2", title: "Other and unspecified ovarian cysts", chapter: "XIV Genitourinary", terms: ["ovarian cyst", "ovarian cysts"] },
    { code: "N70.9", title: "Salpingitis and oophoritis, unspecified", chapter: "XIV Genitourinary", terms: ["pid", "pelvic inflammatory disease", "salpingitis"] },
    { code: "N81.4", title: "Uterovaginal prolapse, unspecified", chapter: "XIV Genitourinary", terms: ["uterine prolapse", "prolapse", "vaginal prolapse", "pelvic organ prolapse"] },
    { code: "N92.0", title: "Excessive and frequent menstruation with regular cycle", chapter: "XIV Genitourinary", terms: ["menorrhagia", "heavy periods", "heavy menstrual bleeding"] },
    { code: "N97.9", title: "Female infertility, unspecified", chapter: "XIV Genitourinary", terms: ["infertility", "subfertility", "unable to conceive"] },
    { code: "B37.3", title: "Candidiasis of vulva and vagina", chapter: "I Infectious", terms: ["thrush", "candidiasis", "candida", "yeast infection", "vaginal thrush"] },
    { code: "O24.4", title: "Diabetes mellitus arising in pregnancy", chapter: "XV Pregnancy", terms: ["gestational diabetes", "gdm"] },
    { code: "O13",   title: "Gestational [pregnancy-induced] hypertension", chapter: "XV Pregnancy", terms: ["gestational hypertension", "pregnancy induced hypertension", "pih"] },
    { code: "O60.1", title: "Preterm labour with preterm delivery", chapter: "XV Pregnancy", terms: ["preterm labour", "premature labour", "preterm birth"] },
    { code: "O72.1", title: "Other immediate postpartum haemorrhage", chapter: "XV Pregnancy", terms: ["postpartum haemorrhage", "pph", "post partum bleeding"] },
    { code: "O82",   title: "Single delivery by caesarean section", chapter: "XV Pregnancy", terms: ["caesarean", "caesarean section", "c-section", "lscs", "cesarean"] },

    // gastro / surgical
    { code: "K40.9", title: "Inguinal hernia, without obstruction or gangrene", chapter: "XI Digestive", terms: ["hernia", "inguinal hernia", "groin hernia"] },
    { code: "K44.9", title: "Diaphragmatic hernia without obstruction or gangrene", chapter: "XI Digestive", terms: ["hiatus hernia", "hiatal hernia"] },
    { code: "K56.6", title: "Other and unspecified intestinal obstruction", chapter: "XI Digestive", terms: ["bowel obstruction", "intestinal obstruction", "obstruction"] },
    { code: "K85.9", title: "Acute pancreatitis, unspecified", chapter: "XI Digestive", terms: ["pancreatitis", "acute pancreatitis"] },
    { code: "K57.9", title: "Diverticular disease of intestine, unspecified", chapter: "XI Digestive", terms: ["diverticulitis", "diverticular disease", "diverticulosis"] },
    { code: "K64.9", title: "Haemorrhoids, unspecified", chapter: "XI Digestive", terms: ["haemorrhoids", "piles", "hemorrhoids"] },
    { code: "K92.2", title: "Gastrointestinal haemorrhage, unspecified", chapter: "XI Digestive", terms: ["gi bleed", "gastrointestinal bleed", "haematemesis", "melaena", "upper gi bleed", "blood in stool"] },

    // respiratory
    { code: "J90",   title: "Pleural effusion, not elsewhere classified", chapter: "X Respiratory", terms: ["pleural effusion", "fluid around lung"] },
    { code: "J93.9", title: "Pneumothorax, unspecified", chapter: "X Respiratory", terms: ["pneumothorax", "collapsed lung"] },
    { code: "J96.0", title: "Acute respiratory failure", chapter: "X Respiratory", terms: ["respiratory failure", "type 1 respiratory failure", "type 2 respiratory failure"] },
    { code: "J47",   title: "Bronchiectasis", chapter: "X Respiratory", terms: ["bronchiectasis"] },
    { code: "J11.1", title: "Influenza with other respiratory manifestations, virus not identified", chapter: "X Respiratory", terms: ["flu", "influenza"] },

    // cardiovascular
    { code: "I49.9", title: "Cardiac arrhythmia, unspecified", chapter: "IX Circulatory", terms: ["arrhythmia", "palpitations", "irregular heartbeat", "irregular heart beat"] },
    { code: "I47.1", title: "Supraventricular tachycardia", chapter: "IX Circulatory", terms: ["svt", "supraventricular tachycardia", "fast heart rate"] },
    { code: "I95.9", title: "Hypotension, unspecified", chapter: "IX Circulatory", terms: ["hypotension", "low blood pressure", "low bp"] },
    { code: "I71.9", title: "Aortic aneurysm of unspecified site, without rupture", chapter: "IX Circulatory", terms: ["aortic aneurysm", "aaa", "abdominal aortic aneurysm"] },
    { code: "I73.9", title: "Peripheral vascular disease, unspecified", chapter: "IX Circulatory", terms: ["pvd", "peripheral arterial disease", "peripheral vascular disease", "claudication"] },

    // endocrine / rheum
    { code: "E16.2", title: "Hypoglycaemia, unspecified", chapter: "IV Endocrine", terms: ["hypoglycaemia", "low blood sugar", "hypo", "hypoglycemia"] },
    { code: "E04.9", title: "Nontoxic goitre, unspecified", chapter: "IV Endocrine", terms: ["goitre", "goiter", "thyroid swelling"] },
    { code: "E14.9", title: "Unspecified diabetes mellitus without complications", chapter: "IV Endocrine", terms: ["diabetes", "diabetes mellitus", "diabetic"] },
    { code: "M32.9", title: "Systemic lupus erythematosus, unspecified", chapter: "XIII Musculoskeletal", terms: ["lupus", "sle", "systemic lupus"] },
    { code: "D69.3", title: "Immune thrombocytopenic purpura", chapter: "III Blood", terms: ["itp", "low platelets", "thrombocytopenia"] },

    // MSK / injuries
    { code: "G56.0", title: "Carpal tunnel syndrome", chapter: "VI Nervous", terms: ["carpal tunnel", "carpal tunnel syndrome"] },
    { code: "M54.3", title: "Sciatica", chapter: "XIII Musculoskeletal", terms: ["sciatica", "sciatic pain"] },
    { code: "M51.2", title: "Other specified intervertebral disc displacement", chapter: "XIII Musculoskeletal", terms: ["slipped disc", "prolapsed disc", "disc herniation", "disc prolapse", "herniated disc"] },
    { code: "M75.1", title: "Rotator cuff syndrome", chapter: "XIII Musculoskeletal", terms: ["rotator cuff", "shoulder impingement", "shoulder pain"] },
    { code: "M25.5", title: "Pain in joint", chapter: "XIII Musculoskeletal", terms: ["joint pain", "arthralgia"] },
    { code: "S93.4", title: "Sprain and strain of ankle", chapter: "XIX Injury", terms: ["ankle sprain", "sprained ankle", "twisted ankle"] },
    { code: "S82.9", title: "Fracture of lower leg, part unspecified", chapter: "XIX Injury", terms: ["lower leg fracture", "tibia fracture", "fibula fracture", "ankle fracture"] },
    { code: "S42.0", title: "Fracture of clavicle", chapter: "XIX Injury", terms: ["clavicle fracture", "collarbone fracture", "broken collarbone"] },
    { code: "S42.2", title: "Fracture of upper end of humerus", chapter: "XIX Injury", terms: ["humerus fracture", "upper arm fracture", "shoulder fracture"] },
    { code: "S62.9", title: "Fracture at wrist and hand level, unspecified", chapter: "XIX Injury", terms: ["wrist fracture", "hand fracture", "scaphoid fracture"] },
    { code: "S06.9", title: "Intracranial injury, unspecified", chapter: "XIX Injury", terms: ["head injury", "traumatic brain injury", "tbi", "concussion"] },
    { code: "S02.9", title: "Fracture of skull and facial bones, part unspecified", chapter: "XIX Injury", terms: ["skull fracture", "facial fracture"] },
    { code: "T30.0", title: "Burn of unspecified body region, unspecified degree", chapter: "XIX Injury", terms: ["burn", "burns", "scald", "thermal injury"] },

    // skin / ENT / eye / infectious
    { code: "B35.9", title: "Dermatophytosis, unspecified", chapter: "I Infectious", terms: ["ringworm", "tinea", "fungal skin infection", "dermatophytosis"] },
    { code: "L20.9", title: "Atopic dermatitis, unspecified", chapter: "XII Skin", terms: ["eczema", "atopic dermatitis", "atopic eczema"] },
    { code: "L70.9", title: "Acne, unspecified", chapter: "XII Skin", terms: ["acne", "acne vulgaris", "pimples"] },
    { code: "C43.9", title: "Malignant melanoma of skin, unspecified", chapter: "II Neoplasms", terms: ["melanoma", "malignant melanoma"] },
    { code: "C44.9", title: "Malignant neoplasm of skin, unspecified", chapter: "II Neoplasms", terms: ["skin cancer", "basal cell carcinoma", "squamous cell carcinoma", "bcc", "scc"] },
    { code: "B01.9", title: "Varicella without complication", chapter: "I Infectious", terms: ["chickenpox", "varicella", "chicken pox"] },
    { code: "B05.9", title: "Measles without complication", chapter: "I Infectious", terms: ["measles"] },
    { code: "B26.9", title: "Mumps without complication", chapter: "I Infectious", terms: ["mumps"] },
    { code: "B27.9", title: "Infectious mononucleosis, unspecified", chapter: "I Infectious", terms: ["glandular fever", "mononucleosis", "mono", "epstein barr"] },
    { code: "A54.9", title: "Gonococcal infection, unspecified", chapter: "I Infectious", terms: ["gonorrhoea", "gonorrhea", "gonococcal"] },
    { code: "A53.9", title: "Syphilis, unspecified", chapter: "I Infectious", terms: ["syphilis"] },
    { code: "A35",   title: "Other tetanus", chapter: "I Infectious", terms: ["tetanus", "lockjaw"] },
    { code: "A37.9", title: "Whooping cough, unspecified species", chapter: "I Infectious", terms: ["whooping cough", "pertussis"] },
    { code: "H61.2", title: "Impacted cerumen", chapter: "VIII Ear", terms: ["earwax", "ear wax", "cerumen", "impacted wax", "wax in ear"] },
    { code: "H92.0", title: "Otalgia", chapter: "VIII Ear", terms: ["earache", "ear pain", "otalgia"] },
    { code: "H65.9", title: "Nonsuppurative otitis media, unspecified", chapter: "VIII Ear", terms: ["glue ear", "otitis media with effusion", "ome", "serous otitis media"] },
    { code: "H52.1", title: "Myopia", chapter: "VII Eye", terms: ["myopia", "short sightedness", "near sighted"] },
    { code: "H52.4", title: "Presbyopia", chapter: "VII Eye", terms: ["presbyopia", "age-related long sight"] },
    { code: "H00.0", title: "Hordeolum and other deep inflammation of eyelid", chapter: "VII Eye", terms: ["stye", "sty", "hordeolum"] },

    // urinary symptoms / mental / behavioural
    { code: "R31",   title: "Unspecified haematuria", chapter: "XVIII Symptoms", terms: ["haematuria", "blood in urine", "hematuria"] },
    { code: "R33",   title: "Retention of urine", chapter: "XVIII Symptoms", terms: ["urinary retention", "retention of urine", "cannot pass urine"] },
    { code: "G44.2", title: "Tension-type headache", chapter: "VI Nervous", terms: ["tension headache", "tension-type headache"] },
    { code: "F43.1", title: "Post-traumatic stress disorder", chapter: "V Mental", terms: ["ptsd", "post traumatic stress", "post-traumatic stress"] },
    { code: "F90.0", title: "Disturbance of activity and attention", chapter: "V Mental", terms: ["adhd", "attention deficit hyperactivity disorder", "attention deficit"] },
    { code: "F84.0", title: "Childhood autism", chapter: "V Mental", terms: ["autism", "autistic", "asd", "autism spectrum"] },
    { code: "F17.2", title: "Mental & behavioural disorders due to tobacco, dependence", chapter: "V Mental", terms: ["smoking", "nicotine dependence", "tobacco dependence", "smoker"] }
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
