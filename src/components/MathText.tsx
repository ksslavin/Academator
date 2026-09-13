import katex from 'katex'

type Piece =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }
  | { type: 'bold'; value: string }

function splitPieces(input: string): Piece[] {
  const pieces: Piece[] = []
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[^*]+?\*\*)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(input))) {
    if (match.index > last) {
      pieces.push({ type: 'text', value: input.slice(last, match.index) })
    }
    const token = match[0]
    if (token.startsWith('$$')) {
      pieces.push({ type: 'math', value: token.slice(2, -2), display: true })
    } else if (token.startsWith('$')) {
      pieces.push({ type: 'math', value: token.slice(1, -1), display: false })
    } else {
      pieces.push({ type: 'bold', value: token.slice(2, -2) })
    }
    last = match.index + token.length
  }
  if (last < input.length) {
    pieces.push({ type: 'text', value: input.slice(last) })
  }
  return pieces
}

function renderMath(value: string, display: boolean): string {
  try {
    return katex.renderToString(value, {
      throwOnError: false,
      displayMode: display,
    })
  } catch {
    return value
  }
}

export function MathText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const pieces = splitPieces(text)
  return (
    <span className={className}>
      {pieces.map((piece, index) => {
        if (piece.type === 'math') {
          return (
            <span
              key={index}
              className={piece.display ? 'block my-2 overflow-x-auto' : 'inline'}
              dangerouslySetInnerHTML={{ __html: renderMath(piece.value, piece.display) }}
            />
          )
        }
        if (piece.type === 'bold') {
          return (
            <strong key={index} className="font-semibold">
              {piece.value}
            </strong>
          )
        }
        return <span key={index}>{piece.value}</span>
      })}
    </span>
  )
}
