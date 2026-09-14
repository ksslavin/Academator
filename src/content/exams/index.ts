import type { ExamMock } from '../../lib/types'
import { fullGcseExam } from './full-gcse'
import { groupAExam } from './group-a'
import { marchExam } from './march'
import { novemberExam } from './november'
import { year10Exam } from './year10'

export const EXAMS: ExamMock[] = [groupAExam, year10Exam, novemberExam, marchExam, fullGcseExam]

export function getExam(id: string): ExamMock | undefined {
  return EXAMS.find((exam) => exam.id === id)
}

export function listExams(): ExamMock[] {
  return EXAMS
}
