import { createFileRoute } from '@tanstack/react-router'
import { FormulaSheet } from '../components/FormulaSheet'

export const Route = createFileRoute('/formulas')({ component: FormulasPage })

function FormulasPage() {
  return <FormulaSheet />
}
