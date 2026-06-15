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
  return offer.url + (offer.tracking_params || '')
}
