/* =========================================================
   PowerPoint (.pptx) export via PptxGenJS.
   Generates a themed deck mirroring the on-screen content.
   ========================================================= */
(function () {
  "use strict";

  var TEAL = "0E7C86", TEAL_DK = "073E46", TEAL_LT = "EEF9F9";
  var INK = "0F2429", INK_SOFT = "3A565C", ACCENT = "28C0C8", AMBER = "E0922F", GREEN = "2F9E6B", PURPLE = "8A5CC6";
  var FONT = "Segoe UI", SERIF = "Georgia";

  function toPptx(triggerEl) {
    if (typeof PptxGenJS === "undefined") {
      alert("PowerPoint library is still loading. Please try again in a moment.");
      return;
    }
    var prev;
    if (triggerEl) { prev = triggerEl.textContent; triggerEl.textContent = "Building…"; triggerEl.disabled = true; }

    try {
      var p = new PptxGenJS();
      p.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
      p.layout = "WIDE";
      p.author = "Dr Manuwa Tolu";
      p.company = "Harvey Road General Hospital, Yaba";
      p.title = "ICD-11 & HCD";

      var W = 13.333, H = 7.5;

      // ---- helpers ----
      function footer(slide, n) {
        slide.addText("Harvey Road General Hospital, Yaba  •  Dr Manuwa Tolu", {
          x: 0.6, y: H - 0.45, w: 9, h: 0.3, fontFace: FONT, fontSize: 9, color: "9FC7C9"
        });
        slide.addText(String(n), { x: W - 1, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 9, color: "9FC7C9", align: "right" });
      }
      function header(slide, kicker, title) {
        slide.background = { color: "FFFFFF" };
        slide.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: H, fill: { color: TEAL } });
        slide.addText(kicker.toUpperCase(), { x: 0.7, y: 0.45, w: 11, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: TEAL, charSpacing: 2 });
        slide.addText(title, { x: 0.66, y: 0.75, w: 12, h: 0.9, fontFace: SERIF, fontSize: 30, bold: true, color: INK });
      }
      function bullets(items, color) {
        return items.map(function (t) {
          return { text: t, options: { fontFace: FONT, fontSize: 15, color: color || INK_SOFT, bullet: { code: "2022", indent: 18 }, paraSpaceAfter: 8 } };
        });
      }

      // ===== 1. COVER =====
      var s1 = p.addSlide();
      s1.background = { color: TEAL_DK };
      s1.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { type: "solid", color: TEAL_DK } });
      s1.addShape(p.ShapeType.ellipse, { x: -2, y: -3, w: 7, h: 7, fill: { color: TEAL, transparency: 60 } });
      s1.addShape(p.ShapeType.ellipse, { x: W - 4, y: H - 4, w: 7, h: 7, fill: { color: ACCENT, transparency: 75 } });
      s1.addText("HARVEY ROAD GENERAL HOSPITAL  •  YABA, LAGOS", { x: 0.8, y: 1.6, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
      s1.addText([
        { text: "From ICD-11 to ", options: { color: "FFFFFF" } },
        { text: "HCD", options: { color: ACCENT } }
      ], { x: 0.8, y: 2.1, w: 11.7, h: 1.6, fontFace: SERIF, fontSize: 60, bold: true });
      s1.addText("Modern disease classification — and the case for a purpose-built classification for our hospital.", { x: 0.8, y: 3.8, w: 10, h: 0.9, fontFace: FONT, fontSize: 18, color: "CFEAEB" });
      s1.addText([
        { text: "Presented by Dr Manuwa Tolu\n", options: { bold: true, fontSize: 18, color: "FFFFFF" } },
        { text: "Harvey Road General Hospital, Yaba, Lagos", options: { fontSize: 13, color: "A9D6D8" } }
      ], { x: 0.8, y: 5.2, w: 8, h: 1, fontFace: FONT });

      // ===== 2. WHAT IS ICD =====
      var s2 = p.addSlide(); header(s2, "Foundations", "What is the ICD?");
      s2.addText("The International Classification of Diseases (ICD) is the WHO's global standard for recording, reporting and analysing health information — turning a clinical story into a structured, shareable code.", { x: 0.7, y: 1.7, w: 12, h: 0.9, fontFace: FONT, fontSize: 16, color: INK_SOFT });
      var cards = [
        ["A common language", "Every diagnosis maps to a code that means the same thing in Lagos, London or Lima."],
        ["The basis of statistics", "Mortality, morbidity and disease burden are all derived from ICD coding."],
        ["Operations & funding", "Billing, insurance (NHIS/HMO), planning and research depend on consistent classification."]
      ];
      cards.forEach(function (c, i) {
        var x = 0.7 + i * 4.1;
        s2.addShape(p.ShapeType.roundRect, { x: x, y: 2.8, w: 3.8, h: 2.4, rectRadius: 0.1, fill: { color: TEAL_LT }, line: { color: "D7F1F2", width: 1 } });
        s2.addText(c[0], { x: x + 0.25, y: 3.05, w: 3.3, h: 0.5, fontFace: SERIF, fontSize: 17, bold: true, color: TEAL_DK });
        s2.addText(c[1], { x: x + 0.25, y: 3.6, w: 3.3, h: 1.4, fontFace: FONT, fontSize: 13, color: INK_SOFT });
      });
      s2.addText("If it isn't classified, it isn't counted — and what isn't counted rarely gets funded, staffed or improved.", { x: 0.7, y: 5.6, w: 12, h: 0.7, fontFace: FONT, fontSize: 14, italic: true, bold: true, color: TEAL, fill: { color: TEAL_LT }, align: "left", valign: "middle", margin: 10 });
      footer(s2, 2);

      // ===== 3. ICD-11 =====
      var s3 = p.addSlide(); header(s3, "The new standard", "ICD-11 — built for the digital age");
      s3.addText("ICD-11 came into effect on 1 January 2022 — the first edition designed to live inside electronic systems rather than on paper.", { x: 0.7, y: 1.7, w: 12, h: 0.6, fontFace: FONT, fontSize: 15, color: INK_SOFT });
      s3.addText(bullets([
        "Foundation Component — a living digital knowledge base, updated continuously.",
        "~17,000 categories, 55,000+ stem codes, 1.6M+ codable concepts.",
        "Post-coordination & clustering of stem + extension codes.",
        "Built-in API & online coding tool."
      ]), { x: 0.7, y: 2.4, w: 5.9, h: 2.6 });
      s3.addText(bullets([
        "New chapters: Traditional Medicine, Sleep-wake, Sexual health.",
        "SNOMED CT interoperability for modern EMRs.",
        "Multilingual from day one.",
        "A linearisation suited to primary care & LMICs."
      ]), { x: 6.8, y: 2.4, w: 5.9, h: 2.6 });
      var stats = [["17,000+", "categories"], ["55,000+", "stem codes"], ["1.6M+", "concepts"], ["2022", "effective"]];
      stats.forEach(function (st, i) {
        var x = 0.7 + i * 3.05;
        s3.addShape(p.ShapeType.roundRect, { x: x, y: 5.4, w: 2.8, h: 1.3, rectRadius: 0.08, fill: { color: TEAL_LT } });
        s3.addText(st[0], { x: x, y: 5.55, w: 2.8, h: 0.6, fontFace: SERIF, fontSize: 26, bold: true, color: TEAL, align: "center" });
        s3.addText(st[1], { x: x, y: 6.15, w: 2.8, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT, align: "center" });
      });
      footer(s3, 3);

      // ===== 4. COMPARE TABLE =====
      var s4 = p.addSlide(); header(s4, "Side by side", "ICD-10 vs ICD-11");
      var rows = [
        [{ text: "Dimension", options: { bold: true, color: "FFFFFF", fill: { color: TEAL_DK } } },
         { text: "ICD-10 (since ~1994)", options: { bold: true, color: "FFFFFF", fill: { color: TEAL_DK } } },
         { text: "ICD-11 (effective 2022)", options: { bold: true, color: "FFFFFF", fill: { color: TEAL } } }],
        ["Design era", "Paper-first, manual books", "Digital-first, API driven"],
        ["Code format", "3–7 chars, e.g. B54", "Alphanumeric, e.g. 1F40"],
        ["Detail", "Mostly pre-coordinated", "Post-coordination & clustering"],
        ["Scale", "~14,400 codes", "~17,000 → 1.6M+ concepts"],
        ["Updates", "Slow, periodic revisions", "Continuous via Foundation"],
        ["Chapters", "22", "28 (incl. Traditional Medicine)"],
        ["EMR fit", "Bolted on", "Native API + SNOMED CT"]
      ];
      var tableRows = rows.map(function (r, ri) {
        return r.map(function (cell) {
          if (typeof cell === "string") {
            return { text: cell, options: { fontFace: FONT, fontSize: 13, color: INK_SOFT, fill: { color: ri % 2 ? "FFFFFF" : TEAL_LT } } };
          }
          return cell;
        });
      });
      s4.addTable(tableRows, { x: 0.7, y: 1.8, w: 12, colW: [2.6, 4.7, 4.7], border: { type: "solid", color: "D9E6E7", pt: 1 }, rowH: 0.5, valign: "middle", margin: 6 });
      s4.addText("Malaria example — ICD-10 B54  →  ICD-11 1F40 (P. falciparum) + severity extension.", { x: 0.7, y: 6.7, w: 12, h: 0.3, fontFace: FONT, fontSize: 12, italic: true, color: INK_SOFT });
      footer(s4, 4);

      // ===== 5. EXAMPLES =====
      var s5 = p.addSlide(); header(s5, "See it in action", "Worked coding examples");
      var ex = [
        ["Severe falciparum malaria", "ICD-10: B50.0", "ICD-11: 1F40 & XS25 (stem + severity)"],
        ["T2 diabetes + neuropathy", "ICD-10: E11.4", "ICD-11: 5A11 / 8C03 (both visible)"],
        ["Fracture, left radius", "ICD-10: S52.50", "ICD-11: NC92 & XK8G (+ 'left')"],
        ["Community-acquired pneumonia", "ICD-10: J18.9", "ICD-11: CA40.Z (ready for organism)"]
      ];
      ex.forEach(function (e, i) {
        var x = 0.7 + (i % 2) * 6.1, y = 1.9 + Math.floor(i / 2) * 2.4;
        s5.addShape(p.ShapeType.roundRect, { x: x, y: y, w: 5.8, h: 2.1, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: "D9E6E7", width: 1 } });
        s5.addText(e[0], { x: x + 0.25, y: y + 0.2, w: 5.3, h: 0.5, fontFace: SERIF, fontSize: 17, bold: true, color: TEAL_DK });
        s5.addText(e[1], { x: x + 0.25, y: y + 0.85, w: 5.3, h: 0.4, fontFace: FONT, fontSize: 13, color: INK_SOFT });
        s5.addText(e[2], { x: x + 0.25, y: y + 1.3, w: 5.3, h: 0.6, fontFace: FONT, fontSize: 13, bold: true, color: TEAL });
      });
      footer(s5, 5);

      // ===== 6. PROS & CONS (ICD-11) =====
      var s6 = p.addSlide(); header(s6, "An honest appraisal", "ICD-11: pros & cons");
      s6.addShape(p.ShapeType.roundRect, { x: 0.7, y: 1.8, w: 5.9, h: 4.6, rectRadius: 0.08, fill: { color: "F0FAF5" }, line: { color: GREEN, width: 2 } });
      s6.addText("✓  Advantages", { x: 0.95, y: 2.0, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: GREEN });
      s6.addText(bullets([
        "Far greater precision via clustering.",
        "Digital-native: API, coding tool, EMR integration.",
        "Always current — continuous updates.",
        "Interoperable with SNOMED CT.",
        "Better global comparability.",
        "Includes Traditional Medicine."
      ], INK_SOFT), { x: 0.95, y: 2.6, w: 5.4, h: 3.6 });
      s6.addShape(p.ShapeType.roundRect, { x: 6.8, y: 1.8, w: 5.9, h: 4.6, rectRadius: 0.08, fill: { color: "FDF4E7" }, line: { color: AMBER, width: 2 } });
      s6.addText("!  Challenges", { x: 7.05, y: 2.0, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: AMBER });
      s6.addText(bullets([
        "Steep learning curve for ICD-10-trained staff.",
        "Needs reliable tooling & connectivity.",
        "Granularity can mean 'too many clicks'.",
        "Migration cost & retraining.",
        "National (NHIS/HMO) adoption lag.",
        "Not optimised for our local disease burden."
      ], INK_SOFT), { x: 7.05, y: 2.6, w: 5.4, h: 3.6 });
      footer(s6, 6);

      // ===== 7. HCD INTRO =====
      var s7 = p.addSlide();
      s7.background = { color: TEAL_DK };
      s7.addShape(p.ShapeType.ellipse, { x: W - 5, y: -2, w: 8, h: 8, fill: { color: TEAL, transparency: 70 } });
      s7.addText("OUR PROPOSAL", { x: 0.8, y: 0.7, w: 11, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
      s7.addText([
        { text: "Introducing ", options: { color: "FFFFFF" } },
        { text: "HCD", options: { color: ACCENT } }
      ], { x: 0.8, y: 1.1, w: 11, h: 1, fontFace: SERIF, fontSize: 40, bold: true });
      s7.addText("The Harvey-road Classification of Diseases — a lightweight, local classification layer that sits on top of ICD-11, tuned to the realities of Harvey Road General Hospital, Yaba.", { x: 0.8, y: 2.2, w: 11.5, h: 0.9, fontFace: FONT, fontSize: 17, color: "CFEAEB" });
      s7.addText("HCD is NOT a replacement for ICD-11. It is a local front-end: every HCD code maps 1-to-1 back to a valid ICD-11 cluster — globally compatible, but faster and locally meaningful.", { x: 0.8, y: 3.2, w: 11.5, h: 0.8, fontFace: FONT, fontSize: 15, italic: true, color: "FFFFFF" });
      var why = [
        ["Our disease burden is specific", "Malaria, typhoid, sickle cell, hypertension & maternal conditions dominate."],
        ["Speed at the point of care", "Short codes (HCD-COM-01 = malaria) cut clicks and errors."],
        ["Capture local context", "Season, RDT vs clinical, drug availability, catchment area."],
        ["Drives our decisions", "Live dashboards of our trends inform stocking & staffing."]
      ];
      why.forEach(function (c, i) {
        var x = 0.8 + (i % 2) * 6.05, y = 4.3 + Math.floor(i / 2) * 1.35;
        s7.addShape(p.ShapeType.roundRect, { x: x, y: y, w: 5.8, h: 1.2, rectRadius: 0.08, fill: { color: "0A5560" }, line: { color: ACCENT, width: 0.5 } });
        s7.addText(c[0], { x: x + 0.2, y: y + 0.12, w: 5.4, h: 0.4, fontFace: SERIF, fontSize: 14, bold: true, color: "FFFFFF" });
        s7.addText(c[1], { x: x + 0.2, y: y + 0.5, w: 5.4, h: 0.6, fontFace: FONT, fontSize: 11.5, color: "C6E3E4" });
      });

      // ===== 8. HCD STRUCTURE =====
      var s8 = p.addSlide(); header(s8, "Under the hood", "How an HCD code is built");
      s8.addText([
        { text: "HCD", options: { color: TEAL } },
        { text: "-", options: { color: INK_SOFT } },
        { text: "COM", options: { color: PURPLE } },
        { text: "-", options: { color: INK_SOFT } },
        { text: "01", options: { color: AMBER } },
        { text: ".", options: { color: INK_SOFT } },
        { text: "Rc", options: { color: "D6584F" } }
      ], { x: 0.7, y: 1.7, w: 12, h: 1, fontFace: SERIF, fontSize: 40, bold: true, align: "center" });
      s8.addText(bullets([
        "HCD — namespace (Harvey-road Classification of Diseases)",
        "COM — chapter: Communicable (also NCD, MAT, PAE, INJ, MEN, OTH)",
        "01 — condition index in the chapter (01 = Malaria)",
        "Rc — local modifier: RDT-confirmed falciparum"
      ], INK_SOFT), { x: 1.2, y: 2.9, w: 11, h: 1.8 });
      s8.addShape(p.ShapeType.roundRect, { x: 0.7, y: 4.9, w: 5.6, h: 1.6, rectRadius: 0.08, fill: { color: TEAL_LT }, line: { color: TEAL, width: 1.5 } });
      s8.addText("HCD code", { x: 0.95, y: 5.05, w: 5, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK_SOFT });
      s8.addText("HCD-COM-01.Rc", { x: 0.95, y: 5.35, w: 5, h: 0.5, fontFace: "Consolas", fontSize: 22, bold: true, color: TEAL_DK });
      s8.addText("Malaria — RDT-confirmed falciparum", { x: 0.95, y: 5.9, w: 5, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT });
      s8.addText("maps to  →", { x: 6.4, y: 5.4, w: 1.3, h: 0.6, fontFace: FONT, fontSize: 14, bold: true, color: TEAL, align: "center", valign: "middle" });
      s8.addShape(p.ShapeType.roundRect, { x: 7.7, y: 4.9, w: 5, h: 1.6, rectRadius: 0.08, fill: { color: "F1E9FB" }, line: { color: PURPLE, width: 1.5 } });
      s8.addText("ICD-11 cluster (auto-generated)", { x: 7.95, y: 5.05, w: 4.5, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK_SOFT });
      s8.addText("1F40 & XS25", { x: 7.95, y: 5.35, w: 4.5, h: 0.5, fontFace: "Consolas", fontSize: 22, bold: true, color: PURPLE });
      s8.addText("Malaria, P. falciparum + severity extension", { x: 7.95, y: 5.9, w: 4.5, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT });
      footer(s8, 8);

      // ===== 9. EMR DEMO (static depiction) =====
      var s9 = p.addSlide(); header(s9, "From EMR to code", "Live demo — encounter to diagnosis");
      s9.addText("In the live web version, a clinician fills the encounter form and the engine derives the diagnosis with reasoning. Example flow:", { x: 0.7, y: 1.7, w: 12, h: 0.5, fontFace: FONT, fontSize: 15, color: INK_SOFT });
      // input
      s9.addShape(p.ShapeType.roundRect, { x: 0.7, y: 2.4, w: 5.9, h: 4, rectRadius: 0.08, fill: { color: "FBFDFD" }, line: { color: "D9E6E7", width: 1 } });
      s9.addText("EMR encounter (input)", { x: 0.95, y: 2.55, w: 5.4, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: TEAL });
      s9.addText(bullets([
        "Age 28, male — Temp 38.9°C",
        "Complaint: high fever & headache, 3 days",
        "Symptoms: fever, chills, headache, body aches",
        "Investigation: Malaria RDT — POSITIVE"
      ], INK_SOFT), { x: 0.95, y: 3.05, w: 5.4, h: 3.2 });
      // output
      s9.addShape(p.ShapeType.roundRect, { x: 6.8, y: 2.4, w: 5.9, h: 4, rectRadius: 0.08, fill: { color: TEAL }, line: { color: TEAL, width: 1 } });
      s9.addText("Most likely diagnosis", { x: 7.05, y: 2.55, w: 5.4, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: ACCENT });
      s9.addText("Malaria (uncomplicated)", { x: 7.05, y: 2.85, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 22, bold: true, color: "FFFFFF" });
      s9.addText("92% confidence", { x: 7.05, y: 3.4, w: 5.4, h: 0.3, fontFace: FONT, fontSize: 12, color: "CFEAEB" });
      s9.addShape(p.ShapeType.roundRect, { x: 7.05, y: 3.85, w: 2.55, h: 1, rectRadius: 0.06, fill: { color: "FFFFFF" } });
      s9.addText("HCD code", { x: 7.2, y: 3.95, w: 2.3, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: INK_SOFT });
      s9.addText("HCD-COM-01.Rc", { x: 7.2, y: 4.25, w: 2.3, h: 0.4, fontFace: "Consolas", fontSize: 13, bold: true, color: TEAL_DK });
      s9.addShape(p.ShapeType.roundRect, { x: 9.85, y: 3.85, w: 2.6, h: 1, rectRadius: 0.06, fill: { color: "FFFFFF" } });
      s9.addText("ICD-11 cluster", { x: 10, y: 3.95, w: 2.3, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: INK_SOFT });
      s9.addText("1F40 & XS25", { x: 10, y: 4.25, w: 2.3, h: 0.4, fontFace: "Consolas", fontSize: 13, bold: true, color: PURPLE });
      s9.addText("Reasoning: positive RDT confirms it · fever 38.9°C · chills & headache support the pattern.", { x: 7.05, y: 5.0, w: 5.4, h: 1.2, fontFace: FONT, fontSize: 12, color: "EAF6F7" });
      footer(s9, 9);

      // ===== 10. ROADMAP =====
      var s10 = p.addSlide(); header(s10, "Making it real", "Implementation roadmap");
      var phases = [
        ["Phase 1 · 0–3 mo", "Define & map", "Catalogue our top 50 conditions; assign HCD codes; map to ICD-11. Form a coding committee."],
        ["Phase 2 · 3–6 mo", "Build into the EMR", "Embed the HCD picker & diagnosis-support engine; auto-store ICD-11 behind every entry."],
        ["Phase 3 · 6–9 mo", "Train & pilot", "Short bedside training; pilot in OPD and one ward; audit coding accuracy weekly."],
        ["Phase 4 · 9–12 mo", "Scale & report", "Roll out hospital-wide; launch live dashboard; auto-generate NHIS/national reports."]
      ];
      phases.forEach(function (ph, i) {
        var y = 1.9 + i * 1.25;
        s10.addShape(p.ShapeType.ellipse, { x: 0.7, y: y, w: 0.65, h: 0.65, fill: { color: TEAL } });
        s10.addText(String(i + 1), { x: 0.7, y: y, w: 0.65, h: 0.65, fontFace: SERIF, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
        s10.addText(ph[0], { x: 1.6, y: y - 0.05, w: 3, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: ACCENT });
        s10.addText(ph[1], { x: 1.6, y: y + 0.22, w: 4, h: 0.4, fontFace: SERIF, fontSize: 16, bold: true, color: TEAL_DK });
        s10.addText(ph[2], { x: 5.6, y: y, w: 7.1, h: 0.9, fontFace: FONT, fontSize: 13, color: INK_SOFT, valign: "middle" });
      });
      footer(s10, 10);

      // ===== 11. CLOSE =====
      var s11 = p.addSlide();
      s11.background = { color: TEAL_DK };
      s11.addShape(p.ShapeType.ellipse, { x: -2, y: H - 5, w: 8, h: 8, fill: { color: TEAL, transparency: 70 } });
      s11.addText("From a global standard to a local advantage", { x: 1, y: 2.3, w: 11.3, h: 1.2, fontFace: SERIF, fontSize: 34, bold: true, color: "FFFFFF", align: "center" });
      s11.addText("ICD-11 modernises how the world classifies disease. HCD lets Harvey Road General Hospital harness that power on our own terms — faster, local, and still globally compatible.", { x: 2, y: 3.6, w: 9.3, h: 1, fontFace: FONT, fontSize: 16, color: "CFEAEB", align: "center" });
      s11.addText([
        { text: "Dr Manuwa Tolu\n", options: { bold: true, fontSize: 18, color: "FFFFFF" } },
        { text: "Harvey Road General Hospital, Yaba, Lagos", options: { fontSize: 13, color: "A9D6D8" } }
      ], { x: 2, y: 4.9, w: 9.3, h: 0.9, fontFace: FONT, align: "center" });
      s11.addText("Thank you.", { x: 2, y: 5.9, w: 9.3, h: 0.5, fontFace: SERIF, fontSize: 22, italic: true, color: ACCENT, align: "center" });

      p.writeFile({ fileName: "ICD11-HCD_HarveyRoad_DrManuwaTolu.pptx" }).then(function () {
        if (triggerEl) { triggerEl.textContent = prev; triggerEl.disabled = false; }
      }).catch(function (err) {
        console.error(err);
        if (triggerEl) { triggerEl.textContent = prev; triggerEl.disabled = false; }
        alert("Sorry, the PowerPoint could not be generated.");
      });
    } catch (err) {
      console.error(err);
      if (triggerEl) { triggerEl.textContent = prev || "PowerPoint"; triggerEl.disabled = false; }
      alert("Sorry, the PowerPoint could not be generated.");
    }
  }

  window.HCD_EXPORT = { toPptx: toPptx };
})();
