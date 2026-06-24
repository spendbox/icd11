/* =========================================================
   PowerPoint (.pptx) export via PptxGenJS.
   Mirrors the on-screen (trimmed) deck. ICD-11 codes are
   real MMS stem codes; HCD is a proposed local scheme.
   ========================================================= */
(function () {
  "use strict";

  var TEAL = "0E7C86", TEAL_DK = "073E46", TEAL_LT = "EEF9F9";
  var INK = "0F2429", INK_SOFT = "3A565C", ACCENT = "28C0C8", AMBER = "E0922F", GREEN = "2F9E6B", PURPLE = "8A5CC6";
  var FONT = "Segoe UI", SERIF = "Georgia";

  function toPptx(triggerEl) {
    if (typeof PptxGenJS === "undefined") { alert("PowerPoint library is still loading. Please try again in a moment."); return; }
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

      function footer(slide, n) {
        slide.addText("Harvey Road General Hospital, Yaba  •  Dr Manuwa Tolu", { x: 0.6, y: H - 0.45, w: 9, h: 0.3, fontFace: FONT, fontSize: 9, color: "9FC7C9" });
        slide.addText(String(n), { x: W - 1, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 9, color: "9FC7C9", align: "right" });
      }
      function header(slide, kicker, title) {
        slide.background = { color: "FFFFFF" };
        slide.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: H, fill: { color: TEAL } });
        slide.addText(kicker.toUpperCase(), { x: 0.7, y: 0.5, w: 11, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: TEAL, charSpacing: 2 });
        slide.addText(title, { x: 0.66, y: 0.82, w: 12, h: 0.9, fontFace: SERIF, fontSize: 32, bold: true, color: INK });
      }
      function bullets(items, color, size) {
        return items.map(function (t) {
          return { text: t, options: { fontFace: FONT, fontSize: size || 16, color: color || INK_SOFT, bullet: { code: "2022", indent: 18 }, paraSpaceAfter: 12 } };
        });
      }
      // simple icon+title+line card
      function card(slide, x, y, w, h, title, body, fillc, linec, titlec) {
        slide.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h, rectRadius: 0.1, fill: { color: fillc || TEAL_LT }, line: { color: linec || "D7F1F2", width: 1 } });
        slide.addText(title, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: 0.5, fontFace: SERIF, fontSize: 17, bold: true, color: titlec || TEAL_DK });
        slide.addText(body, { x: x + 0.25, y: y + 0.78, w: w - 0.5, h: h - 1, fontFace: FONT, fontSize: 13.5, color: INK_SOFT, valign: "top" });
      }

      /* 1. COVER */
      var s = p.addSlide();
      s.background = { color: TEAL_DK };
      s.addShape(p.ShapeType.ellipse, { x: -2, y: -3, w: 7, h: 7, fill: { color: TEAL, transparency: 60 } });
      s.addShape(p.ShapeType.ellipse, { x: W - 4, y: H - 4, w: 7, h: 7, fill: { color: ACCENT, transparency: 75 } });
      s.addText("HARVEY ROAD GENERAL HOSPITAL  •  YABA, LAGOS", { x: 0.8, y: 1.9, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
      s.addText([{ text: "From ICD-11 to ", options: { color: "FFFFFF" } }, { text: "HCD", options: { color: ACCENT } }], { x: 0.8, y: 2.4, w: 11.7, h: 1.6, fontFace: SERIF, fontSize: 60, bold: true });
      s.addText("Modern disease classification — and a practical, local layer for our hospital.", { x: 0.8, y: 4.1, w: 10, h: 0.7, fontFace: FONT, fontSize: 18, color: "CFEAEB" });
      s.addText([{ text: "Dr Manuwa Tolu\n", options: { bold: true, fontSize: 18, color: "FFFFFF" } }, { text: "Harvey Road General Hospital, Yaba, Lagos", options: { fontSize: 13, color: "A9D6D8" } }], { x: 0.8, y: 5.4, w: 8, h: 1, fontFace: FONT });

      /* 2. WHAT IS ICD */
      s = p.addSlide(); header(s, "Foundations", "What is the ICD?");
      s.addText("The WHO's global standard for turning a diagnosis into a structured, comparable code.", { x: 0.7, y: 1.85, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 17, color: INK_SOFT });
      card(s, 0.7, 2.8, 3.8, 2.2, "A common language", "The same code means the same thing worldwide.");
      card(s, 4.75, 2.8, 3.8, 2.2, "Counts what matters", "Statistics, disease burden and planning start here.");
      card(s, 8.8, 2.8, 3.8, 2.2, "Runs the business", "Billing, NHIS/HMO claims and research depend on it.");
      s.addText("If it isn't classified, it isn't counted — and what isn't counted rarely gets funded.", { x: 0.7, y: 5.5, w: 11.9, h: 0.7, fontFace: FONT, fontSize: 15, italic: true, bold: true, color: TEAL, fill: { color: TEAL_LT }, valign: "middle", margin: 12 });
      footer(s, 2);

      /* 3. ICD-11 */
      s = p.addSlide(); header(s, "The 2022 standard", "ICD-11 — built for the digital age");
      s.addText("The first edition designed to live inside software, not books.", { x: 0.7, y: 1.85, w: 11.5, h: 0.5, fontFace: FONT, fontSize: 16, color: INK_SOFT });
      s.addText(bullets([
        "One living database (the Foundation) — updated continuously.",
        "Post-coordination — combine a stem code + extension codes for precision.",
        "Digital-native — an official API and a drop-in coding tool.",
        "Vast but searchable — you search, you don't memorise."
      ], INK, 17), { x: 0.9, y: 2.5, w: 11.5, h: 2.5 });
      var st = [["17,000+", "categories"], ["55,000+", "stem codes"], ["1.6M+", "concepts"], ["2022", "in effect"]];
      st.forEach(function (v, i) {
        var x = 0.7 + i * 3.05;
        s.addShape(p.ShapeType.roundRect, { x: x, y: 5.5, w: 2.8, h: 1.2, rectRadius: 0.08, fill: { color: TEAL_LT } });
        s.addText(v[0], { x: x, y: 5.62, w: 2.8, h: 0.6, fontFace: SERIF, fontSize: 26, bold: true, color: TEAL, align: "center" });
        s.addText(v[1], { x: x, y: 6.2, w: 2.8, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT, align: "center" });
      });
      footer(s, 3);

      /* 4. COMPARE */
      s = p.addSlide(); header(s, "Side by side", "ICD-10 vs ICD-11");
      var hd = function (t, fill) { return { text: t, options: { bold: true, color: "FFFFFF", fill: { color: fill }, fontFace: FONT, fontSize: 14 } }; };
      var rows = [
        [hd("Dimension", TEAL_DK), hd("ICD-10", TEAL_DK), hd("ICD-11", TEAL)],
        ["Era", "Paper-first", "Digital-first (API)"],
        ["Code", "B54 (malaria)", "1F40 + extensions"],
        ["Detail", "Pre-coordinated", "Stem + extension clustering"],
        ["Scale", "~14,400 codes", "1.6M+ concepts"],
        ["Updates", "Slow revisions", "Continuous"],
        ["EMR fit", "Bolted on", "Native + SNOMED CT"]
      ];
      var trows = rows.map(function (r, ri) {
        return r.map(function (c) {
          if (typeof c === "string") return { text: c, options: { fontFace: FONT, fontSize: 15, color: INK_SOFT, fill: { color: ri % 2 ? "FFFFFF" : TEAL_LT } } };
          return c;
        });
      });
      s.addTable(trows, { x: 0.7, y: 2.0, w: 12, colW: [2.6, 4.7, 4.7], border: { type: "solid", color: "D9E6E7", pt: 1 }, rowH: 0.6, valign: "middle", margin: 8 });
      s.addText("Malaria: B54 → 1F40 (P. falciparum), refined to 1F40.0 if cerebral.", { x: 0.7, y: 6.6, w: 12, h: 0.3, fontFace: FONT, fontSize: 12, italic: true, color: INK_SOFT });
      footer(s, 4);

      /* 5. ICD-11 INSIDE THE EMR */
      s = p.addSlide(); header(s, "How it actually works", "ICD-11 inside the EMR");
      s.addText("You don't memorise codes — you search, pick, refine. Here is the machinery.", { x: 0.7, y: 1.85, w: 11.5, h: 0.5, fontFace: FONT, fontSize: 16, color: INK_SOFT });
      card(s, 0.7, 2.5, 5.9, 1.85, "Official ICD-API", "WHO hosts a live REST API at id.who.int (OAuth2). The EMR queries it for every search and code.");
      card(s, 6.75, 2.5, 5.9, 1.85, "Embedded Coding Tool", "A drop-in WHO JavaScript widget: type a term, pick from ranked matches. Search-as-you-type.");
      card(s, 0.7, 4.5, 5.9, 1.85, "Autocode", "Send free text ('high fever, +ve RDT') and the API returns the closest-match code.");
      card(s, 6.75, 4.5, 5.9, 1.85, "Works offline", "The API can run on a local server/container — vital where connectivity is poor.");
      footer(s, 5);

      /* 6. EXAMPLES */
      s = p.addSlide(); header(s, "See it in action", "ICD-10 → ICD-11");
      var ex = [
        ["Severe malaria", "B50.0", "1F40.0", "P. falciparum with cerebral complications."],
        ["UTI, E. coli", "N39.0 + B96.2", "GC08.0", "Two ICD-10 codes → one precise ICD-11 code."],
        ["Pneumonia", "J18.9", "CA40.Z", "Ready to add an organism extension later."]
      ];
      ex.forEach(function (e, i) {
        var x = 0.7 + i * 4.1;
        s.addShape(p.ShapeType.roundRect, { x: x, y: 2.3, w: 3.8, h: 2.5, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: "D9E6E7", width: 1 } });
        s.addText(e[0], { x: x + 0.25, y: 2.5, w: 3.3, h: 0.4, fontFace: SERIF, fontSize: 16, bold: true, color: TEAL_DK });
        s.addText([{ text: e[1] + "  ", options: { color: INK_SOFT } }, { text: "→ ", options: { color: TEAL } }, { text: e[2], options: { color: TEAL, bold: true } }], { x: x + 0.25, y: 3.0, w: 3.3, h: 0.5, fontFace: "Consolas", fontSize: 14 });
        s.addText(e[3], { x: x + 0.25, y: 3.6, w: 3.3, h: 1.0, fontFace: FONT, fontSize: 12.5, color: INK_SOFT });
      });
      s.addText("Clustering: add an extension to a stem — e.g. fracture NC92 & XK8G (left) — for one precise record.", { x: 0.7, y: 5.3, w: 11.9, h: 0.7, fontFace: FONT, fontSize: 14, italic: true, bold: true, color: AMBER, fill: { color: "FDF4E7" }, valign: "middle", margin: 12 });
      footer(s, 6);

      /* 7. PROS & CONS */
      s = p.addSlide(); header(s, "An honest appraisal", "ICD-11: pros & cons");
      s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 2.0, w: 5.9, h: 3.6, rectRadius: 0.08, fill: { color: "F0FAF5" }, line: { color: GREEN, width: 2 } });
      s.addText("✓  Pros", { x: 0.95, y: 2.2, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 20, bold: true, color: GREEN });
      s.addText(bullets(["Greater precision via clustering.", "Digital-native: API + coding tool.", "Always current; globally comparable.", "Interoperable with SNOMED CT."], INK_SOFT, 15), { x: 0.95, y: 2.8, w: 5.4, h: 2.6 });
      s.addShape(p.ShapeType.roundRect, { x: 6.75, y: 2.0, w: 5.9, h: 3.6, rectRadius: 0.08, fill: { color: "FDF4E7" }, line: { color: AMBER, width: 2 } });
      s.addText("!  Cons", { x: 7.0, y: 2.2, w: 5.4, h: 0.5, fontFace: SERIF, fontSize: 20, bold: true, color: AMBER });
      s.addText(bullets(["Learning curve for ICD-10-trained staff.", "Needs tooling & connectivity.", "Migration & retraining cost.", "Not tuned to our local burden."], INK_SOFT, 15), { x: 7.0, y: 2.8, w: 5.4, h: 2.6 });
      s.addText("That last gap — local fit — is what HCD closes.", { x: 0.7, y: 5.9, w: 11.9, h: 0.6, fontFace: FONT, fontSize: 15, italic: true, bold: true, color: AMBER, align: "center" });
      footer(s, 7);

      /* 8. HCD INTRO */
      s = p.addSlide();
      s.background = { color: TEAL_DK };
      s.addShape(p.ShapeType.ellipse, { x: W - 5, y: -2, w: 8, h: 8, fill: { color: TEAL, transparency: 70 } });
      s.addText("OUR PROPOSAL", { x: 0.8, y: 0.6, w: 11, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
      s.addText([{ text: "Introducing ", options: { color: "FFFFFF" } }, { text: "HCD", options: { color: ACCENT } }], { x: 0.8, y: 1.0, w: 11, h: 1, fontFace: SERIF, fontSize: 40, bold: true });
      s.addText("The Harvey-road Classification of Diseases — a light, local layer on top of ICD-11. Not a replacement: every HCD code maps 1-to-1 to a valid ICD-11 cluster.", { x: 0.8, y: 2.05, w: 11.5, h: 0.9, fontFace: FONT, fontSize: 16, color: "CFEAEB" });
      var why = [
        ["Tuned to our burden", "Top ~50 conditions — malaria, typhoid, sickle cell — one tap away."],
        ["Fast at the OPD", "Short codes (HCD-COM-01 = malaria) cut clicks and errors."],
        ["Local context", "Season, RDT vs clinical, catchment — data ICD-11 won't surface."],
        ["ICD-11 compatible", "Stores the ICD-11 cluster, so NHIS/global reporting is automatic."]
      ];
      why.forEach(function (c, i) {
        var x = 0.8 + (i % 2) * 6.05, y = 3.2 + Math.floor(i / 2) * 1.65;
        s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: 5.8, h: 1.45, rectRadius: 0.08, fill: { color: "0A5560" }, line: { color: ACCENT, width: 0.5 } });
        s.addText(c[0], { x: x + 0.22, y: y + 0.15, w: 5.4, h: 0.4, fontFace: SERIF, fontSize: 15, bold: true, color: "FFFFFF" });
        s.addText(c[1], { x: x + 0.22, y: y + 0.6, w: 5.4, h: 0.8, fontFace: FONT, fontSize: 12.5, color: "C6E3E4" });
      });

      /* 9. HCD STRUCTURE */
      s = p.addSlide(); header(s, "Under the hood", "How an HCD code is built");
      s.addText([
        { text: "HCD", options: { color: TEAL } }, { text: "-", options: { color: INK_SOFT } },
        { text: "COM", options: { color: PURPLE } }, { text: "-", options: { color: INK_SOFT } },
        { text: "01", options: { color: AMBER } }, { text: ".", options: { color: INK_SOFT } },
        { text: "Pf", options: { color: "D6584F" } }
      ], { x: 0.7, y: 1.9, w: 12, h: 1, fontFace: SERIF, fontSize: 40, bold: true, align: "center" });
      s.addText(bullets([
        "HCD — namespace        COM — chapter (Communicable)",
        "01 — condition (Malaria)        Pf — local modifier (P. falciparum)"
      ], INK_SOFT, 15), { x: 1.4, y: 3.0, w: 10.5, h: 1.0 });
      s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 4.3, w: 5.3, h: 1.6, rectRadius: 0.08, fill: { color: TEAL_LT }, line: { color: TEAL, width: 1.5 } });
      s.addText("HCD code", { x: 1.15, y: 4.45, w: 4.8, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK_SOFT });
      s.addText("HCD-COM-01.Pf", { x: 1.15, y: 4.75, w: 4.8, h: 0.5, fontFace: "Consolas", fontSize: 22, bold: true, color: TEAL_DK });
      s.addText("Malaria — falciparum", { x: 1.15, y: 5.3, w: 4.8, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT });
      s.addText("maps to  →", { x: 6.3, y: 4.8, w: 1.3, h: 0.6, fontFace: FONT, fontSize: 14, bold: true, color: TEAL, align: "center", valign: "middle" });
      s.addShape(p.ShapeType.roundRect, { x: 7.6, y: 4.3, w: 5.0, h: 1.6, rectRadius: 0.08, fill: { color: "F1E9FB" }, line: { color: PURPLE, width: 1.5 } });
      s.addText("ICD-11 (auto-stored)", { x: 7.85, y: 4.45, w: 4.5, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK_SOFT });
      s.addText("1F40", { x: 7.85, y: 4.75, w: 4.5, h: 0.5, fontFace: "Consolas", fontSize: 22, bold: true, color: PURPLE });
      s.addText("Malaria due to P. falciparum", { x: 7.85, y: 5.3, w: 4.5, h: 0.4, fontFace: FONT, fontSize: 12, color: INK_SOFT });
      footer(s, 9);

      /* 10. DEMO depiction */
      s = p.addSlide(); header(s, "From search to code", "Live demo — the ICD-11 way");
      s.addText("In the web version: search a diagnosis, pick the match, optionally refine — then it auto-maps to HCD.", { x: 0.7, y: 1.85, w: 12, h: 0.5, fontFace: FONT, fontSize: 15, color: INK_SOFT });
      // search box mock
      s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 2.5, w: 5.9, h: 3.7, rectRadius: 0.08, fill: { color: "FBFDFD" }, line: { color: "D9E6E7", width: 1 } });
      s.addShape(p.ShapeType.roundRect, { x: 0.95, y: 2.7, w: 5.4, h: 0.55, rectRadius: 0.27, fill: { color: "FFFFFF" }, line: { color: TEAL, width: 1.5 } });
      s.addText("🔎  malaria", { x: 1.2, y: 2.78, w: 5, h: 0.4, fontFace: FONT, fontSize: 13, color: INK_SOFT });
      [["1F40", "Malaria due to P. falciparum"], ["1F41", "Malaria due to P. vivax"], ["1F4Z", "Malaria, species unspecified"]].forEach(function (r, i) {
        var y = 3.45 + i * 0.62;
        s.addShape(p.ShapeType.roundRect, { x: 0.95, y: y, w: 5.4, h: 0.52, rectRadius: 0.06, fill: { color: i === 0 ? TEAL_LT : "FFFFFF" }, line: { color: "E3EEEE", width: 1 } });
        s.addText(r[0], { x: 1.1, y: y, w: 0.9, h: 0.52, fontFace: "Consolas", fontSize: 12, bold: true, color: TEAL, valign: "middle" });
        s.addText(r[1], { x: 2.0, y: y, w: 4.3, h: 0.52, fontFace: FONT, fontSize: 11.5, color: INK_SOFT, valign: "middle" });
      });
      s.addText("Search-as-you-type, powered by the ICD-API.", { x: 0.95, y: 5.55, w: 5.4, h: 0.4, fontFace: FONT, fontSize: 11, italic: true, color: INK_SOFT });
      // result
      s.addShape(p.ShapeType.roundRect, { x: 6.8, y: 2.5, w: 5.85, h: 3.7, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: "D9E6E7", width: 1 } });
      s.addText("Picked & refined", { x: 7.05, y: 2.65, w: 5.4, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: TEAL });
      s.addText("Malaria — P. falciparum", { x: 7.05, y: 2.95, w: 5.4, h: 0.4, fontFace: SERIF, fontSize: 18, bold: true, color: TEAL_DK });
      s.addShape(p.ShapeType.roundRect, { x: 7.05, y: 3.55, w: 2.6, h: 1.15, rectRadius: 0.06, fill: { color: "F1E9FB" }, line: { color: PURPLE, width: 1 } });
      s.addText("ICD-11 cluster", { x: 7.2, y: 3.65, w: 2.3, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: INK_SOFT });
      s.addText("1F40", { x: 7.2, y: 3.95, w: 2.3, h: 0.5, fontFace: "Consolas", fontSize: 18, bold: true, color: PURPLE });
      s.addShape(p.ShapeType.roundRect, { x: 9.85, y: 3.55, w: 2.6, h: 1.15, rectRadius: 0.06, fill: { color: TEAL_LT }, line: { color: TEAL, width: 1 } });
      s.addText("HCD (auto)", { x: 10.0, y: 3.65, w: 2.3, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: INK_SOFT });
      s.addText("HCD-COM-01.Pf", { x: 10.0, y: 3.95, w: 2.4, h: 0.5, fontFace: "Consolas", fontSize: 13, bold: true, color: TEAL_DK });
      s.addText("✔ ICD-11 stored for NHIS/global reporting; HCD drives our local dashboard.", { x: 7.05, y: 5.0, w: 5.4, h: 0.9, fontFace: FONT, fontSize: 12, color: GREEN });
      footer(s, 10);

      /* 11. ROADMAP */
      s = p.addSlide(); header(s, "Making it real", "Implementation roadmap");
      var ph = [
        ["0–3 mo", "Define & map", "Catalogue our top 50 conditions; map each to ICD-11."],
        ["3–6 mo", "Build into the EMR", "Embed the coding tool; auto-store ICD-11 behind every HCD entry."],
        ["6–9 mo", "Train & pilot", "Short bedside training; pilot in OPD; audit weekly."],
        ["9–12 mo", "Scale & report", "Hospital-wide; live dashboard; auto NHIS reports."]
      ];
      ph.forEach(function (q, i) {
        var y = 2.15 + i * 1.2;
        s.addShape(p.ShapeType.ellipse, { x: 0.7, y: y, w: 0.62, h: 0.62, fill: { color: TEAL } });
        s.addText(String(i + 1), { x: 0.7, y: y, w: 0.62, h: 0.62, fontFace: SERIF, fontSize: 17, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
        s.addText(q[0], { x: 1.55, y: y - 0.02, w: 2, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: ACCENT });
        s.addText(q[1], { x: 1.55, y: y + 0.24, w: 4, h: 0.4, fontFace: SERIF, fontSize: 16, bold: true, color: TEAL_DK });
        s.addText(q[2], { x: 5.5, y: y, w: 7.2, h: 0.85, fontFace: FONT, fontSize: 13.5, color: INK_SOFT, valign: "middle" });
      });
      footer(s, 11);

      /* 12. CLOSE */
      s = p.addSlide();
      s.background = { color: TEAL_DK };
      s.addShape(p.ShapeType.ellipse, { x: -2, y: H - 5, w: 8, h: 8, fill: { color: TEAL, transparency: 70 } });
      s.addText("A global standard, a local advantage", { x: 1, y: 2.4, w: 11.3, h: 1.2, fontFace: SERIF, fontSize: 36, bold: true, color: "FFFFFF", align: "center" });
      s.addText("ICD-11 modernises classification. HCD lets us use it on our own terms — faster, local, still globally compatible.", { x: 2, y: 3.7, w: 9.3, h: 1, fontFace: FONT, fontSize: 16, color: "CFEAEB", align: "center" });
      s.addText([{ text: "Dr Manuwa Tolu\n", options: { bold: true, fontSize: 18, color: "FFFFFF" } }, { text: "Harvey Road General Hospital, Yaba, Lagos", options: { fontSize: 13, color: "A9D6D8" } }], { x: 2, y: 5.0, w: 9.3, h: 0.9, fontFace: FONT, align: "center" });
      s.addText("Thank you.", { x: 2, y: 6.0, w: 9.3, h: 0.5, fontFace: SERIF, fontSize: 22, italic: true, color: ACCENT, align: "center" });

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
