import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { getExam } from '../content'
import { ExamCalculator } from '../components/ExamCalculator'
import { FormulaSheet } from '../components/FormulaSheet'
import { PaperQuestion } from '../components/QuestionForm'
import { Timer } from '../components/Timer'
import { useProgress } from '../components/ProgressProvider'
import { Card, PrimaryButton, SecondaryButton } from '../components/ui'
import { combineExamSit, examPaperTotal, examQuestions, previousPapersComplete } from '../lib/exam'
import { buildAttempt } from '../lib/grades'
import { recordExamSit } from '../lib/progress'
import type { ExamDraft, ExamPaperSit } from '../lib/types'

export const Route = createFileRoute('/mocks_/$mockId/sit/$paperId')({
  component: ExamSitPage,
})

function ExamSitPage() {
  const { mockId, paperId } = Route.useParams()
  const exam = getExam(mockId)
  const paper = exam?.papers.find((item) => item.id === paperId)
  const { state, update } = useProgress()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const questions = paper ? examQuestions(paper, state.tier) : []
  const completed = state.examInProgress?.mockId === mockId ? state.examInProgress.papers : []
  const draft = state.examDraft?.mockId === mockId && state.examDraft.paperId === paperId ? state.examDraft : undefined
  const alreadyDone = completed.find((item) => item.paperId === paperId)
  const unlocked = exam ? previousPapersComplete(exam, paperId, completed) : false

  useEffect(() => {
    if (!exam || !paper || alreadyDone || !unlocked || draft) return
    const startedAt = Date.now()
    const nextDraft: ExamDraft = {
      mockId: exam.id,
      paperId: paper.id,
      startedAt,
      endsAt: startedAt + paper.durationMinutes * 60 * 1000,
      answers: {},
    }
    update((current) => ({
      ...current,
      lastPath: `/mocks/${exam.id}/sit/${paper.id}`,
      examDraft: nextDraft,
      examInProgress:
        current.examInProgress?.mockId === exam.id
          ? current.examInProgress
          : { mockId: exam.id, papers: [] },
    }))
  }, [alreadyDone, draft, exam, paper, unlocked, update])

  const submit = useCallback(() => {
    if (!exam || !paper) return
    update((current) => {
      const currentDraft =
        current.examDraft?.mockId === exam.id && current.examDraft.paperId === paper.id
          ? current.examDraft
          : undefined
      if (!currentDraft) return current
      const result = buildAttempt({
        questions,
        answers: currentDraft.answers,
        startedAt: currentDraft.startedAt,
      })
      const paperSit: ExamPaperSit = {
        paperId: paper.id,
        title: paper.title,
        calculator: paper.calculator,
        result,
        answers: currentDraft.answers,
      }
      const prior = current.examInProgress?.mockId === exam.id ? current.examInProgress.papers : []
      const papers = [...prior.filter((item) => item.paperId !== paper.id), paperSit]
      const lastPaper = exam.papers.at(-1)?.id === paper.id
      if (lastPaper) {
        return recordExamSit(current, combineExamSit({ exam, papers }))
      }
      return {
        ...current,
        examDraft: undefined,
        examInProgress: { mockId: exam.id, papers },
        lastPath: `/mocks/${exam.id}`,
      }
    })
    const lastPaper = exam.papers.at(-1)?.id === paper.id
    void navigate({
      to: lastPaper ? '/mocks/$mockId/review' : '/mocks/$mockId',
      params: { mockId: exam.id },
    })
  }, [exam, navigate, paper, questions, update])

  if (!exam || !paper) {
    return (
      <Card>
        <p>Paper not found.</p>
        <Link to="/mocks" className="mt-3 inline-flex text-sm font-semibold text-teal-800">
          Back to mocks
        </Link>
      </Card>
    )
  }

  if (alreadyDone) {
    return (
      <Card className="space-y-3">
        <h1 className="font-serif text-2xl">{paper.title} already submitted</h1>
        <p className="text-slate-700">
          {alreadyDone.result.marks}/{alreadyDone.result.total} · {alreadyDone.result.percent}%
        </p>
        <Link to="/mocks/$mockId" params={{ mockId: exam.id }}>
          <PrimaryButton>Back to paper list</PrimaryButton>
        </Link>
      </Card>
    )
  }

  if (!unlocked) {
    return (
      <Card className="space-y-3">
        <h1 className="font-serif text-2xl">Sit the earlier paper first</h1>
        <p className="text-slate-700">Papers in this mock must be taken in sequence.</p>
        <Link to="/mocks/$mockId" params={{ mockId: exam.id }}>
          <PrimaryButton>Back to {exam.title}</PrimaryButton>
        </Link>
      </Card>
    )
  }

  if (!draft) {
    return <p className="text-slate-600">Starting the timer…</p>
  }

  const paused = draft.pausedRemainingMs !== undefined
  const total = examPaperTotal(paper, state.tier)
  const nonCalc = paper.calculator === 'non-calc'

  const pause = () => {
    update((current) => {
      if (!current.examDraft || current.examDraft.paperId !== paper.id) return current
      return {
        ...current,
        examDraft: {
          ...current.examDraft,
          pausedRemainingMs: Math.max(0, current.examDraft.endsAt - Date.now()),
        },
      }
    })
  }

  const resume = () => {
    update((current) => {
      if (!current.examDraft || current.examDraft.pausedRemainingMs === undefined) return current
      return {
        ...current,
        examDraft: {
          ...current.examDraft,
          endsAt: Date.now() + current.examDraft.pausedRemainingMs,
          pausedRemainingMs: undefined,
        },
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[4.25rem] z-20 space-y-2 rounded-2xl border border-stone-200 bg-[rgba(246,241,232,0.95)] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {exam.title} · {paper.title}
            </p>
            <p className="text-xs text-slate-600">
              {total} marks · {nonCalc ? 'non-calculator' : 'calculator allowed'} · mark on submit
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Timer
              endsAt={draft.endsAt}
              paused={paused}
              remainingMs={draft.pausedRemainingMs}
              onExpire={submit}
            />
            {paused ? (
              <SecondaryButton onClick={resume}>Resume</SecondaryButton>
            ) : (
              <SecondaryButton onClick={pause}>Pause</SecondaryButton>
            )}
            <SecondaryButton onClick={() => setSheetOpen(true)}>Formula sheet</SecondaryButton>
            <PrimaryButton onClick={submit}>Submit paper</PrimaryButton>
          </div>
        </div>
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            nonCalc ? 'bg-amber-50 text-amber-950' : 'bg-teal-50 text-teal-900'
          }`}
        >
          {nonCalc
            ? 'Non-calculator paper. Use the formula sheet only — there is no calculator on this paper.'
            : 'Calculator paper. The in-app calculator is available. You may also use the formula sheet.'}
        </p>
      </div>

      <div className={nonCalc ? 'space-y-4' : 'grid gap-4 lg:grid-cols-[1fr_16rem]'}>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <PaperQuestion
              key={question.id}
              question={question}
              index={index}
              total={questions.length}
              answers={draft.answers}
              onChange={(partId, value) =>
                update((current) => {
                  if (!current.examDraft || current.examDraft.paperId !== paper.id) return current
                  return {
                    ...current,
                    examDraft: {
                      ...current.examDraft,
                      answers: { ...current.examDraft.answers, [partId]: value },
                    },
                  }
                })
              }
            />
          ))}
          <PrimaryButton className="w-full" onClick={submit}>
            Submit {paper.title}
          </PrimaryButton>
        </div>
        {nonCalc ? null : (
          <div className="lg:sticky lg:top-[12rem]">
            <ExamCalculator />
          </div>
        )}
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--paper)] p-5 shadow-xl">
            <FormulaSheet onClose={() => setSheetOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
