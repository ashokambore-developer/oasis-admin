import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CBadge, CAlert,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'

// In dev Vite proxies /socket.io → backend. In prod use explicit backend URL if set.
const SOCKET_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || window.location.origin)
  : window.location.origin

const ROLE_COLOR = {
  ADMIN: 'danger', TRIP_MANAGER: 'primary',
  SERVICE_PROVIDER: 'warning', PHOTOGRAPHER: 'info',
}

const avatar = (u) => {
  if (u.profilePhotoUrl) {
    return (
      <img
        src={u.profilePhotoUrl} alt={u.name}
        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  const initials = u.name ? u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: '#321fdb',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  )
}

const LiveUsers = () => {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [connectedCount, setConnectedCount] = useState(null)
  const [users, setUsers] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      // Allow polling fallback — WebSocket-only breaks behind some proxies
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('joinAdmin')
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', (err) => {
      console.warn('[LiveUsers] socket connect_error:', err.message)
      setConnected(false)
    })

    socket.on('adminLiveUpdate', ({ connectedCount: count, timestamp, users: u = [] }) => {
      setConnectedCount(count)
      setUsers(u)
      setLastUpdated(new Date(timestamp))
      setHistory((prev) => [{ count, time: new Date(timestamp) }, ...prev].slice(0, 20))
    })

    return () => socket.disconnect()
  }, [])

  return (
    <CRow className="g-3">
      {/* ── Stats strip ── */}
      <CCol md={4}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Live Socket Connections</strong>
            <CBadge color={connected ? 'success' : 'secondary'}>
              {connected ? 'Connected' : 'Disconnected'}
            </CBadge>
          </CCardHeader>
          <CCardBody>
            {!connected && (
              <CAlert color="warning" className="small mb-3">
                Admin monitor not connected. Ensure you are logged in and the backend is running.
              </CAlert>
            )}
            <div className="text-center py-3">
              <div style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}>
                {connectedCount ?? '-'}
              </div>
              <div className="text-muted small mt-1">active socket connections</div>
              <div className="mt-2 fw-semibold">{users.length} unique user{users.length !== 1 ? 's' : ''}</div>
            </div>
            {lastUpdated && (
              <div className="text-muted small text-center mt-2">
                Last update: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mt-3">
          <CCardHeader><strong>Recent Updates</strong></CCardHeader>
          <CCardBody>
            {history.length === 0 && <p className="text-muted small mb-0">Waiting for live updates.</p>}
            <div className="d-flex flex-column gap-1">
              {history.map((entry, i) => (
                <div key={i} className="d-flex align-items-center gap-3 small border-bottom py-1">
                  <span className="text-muted" style={{ minWidth: 90 }}>{entry.time.toLocaleTimeString()}</span>
                  <CBadge color="primary">{entry.count} connected</CBadge>
                </div>
              ))}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* ── Connected users table ── */}
      <CCol md={8}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Connected Users</strong>
            <CBadge color="primary">{users.length} unique</CBadge>
          </CCardHeader>
          <CCardBody>
            {users.length === 0 ? (
              <p className="text-muted small mb-0">No users currently connected.</p>
            ) : (
              <CTable hover responsive small>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>User</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Connections</CTableHeaderCell>
                    <CTableHeaderCell>Connected Since</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((u) => (
                    <CTableRow key={u.userId}>
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          {avatar(u)}
                          <div>
                            <div className="small fw-semibold">{u.name || '-'}</div>
                            <div className="small text-muted">{u.email}</div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={ROLE_COLOR[u.role] || 'secondary'}>
                          {u.role?.replace(/_/g, ' ') || '-'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="small text-center">
                        {u.connections > 1
                          ? <CBadge color="info">{u.connections} tabs</CBadge>
                          : <span className="text-muted">1</span>}
                      </CTableDataCell>
                      <CTableDataCell className="small text-muted">
                        {u.connectedAt ? new Date(u.connectedAt).toLocaleTimeString() : '-'}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default LiveUsers
