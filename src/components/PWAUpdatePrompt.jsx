import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { CAlert, CButton } from '@coreui/react'

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 380,
      }}
    >
      <CAlert color="primary" className="d-flex align-items-center gap-3 shadow mb-0">
        <div className="flex-grow-1 small">
          A new version of Globlo Admin is available.
        </div>
        <div className="d-flex gap-2 flex-shrink-0">
          <CButton size="sm" color="primary" onClick={() => updateServiceWorker(true)}>
            Reload
          </CButton>
          <CButton size="sm" color="light" onClick={() => setNeedRefresh(false)}>
            Dismiss
          </CButton>
        </div>
      </CAlert>
    </div>
  )
}

export default PWAUpdatePrompt
