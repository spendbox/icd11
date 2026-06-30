# The ICD, explained — Harvey Road General Hospital, Yaba

Two sleek **web presentations** on the WHO International Classification of Diseases,
for **Harvey Road General Hospital, Yaba, Lagos**:

- **`/icd10`** — *Understanding ICD-10*: history, how a code reads, the 22 chapters,
  the dagger/asterisk system, and ICD-10's limitations. Self-contained, animated, no
  network calls.
- **`/icd11`** — *Understanding ICD-11*: the modern, digital-native successor —
  post-coordination, a live WHO-API coder, an encounter coder, and the HCD discussion.
- **`/`** — a small landing page that links to both decks.

**Presented by Dr Manuwa Tolu.**

## Inside the ICD-11 deck

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

## Inside the ICD-10 deck

- **A short history** of classifying disease, with ICD-10's three-decade run.
- **ICD-10 in brief** — the headline facts (1994 · 22 chapters · ~14,400 codes).
- **Anatomy of a code** — reading `I21.0` segment by segment (animated).
- **The 22 chapters** — the full A00–U85 map.
- **Codes in practice** — everyday ward diagnoses + a typed search walkthrough.
- **Dagger † & asterisk *** — ICD-10's dual-coding system.
- **Limitations** — where ICD-10 strains, and why ICD-11 followed.

Animations are pure CSS/JS; motion respects `prefers-reduced-motion`. The write-freely
demo matches offline by default and uses the OpenAI `icd-parse` function when configured.

## Run locally

It's a static site — serve the folder:

```bash
python3 -m http.server 8080
# landing page:   http://localhost:8080/
# ICD-10 deck:    http://localhost:8080/icd10/
# ICD-11 deck:    http://localhost:8080/icd11/
```

The decks share one design system: `assets/css/styles.css` (base + components) plus
`assets/js/deck.js` (the navigation engine). The ICD-10 deck layers on
`assets/css/icd10.css` and `assets/js/icd10.js` for its animations; the ICD-11 deck
adds `emr.js`/`encounter.js` for its live coders.

## Live coders & environment variables

Interactive slides talk to the Netlify functions:

- **Live ICD-11 coder** (ICD-11 deck) — search → pick → add *context-aware* extensions.
- **Encounter coder** (ICD-11 deck) — type a free-text clinical picture (or shorthand
  like `T2DM`); it parses the problems, suggests ICD-11 clusters as pills, and builds
  a ward problem list with a clinical course per problem.
- **Write-freely demo** (ICD-10 deck) — type a diagnosis the way you mean it; it keeps
  the raw text and suggests ICD-10 code pills to multi-select. Uses the same OpenAI
  `icd-parse` function to read shorthand/prose when configured, mapping the extracted
  problems against a local ICD-10 set; otherwise it matches offline.

Both work out of the box with built-in sample data. To go fully live, set these
in **Netlify → Site settings → Environment variables**:

| Variable | Purpose | Required |
| --- | --- | --- |
| `WHO_CLIENT_ID` / `WHO_CLIENT_SECRET` | WHO ICD-11 API credentials ([register free](https://icd.who.int/icdapi)) | for live ICD-11 search |
| `WHO_ICD_RELEASE` | MMS release, e.g. `2024-01` | optional |
| `OPENAI_API_KEY` | enables the AI narrative parser (ICD-11 Encounter coder **and** the ICD-10 write-freely demo) | optional |
| `OPENAI_MODEL` | OpenAI model (default `gpt-4o-mini`) | optional |

Without `OPENAI_API_KEY` the Encounter coder and the ICD-10 write-freely demo use a
built-in rule-based parser; without the WHO credentials the ICD-11 coders use the
built-in sample dataset (the ICD-10 demo always matches against its local set).

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
index.html              # landing page (links both decks)
icd10/index.html        # Understanding ICD-10 deck
icd11/index.html        # Understanding ICD-11 deck
assets/
  css/styles.css        # shared theme, layout & components
  css/icd10.css         # ICD-10-only components + animations
  js/deck.js            # shared navigation engine (+ slide:enter event)
  js/icd10.js           # ICD-10 count-up + typewriter flourishes
  js/emr.js             # ICD-11 sample dataset + clinical helpers
  js/encounter.js       # ICD-11 encounter coder
  img/logo.jpeg         # hospital crest
  img/favicon.svg
netlify/functions/      # WHO ICD-11 API proxy + narrative parser (ICD-11 deck)
netlify.toml            # Netlify config (publish ".")
```

> Both decks reference assets with `../assets/…`; the landing page uses `assets/…`.
> The Netlify functions live at the site root, so the ICD-11 deck's absolute
> `/.netlify/functions/…` calls keep working from `/icd11/`.

## Notes & disclaimer

The diagnosis engine and the codes shown are **illustrative decision-support for this
presentation only**. ICD-11 codes are representative; HCD is a proposed local scheme.
ICD-11 is a product of the **World Health Organization**. Clinical judgement always
prevails.
