import { useMemo, useState } from 'react'
import type { Question } from '../lib/types'
import { flattenParts } from '../lib/types'
import { markQuestion } from '../lib/marking'
import { MathText } from './MathText'
import { Pill, PrimaryButton, SecondaryButton, cn } from './ui'

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
        <Pill>{question.marks} mark{question.marks === 1 ? '' : 's'}</Pill>
        {question.tier !== 'both' ? <Pill tone={question.tier === 'H' ? 'h' : 'f'}>{question.tier}</Pill> : null}
        <Pill tone="muted">{question.skill}</Pill>
      </div>
      <div className="text-lg leading-relaxed text-slate-900">
        <MathText text={question.prompt} />
      </div>
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
  const result = useMemo(() => (marked ? markQuestion(question, answers) : null), [answers, marked, question])

  return (
    <div className="space-y-5">
      <QuestionPrompt question={question} index={index} total={total} />
      <PartInputs
        question={question}
        answers={answers}
        disabled={marked}
        onChange={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
      />
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
          <div className="mt-3 space-y-2 text-sm text-slate-800">
            <p className="font-medium">Full solution</p>
            {(question.parts ?? [{ solution: question.solution ?? [], label: '', id: question.id }]).map((part) => (
              <div key={part.id || 'main'}>
                {part.label ? <p className="font-semibold">Part {part.label}</p> : null}
                <ol className="list-decimal space-y-1 pl-5">
                  {(part.solution ?? []).map((step) => (
                    <li key={step}>
                      <MathText text={step} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <SecondaryButton onClick={onPrev} disabled={index === 0}>
          Previous
        </SecondaryButton>
        {!marked ? (
          <PrimaryButton
            onClick={() => {
              const next = markQuestion(question, answers)
              setMarked(true)
              onMarked(answers, next.correct)
            }}
          >
            Mark
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onNext}>{index === total - 1 ? 'Finish' : 'Next'}</PrimaryButton>
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
