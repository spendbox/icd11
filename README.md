# ICD-11 &amp; HCD — Harvey Road General Hospital, Yaba

A sleek, single-page **web presentation** on the WHO **ICD-11** classification, how
it differs from **ICD-10**, and the case for **HCD** — the *Harvey-road Classification
of Diseases*, a proposed local classification layer for **Harvey Road General Hospital,
Yaba, Lagos**.

**Presented by Dr Manuwa Tolu.**

## What's inside

- **What the ICD is** and why classification matters.
- **ICD-11 overview** — Foundation Component, stem codes, post-coordination/clustering.
- **ICD-10 vs ICD-11** side-by-side comparison table.
- **Worked coding examples** (malaria, diabetes + neuropathy, fracture, pneumonia).
- **Pros &amp; cons** of ICD-11 — and of HCD.
- **HCD** — what it is, why HRGH needs it, how a code is structured, and how it maps
  1-to-1 back to a valid ICD-11 cluster.
- **Live interactive demo** — a mock EMR encounter form. Enter the clinical picture and
  a rule-based engine derives the most likely diagnosis, shows its reasoning, and assigns
  both an **HCD** code and the **ICD-11** cluster it maps to.
- **Implementation roadmap.**

## Download the deck

Two export options are built in (top-right buttons):

- **PowerPoint** — generates a real `.pptx` file entirely in the browser
  (via [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)). No server needed.
- **PDF** — opens the browser print dialog with a print-optimised stylesheet;
  choose *Save as PDF*.

## Run locally

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy on Netlify

This repo is Netlify-ready (`netlify.toml` is included; no build step).

**Option A — Git (recommended)**
1. Push this branch to GitHub.
2. In Netlify: *Add new site → Import an existing project → pick this repo*.
3. Build command: *(leave blank)* · Publish directory: `.`
4. Deploy.

**Option B — drag &amp; drop**
- Drag the project folder onto <https://app.netlify.com/drop>.

**Option C — Netlify CLI**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

## Project structure

```
index.html              # the presentation
assets/
  css/styles.css        # theme & layout
  js/emr.js             # mock diagnosis engine (knowledge base + scoring)
  js/deck.js            # navigation, scroll reveals, demo wiring
  js/export.js          # PowerPoint (.pptx) generation
  img/logo.svg          # hospital crest
  img/favicon.svg
netlify.toml            # Netlify config
```

## Notes & disclaimer

The diagnosis engine and the codes shown are **illustrative decision-support for this
presentation only**. ICD-11 codes are representative; HCD is a proposed local scheme.
ICD-11 is a product of the **World Health Organization**. Clinical judgement always
prevails.
