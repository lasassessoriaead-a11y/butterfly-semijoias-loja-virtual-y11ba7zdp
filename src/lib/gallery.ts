export interface ProductGalleryImage {
  url: string
  alt: string
}

/**
 * Deriva a galeria de fotos de um produto a partir dos campos `images` e
 * `photos` do catálogo ao vivo do Butterfly Gestão, aceitando strings ou
 * objetos ({ url, src, ... }). O campo singular `photo` — e por fim
 * `image_url` — continuam como alternativa para registros antigos com uma
 * única foto. As URLs são deduplicadas, preservando a ordem do Gestão.
 */
export function productGalleryImages(
  product:
    | {
        images?: unknown
        photos?: unknown
        photo?: string
        image_url?: string
        image_alt?: string
        name?: string
      }
    | null
    | undefined,
): ProductGalleryImage[] {
  if (!product) return []
  const seen = new Set<string>()
  const out: ProductGalleryImage[] = []
  const fallbackAlt = product.image_alt || product.name || 'Foto do produto'
  const push = (value: unknown) => {
    let url = ''
    if (typeof value === 'string') url = value.trim()
    else if (value && typeof value === 'object') {
      const obj = value as { url?: unknown; src?: unknown; photo?: unknown; image?: unknown }
      url = String(
        (typeof obj.url === 'string' && obj.url) ||
          (typeof obj.src === 'string' && obj.src) ||
          (typeof obj.photo === 'string' && obj.photo) ||
          (typeof obj.image === 'string' && obj.image) ||
          '',
      ).trim()
    }
    if (!url || seen.has(url)) return
    seen.add(url)
    out.push({ url, alt: fallbackAlt })
  }

  const fromList = (list: unknown) => {
    if (Array.isArray(list)) list.forEach(push)
  }
  fromList(product.images)
  fromList(product.photos)
  if (product.photo) push(product.photo)
  if (product.image_url) push(product.image_url)
  return out
}

/**
 * Fotos da variação selecionada (ex.: cor/tamanho da t-shirt). Cada variação
 * usa SOMENTE as próprias fotos — nunca as fotos de outra variação. Quando a
 * variação não traz fotos próprias, cai para `fallback` (foto do modelo).
 */
export function variantGalleryImages(
  variant: { images?: unknown; photos?: unknown; photo?: string } | null | undefined,
  fallback?: string,
): ProductGalleryImage[] {
  const own = productGalleryImages(variant as never)
  if (own.length > 0) return own
  if (fallback) return [{ url: fallback, alt: '' }]
  return []
}
