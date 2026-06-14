'use client'

export default function PrivacySettingsButton() {
  function openConsentBanner() {
    try {
      if (typeof window !== 'undefined' && (window as any).googlefc) {
        (window as any).googlefc.callbackQueue = (window as any).googlefc.callbackQueue || []
        ;(window as any).googlefc.callbackQueue.push(
          (window as any).googlefc.showRevocationMessage
        )
      }
    } catch (e) {}
  }

  return (
    <button
      onClick={openConsentBanner}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        color: 'rgba(247,244,238,0.3)',
        padding: 0,
        textDecoration: 'underline',
        fontFamily: 'inherit'
      }}
    >
      Privacy Settings
    </button>
  )
}
