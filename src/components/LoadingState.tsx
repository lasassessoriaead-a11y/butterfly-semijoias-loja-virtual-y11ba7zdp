import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoadingGrid() {
  return (
    <div className="product-grid" aria-label="Carregando produtos">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] rounded-sm bg-emerald-50" />
          <div className="mt-4 h-5 w-2/3 rounded bg-emerald-50" />
          <div className="mt-2 h-4 w-1/3 rounded bg-emerald-50" />
        </div>
      ))}
    </div>
  )
}

export function CenteredLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-emerald-deep">
      <LoaderCircle className="size-7 animate-spin text-gold" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-sm border border-amber-200 bg-amber-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 size-7 text-amber-700" />
      <p className="text-sm text-amber-950">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
