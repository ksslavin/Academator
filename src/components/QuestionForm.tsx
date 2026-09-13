import { useMemo, useState } from 'react'
import type { Question } from '../lib/types'
import { flattenParts } from '../lib/types'
import { markQuestion } from '../lib/marking'
import { calculatorMode, hintsFor, solutionSteps } from '../lib/study'
import { MathText } from './MathText'
import { Pill, PrimaryButton, SecondaryButton, cn } from './ui'

export function CalculatorBadge({ question }: { question: Question }) {
  const mode = calculatorMode(question)
  return mode === 'calc' ? (
    <Pill tone="calc">Calculator</Pill>
  ) : (
    <Pill tone="noncalc">Non-calculator</Pill>
  )
}

export function QuestionPrompt({
  question,
  index,
  total,
}: {
  question: Question
  index?: number
  total?: number
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {index !== undefined && total !== undefined ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question {index + 1} of {total}
          </p>
        ) : null}
        <Pill>
          {question.marks} mark{question.marks === 1 ? '' : 's'}
        </Pill>
        <CalculatorBadge question={question} />
        {question.tier !== 'both' ? <Pill tone={question.tier === 'H' ? 'h' : 'f'}>{question.tier}</Pill> : null}
        <Pill tone="muted">{question.skill}</Pill>
      </div>
      <div className="text-lg leading-relaxed text-slate-900">
        <MathText text={question.prompt} />
      </div>
      {calculatorMode(question) === 'non-calc' ? (
        <p className="text-xs text-amber-900">Work this without a calculator.</p>
      ) : (
        <p className="text-xs text-indigo-800">A calculator is allowed for this question.</p>
      )}
    </div>
  )
}

