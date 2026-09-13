# Practice Book: GCSE Maths

Self-study web app for **England GCSE Maths 9–1** shared content (AQA / Edexcel / OCR). The repository and package name is **Academator**; the product name in the UI is **Practice Book: GCSE Maths**.

The study pattern is short chapter → theory → worked example → practice → timed test. All theory and questions in this repo are original. The app does not host past papers and does not use Bond, CGP, Collins, Pearson, or exam-board wording.

Progress is stored in the browser (`localStorage`). There are no accounts.

## Run

Requires Node.js 22+.

```bash
npm install
npm run dev
```

The Vite dev server listens on `http://0.0.0.0:8080` (`strictPort`).

```bash
npm run build
npm run preview
```

## Phase A

**Home** — continue last chapter, weak topics, next recommended test, Foundation / Higher switch.

**Library** — six books and all 30 chapter titles, with theory / practice / test bars. Wave 1 chapters are live; the rest are visible but locked.

**Live chapters** (theory, 12–20 practice questions, 15–20 mark timed test):

| Ch | Title | Book |
| --- | --- | --- |
| 4 | Fractions | 1 Number |
| 5 | Percentages (including reverse) | 1 Number |
| 11 | Linear equations | 2 Algebra |
| 17 | Ratio and sharing | 3 Ratio |

Each live chapter has **Theory · Practice · Test** tabs. Practice marks instantly and shows a full solution. The chapter test is about 20 minutes, marked on submit, then shows marks, percent, grade band (1–3 / 4–5 / 6–7 / 8–9), skill breakdown, and a link back to theory.

**Progress** — 30-chapter heatmap plus mock history. **Formula sheet** is always available from the header, `/formulas`, and inside a timed paper.

Higher-only items are tagged `H` and hidden on Foundation.

## Phase C — exam engine

The mocks hub is live. Each mock is sat as a **sequence of timed papers**. After the last paper you get a study grade-band estimate (1–3 / 4–5 / 6–7 / 8–9) and a question-by-question review (your answer, correct answer, solution). Sits are stored in local mock history.

| Mock | Shape | Coverage |
| --- | --- | --- |
| Group mock A | 1 × 45 min | Number, chapters 1–8 (from Phase A) |
| Year 10 mock | 2 × 60 min | Core chapters 1–23 (Foundation + intro Higher) |
| November mock | 3 × 90 min | Almost full spec (Y11 autumn) |
| March mock | 3 × 90 min | Full 30-chapter spec (Y11 spring) |
| Full GCSE mock | 3 × 90 min | Entire spec, filtered to the user's F/H tier |

Paper rules match AQA/Edexcel shape:

- **Paper 1** — non-calculator. Formula sheet only; the in-app calculator is hidden.
- **Papers 2 and 3** — calculator allowed (in-app 4-function + square root).
- Real countdown per paper, with **pause** and **submit**. Later papers stay locked until the previous paper is submitted.

Questions are **original** exam-style items tagged to topics/chapters. Papers are slightly thinner than a real board paper but sit-able, with an AO mix in the region of 50/25/25 Foundation or 40/30/30 Higher. They are not past papers and not official grade boundaries.

Exam content lives under `src/content/exams/`.

## Adding a chapter

Structured content lives under `src/content/` so later waves do not rebuild the UI.

1. Add the title to `src/content/catalog.ts` (already complete for all 30).
2. Write `src/content/chapters/chXX-title.ts` exporting a `ChapterContent` object.
3. Register it in `src/content/index.ts`.

Question helpers are in `src/content/make.ts` (`numeric`, `mc`, `multi`). Use `$...$` for KaTeX.

## Not in this phase

Accounts / auth, AI-generated unmarked questions, hosting past-paper PDFs, Wave 2–4 full chapter theory/practice bodies (Phase D), and exact official grade boundaries.

## Stack

TanStack Start, React 19, Vite, Tailwind CSS 4, TypeScript (strict), KaTeX. Mobile-first layout with large tap targets and no intended horizontal scroll.
