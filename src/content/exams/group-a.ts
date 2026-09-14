import { groupMockA } from '../mocks/group-a'
import type { ExamMock } from '../../lib/types'

export const groupAExam: ExamMock = {
  id: 'group-a',
  title: groupMockA.title,
  subtitle: groupMockA.subtitle,
  focus: groupMockA.focus,
  stage: 'group',
  papers: [
    {
      id: 'paper-1',
      title: 'Paper 1',
      calculator: 'non-calc',
      durationMinutes: groupMockA.durationMinutes,
      questions: groupMockA.questions,
    },
  ],
}
