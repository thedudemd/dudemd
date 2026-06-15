export type AffiliateVariant = 'banner' | 'inline' | 'card'

export interface AffiliateOffer {
  key: string
  name: string
  category: string
  status: 'active' | 'paused'
  url: string
  trackingParams: string
  buttonText: string
  headline: string
  description?: string
  variants: AffiliateVariant[]
}

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  // Add offers here. Editor and frontend both read from this file.
  // Example (remove or replace with real offers):
  {
    key: 'example-offer',
    name: 'Example Offer',
    category: 'fitness',
    status: 'active',
    url: 'https://example.com',
    trackingParams: '?ref=dudemd&utm_source=dudemd&utm_medium=editorial',
    buttonText: 'Shop Now',
    headline: 'Example Headline',
    description: 'Optional description shown in CTA block.',
    variants: ['banner', 'inline', 'card'],
  },
]

export function getActiveOffers(): AffiliateOffer[] {
  return AFFILIATE_OFFERS.filter(o => o.status === 'active')
}

export function getOfferByKey(key: string): AffiliateOffer | undefined {
  return AFFILIATE_OFFERS.find(o => o.key === key)
}

export function buildAffiliateUrl(offer: AffiliateOffer): string {
  return offer.url + offer.trackingParams
}
