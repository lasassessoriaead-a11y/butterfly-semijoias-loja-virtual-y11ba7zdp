import logoDark from '@/assets/butterfly-app-13d68.png'
import logoBanner from '@/assets/butterfly-fundo-pagina-facebook-1bbae.png'
import logoLight from '@/assets/butterfly-logo-865bc.png'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'banner'
  className?: string
  eager?: boolean
}

export function BrandLogo({ variant = 'light', className, eager = false }: BrandLogoProps) {
  const source = variant === 'light' ? logoLight : variant === 'dark' ? logoDark : logoBanner
  const alt = variant === 'dark' ? 'Símbolo oficial Butterfly SEMIJOIAS' : 'Butterfly SEMIJOIAS'

  return (
    <img
      src={source}
      alt={alt}
      className={cn('brand-logo', `brand-logo--${variant}`, className)}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
    />
  )
}
