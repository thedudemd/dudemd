export type AffiliateVariant = 'banner' | 'inline' | 'card'

export interface AffiliateOffer {
  id?: string
  key: string
  name: string
  category: string
  status: 'active' | 'paused'
  url: string
  tracking_params: string
  button_text: string
  headline: string
  description?: string
  variants: AffiliateVariant[]
}

export function getOfferByKey(key: string, offers: AffiliateOffer[]): AffiliateOffer | undefined {
  return offers.find(o => o.key === key)
}

export function buildAffiliateUrl(offer: AffiliateOffer): string {
  const base = offer.url.trim()
  if (!base.startsWith('http://') && !base.startsWith('https://')) return ''
  const params = (offer.tracking_params || '').trim().replace(/^[?&]+/, '')
  if (!params) return base
  const separator = base.includes('?') ? '&' : '?'
  return base + separator + params
}
