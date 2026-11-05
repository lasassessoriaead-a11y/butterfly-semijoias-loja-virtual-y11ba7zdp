import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductGalleryImage } from '@/lib/gallery'

interface ProductGalleryProps {
  images: ProductGalleryImage[]
  alt: string
  className?: string
}

/**
 * Galeria de fotos do produto: imagem principal com setas de navegação e
 * miniaturas clicáveis, contador e suporte a arrastar (touch/mouse). Com uma
 * única foto (registros antigos, campo `photo`), renderiza apenas a imagem.
 * Adequada ao celular: botões grandes, área de toque ampla e swipe.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const [index, setIndex] = useState(0)
  const pointer = useRef<{ id: number; startX: number } | null>(null)

  const count = images.length
  const safeIndex = Math.min(index, Math.max(0, count - 1))
  const current = count > 0 ? images[Math.min(safeIndex, count - 1)] : undefined

  useEffect(() => {
    setIndex(0)
  }, [count > 0 ? images[0]?.url : ''])

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointer.current = { id: event.pointerId, startX: event.clientX }
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointer.current
    pointer.current = null
    if (!start || start.id !== event.pointerId || count < 2) return
    const delta = event.clientX - start.startX
    if (Math.abs(delta) > 40) goTo(safeIndex + (delta < 0 ? 1 : -1))
  }

  if (count === 0 || !current) return null

  return (
    <div className={cn('product-gallery', className)}>
      <div
        className="product-gallery__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={() => {}}
      >
        <img src={current.url} alt={current.alt || alt} className="product-gallery__image" />
        {count > 1 && (
          <>
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--left"
              aria-label="Foto anterior"
              onClick={() => goTo(safeIndex - 1)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--right"
              aria-label="Próxima foto"
              onClick={() => goTo(safeIndex + 1)}
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="product-gallery__counter">
              {safeIndex + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="product-gallery__thumbs" role="tablist" aria-label="Miniaturas do produto">
          {images.map((image, thumbIndex) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={thumbIndex === safeIndex}
              aria-label={`Ver foto ${thumbIndex + 1}`}
              className={cn(
                'product-gallery__thumb',
                thumbIndex === safeIndex && 'product-gallery__thumb--active',
              )}
              onClick={() => goTo(thumbIndex)}
            >
              <img src={image.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
