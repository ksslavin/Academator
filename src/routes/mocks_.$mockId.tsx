import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mocks_/$mockId')({ component: ExamLayout })

function ExamLayout() {
  return <Outlet />
}
