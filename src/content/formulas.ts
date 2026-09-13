export type FormulaGroup = {
  title: string
  items: Array<{ name: string; body: string; higher?: boolean }>
}

export const FORMULA_GROUPS: FormulaGroup[] = [
  {
    title: 'Number',
    items: [
      { name: 'Percentage of an amount', body: '$p\\%$ of $A = \\dfrac{p}{100} \\times A$' },
      { name: 'Increase / decrease', body: 'New $= A \\times (1 \\pm \\dfrac{p}{100})$' },
      { name: 'Reverse percentage', body: 'Original $= \\dfrac{\\text{new}}{\\text{multiplier}}$' },
      { name: 'Compound change', body: 'Final $= A \\times (\\text{multiplier})^n$', higher: true },
      { name: 'Index laws', body: '$a^m a^n = a^{m+n}$, $\\dfrac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{mn}$' },
      { name: 'Standard form', body: '$a \\times 10^n$ with $1 \\le a < 10$' },
    ],
  },
  {
    title: 'Algebra',
    items: [
      { name: 'Linear equation', body: 'Do the same to both sides; expand brackets first.' },
      { name: 'Straight line', body: '$y = mx + c$ ($m$ gradient, $c$ intercept)' },
      { name: 'Quadratic formula', body: '$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', higher: true },
    ],
  },
  {
    title: 'Ratio and measures',
    items: [
      { name: 'Sharing in a ratio $a:b$', body: 'One part $= \\dfrac{\\text{total}}{a+b}$' },
      { name: 'Speed', body: 'speed $= \\dfrac{\\text{distance}}{\\text{time}}$' },
      { name: 'Density', body: 'density $= \\dfrac{\\text{mass}}{\\text{volume}}$' },
      { name: 'Pressure', body: 'pressure $= \\dfrac{\\text{force}}{\\text{area}}$' },
    ],
  },
  {
    title: 'Geometry',
    items: [
      { name: 'Area of a triangle', body: '$\\dfrac{1}{2}bh$' },
      { name: 'Area of a trapezium', body: '$\\dfrac{1}{2}(a+b)h$' },
      { name: 'Circle', body: '$C = 2\\pi r$, $A = \\pi r^2$' },
      { name: 'Prism volume', body: 'area of cross-section $\\times$ length' },
      { name: 'Cylinder', body: '$V = \\pi r^2 h$' },
      { name: 'Pythagoras', body: '$a^2 + b^2 = c^2$ (right-angled triangle)' },
      { name: 'Trigonometry', body: '$\\sin\\theta = \\dfrac{o}{h}$, $\\cos\\theta = \\dfrac{a}{h}$, $\\tan\\theta = \\dfrac{o}{a}$' },
    ],
  },
  {
    title: 'Probability and statistics',
    items: [
      { name: 'Probability', body: '$P(\\text{event}) = \\dfrac{\\text{favourable}}{\\text{total}}$' },
      { name: 'Mean', body: '$\\dfrac{\\text{sum of values}}{\\text{how many values}}$' },
    ],
  },
]
