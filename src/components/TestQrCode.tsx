import { useMemo } from 'react'

type QrMatrix = boolean[][]

function stringToBytes(value: string) {
  return new TextEncoder().encode(value)
}

function createPseudoQr(value: string, size = 29): QrMatrix {
  const matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false))

  const finder = (startX: number, startY: number) => {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const px = startX + x
        const py = startY + y
        if (px < 0 || py < 0 || px >= size || py >= size) continue
        reserved[py][px] = true
        matrix[py][px] =
          x >= 0 &&
          x <= 6 &&
          y >= 0 &&
          y <= 6 &&
          (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4))
      }
    }
  }

  finder(0, 0)
  finder(size - 7, 0)
  finder(0, size - 7)

  const bytes = stringToBytes(value)
  let state = 2166136261
  for (const byte of bytes) {
    state ^= byte
    state = Math.imul(state, 16777619)
  }

  const nextBit = () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) & 1
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!reserved[y][x]) matrix[y][x] = Boolean(nextBit() ^ ((x + y) % 3 === 0 ? 1 : 0))
    }
  }
  return matrix
}

export function TestQrCode({
  value,
  label = 'QR Code Pix de teste',
}: {
  value: string
  label?: string
}) {
  const matrix = useMemo(() => createPseudoQr(value), [value])
  const size = matrix.length

  return (
    <svg
      viewBox={`0 0 ${size + 8} ${size + 8}`}
      role="img"
      aria-label={label}
      className="h-full w-full bg-white"
    >
      <rect width={size + 8} height={size + 8} fill="#FFFFFF" />
      <g transform="translate(4 4)" fill="#075746">
        {matrix.flatMap((row, y) =>
          row.map((filled, x) =>
            filled ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
          ),
        )}
      </g>
    </svg>
  )
}