function PartInputs({
  question,
  answers,
  onChange,
  disabled,
}: {
  question: Question
  answers: Record<string, string>
  onChange: (partId: string, value: string) => void
  disabled?: boolean
}) {
  const parts = flattenParts(question)
  return (
    <div className="space-y-4">
      {parts.map((part) => (
        <div key={part.id} className="space-y-2">
          {part.label || part.prompt ? (
            <p className="text-sm font-medium text-slate-800">
              {part.label ? <span className="mr-2">({part.label})</span> : null}
              {part.prompt ? <MathText text={part.prompt} /> : null}
              <span className="ml-2 text-xs font-normal text-slate-500">
                {part.marks} mark{part.marks === 1 ? '' : 's'}
              </span>
            </p>
          ) : null}
          {part.spec.kind === 'mc' ? (
            <div className="grid gap-2">
              {part.spec.choices.map((choice, choiceIndex) => {
                const selected = answers[part.id] === String(choiceIndex)
                return (
                  <label
                    key={choice}
                    className={cn(
                      'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2',
                      selected ? 'border-teal-700 bg-teal-50' : 'border-stone-200 bg-white',
                      disabled && 'cursor-default',
                    )}
                  >
                    <input
                      type="radio"
                      name={part.id}
                      className="h-5 w-5"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => onChange(part.id, String(choiceIndex))}
                    />
                    <MathText text={choice} />
                  </label>
                )
              })}
            </div>
          ) : (
            <input
              value={answers[part.id] ?? ''}
              disabled={disabled}
              onChange={(event) => onChange(part.id, event.target.value)}
              placeholder={part.spec.placeholder ?? 'Your answer'}
              className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base outline-none focus:border-teal-700"
              inputMode="text"
              autoComplete="off"
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StepList({
  steps,
  revealed,
}: {
  steps: ReturnType<typeof solutionSteps>
  revealed: number
}) {
  if (revealed <= 0) return null
  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-800">
      {steps.slice(0, revealed).map((step) => (
        <li key={step.key}>
          <span className="sr-only">{step.label}. </span>
          <MathText text={step.text} />
        </li>
      ))}
    </ol>
  )
}

export function PracticeQuestion({
  question,
  index,
  total,
  initial,
  onMarked,
  onNext,
  onPrev,
}: {
  question: Question
  index: number
  total: number
  initial?: { answers: Record<string, string>; marked: boolean }
  onMarked: (answers: Record<string, string>, correct: boolean) => void
  onNext: () => void
  onPrev: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial?.answers ?? {})
  const [marked, setMarked] = useState(Boolean(initial?.marked))
  const [hintCount, setHintCount] = useState(0)
  const [stepCount, setStepCount] = useState(initial?.marked ? solutionSteps(question).length : 0)
  const hints = hintsFor(question)
  const steps = solutionSteps(question)
  const result = useMemo(() => (marked ? markQuestion(question, answers) : null), [answers, marked, question])

  const retry = () => {
    setAnswers({})
    setMarked(false)
    setStepCount(0)
  }

  return (
    <div className="space-y-5">
      <QuestionPrompt question={question} index={index} total={total} />
      <PartInputs
        question={question}
        answers={answers}
        disabled={marked}
        onChange={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
      />
      {hintCount > 0 ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-800">
          <p className="font-semibold">Hints</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {hints.slice(0, hintCount).map((hint) => (
              <li key={hint}>
                <MathText text={hint} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {stepCount > 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">
            {stepCount >= steps.length ? 'Full solution' : `Worked steps (${stepCount} of ${steps.length})`}
          </p>
          <StepList steps={steps} revealed={stepCount} />
        </div>
      ) : null}
      {result ? (
        <div
          className={cn(
            'rounded-xl border p-4',
            result.correct ? 'border-teal-200 bg-teal-50' : 'border-amber-200 bg-amber-50',
          )}
        >
          <p className="font-semibold">
            {result.correct ? 'Correct' : 'Not quite'} · {result.marksAwarded}/{result.marksAvailable}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Use Show step to reveal the solution one line at a time, or retry the same question.
          </p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <SecondaryButton onClick={onPrev} disabled={index === 0}>
          Previous
        </SecondaryButton>
        <SecondaryButton
          onClick={() => setHintCount((count) => Math.min(hints.length, count + 1))}
          disabled={hintCount >= hints.length}
        >
          {hintCount === 0 ? 'Hint' : hintCount >= hints.length ? 'All hints shown' : 'Next hint'}
        </SecondaryButton>
        <SecondaryButton
          onClick={() => setStepCount((count) => Math.min(steps.length, count + 1))}
          disabled={stepCount >= steps.length}
        >
          {stepCount === 0 ? 'Show step' : stepCount >= steps.length ? 'All steps shown' : 'Show next step'}
        </SecondaryButton>
        {!marked ? (
          <PrimaryButton
            onClick={() => {
              const next = markQuestion(question, answers)
              setMarked(true)
              if (stepCount === 0) setStepCount(1)
              onMarked(answers, next.correct)
            }}
          >
            Mark
          </PrimaryButton>
        ) : (
          <>
            <SecondaryButton onClick={retry}>Try again</SecondaryButton>
            <PrimaryButton onClick={onNext}>{index === total - 1 ? 'Finish' : 'Next'}</PrimaryButton>
          </>
        )}
      </div>
    </div>
  )
}

export function PaperQuestion({
  question,
  index,
  total,
  answers,
  onChange,
}: {
  question: Question
  index: number
  total: number
  answers: Record<string, string>
  onChange: (partId: string, value: string) => void
}) {
  return (
    <article className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <QuestionPrompt question={question} index={index} total={total} />
      <PartInputs question={question} answers={answers} onChange={onChange} />
    </article>
  )
}

export function SolutionBlock({ question }: { question: Question }) {
  const parts = question.parts?.length
    ? question.parts
    : [{ id: question.id, label: '', solution: question.solution ?? [] }]
  return (
    <div className="space-y-2 text-sm text-slate-800">
      {parts.map((part) => (
        <div key={part.id}>
          {part.label ? <p className="font-semibold">Part {part.label}</p> : null}
          <ol className="list-decimal space-y-1 pl-5">
            {part.solution.map((step) => (
              <li key={step}>
                <MathText text={step} />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
