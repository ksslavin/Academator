# Practice Book: GCSE Maths

Self-study web app for **England GCSE Maths 9–1** shared content (AQA / Edexcel / OCR). The repository and package name is **Academator**; the product name in the UI is **Practice Book: GCSE Maths**.

The study pattern is short chapter → theory → worked example → practice → timed test. All theory and questions in this repo are original. The app does not host past papers and does not use Bond, CGP, Collins, Pearson, or exam-board wording.

Progress is stored in the browser (`localStorage`). There are no accounts in Phase A.

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

**Group mock A** — Number focus (chapters 1–8), about 45 minutes / ~40 marks. Other mocks (Year 11, November, March, full GCSE) are stubs.

**Progress** — 30-chapter heatmap plus mock history. **Formula sheet** is always available from the header and `/formulas`.

Higher-only items are tagged `H` and hidden on Foundation.

## Adding a chapter

Structured content lives under `src/content/` so later waves do not rebuild the UI.

1. Add the title to `src/content/catalog.ts` (already complete for all 30).
2. Write `src/content/chapters/chXX-title.ts` exporting a `ChapterContent` object.
3. Register it in `src/content/index.ts`.

Question helpers are in `src/content/make.ts` (`numeric`, `mc`, `multi`). Use `$...$` for KaTeX.

## Not in Phase A

Accounts / auth, AI question generation, past papers, teacher markbooks, and full Year / November / March / Full GCSE mock bodies.

## Stack

TanStack Start, React 19, Vite, Tailwind CSS 4, TypeScript (strict), KaTeX. Mobile-first layout with large tap targets and no intended horizontal scroll.
