import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CButton,
  CSpinner,
  CAlert,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import api from '../../lib/api'
import { fmtDate } from '../../lib/dateUtils'
import { formatRupees } from '../../lib/constants'
import AdminTableFooter from '../../components/AdminTableFooter'

const MILESTONE_STATUS_COLOR = {
  PENDING: 'secondary',
  RELEASED: 'success',
  CANCELLED: 'warning',
}

const milestoneStatus = (m) => {
  if (m.cancelledAt) return 'CANCELLED'
  if (m.payoutId) return 'RELEASED'
  return 'PENDING'
}

const ROLES = ['TRIP_MANAGER', 'SERVICE_PROVIDER', 'PHOTOGRAPHER']

const fetchSchedule = async ({ limit, offset, search, recipientRole, milestoneStatus }) => {
  const params = new URLSearchParams({ limit, offset })
  if (search) params.set('search', search)
  if (recipientRole) params.set('recipientRole', recipientRole)
  if (milestoneStatus) params.set('milestoneStatus', milestoneStatus)
  const res = await api.get(`/api/admin/payout-schedule?${params}`)
  return res.data.data
}

const PayoutSchedule = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [recipientRole, setRecipientRole] = useState('')
  const [msFilter, setMsFilter] = useState('')

  const offset = (page - 1) * pageSize

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-payout-schedule', { page, pageSize, search, recipientRole, msFilter }],
    queryFn: () => fetchSchedule({ limit: pageSize, offset, search, recipientRole, milestoneStatus: msFilter }),
    placeholderData: (prev) => prev,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Payout Schedule</strong>
        {data && <span className="ms-2 text-muted small">({data.total} schedules)</span>}
      </CCardHeader>
      <CCardBody>
        {/* Filters */}
        <CRow className="mb-3 g-2 align-items-end">
          <CCol md={5}>
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <CFormInput
                size="sm"
                placeholder="Search trip title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <CButton type="submit" color="primary" size="sm">Search</CButton>
              {search && (
                <CButton size="sm" color="secondary" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>
                  Clear
                </CButton>
              )}
            </form>
          </CCol>
          <CCol md={3}>
            <CFormSelect
              size="sm"
              value={recipientRole}
              onChange={(e) => { setRecipientRole(e.target.value); setPage(1) }}
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormSelect
              size="sm"
              value={msFilter}
              onChange={(e) => { setMsFilter(e.target.value); setPage(1) }}
            >
              <option value="">All milestone statuses</option>
              <option value="PENDING">Has Pending</option>
              <option value="RELEASED">Has Released</option>
              <option value="CANCELLED">Has Cancelled</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && (
          <div className="text-center py-4"><CSpinner color="primary" /></div>
        )}
        {isError && <CAlert color="danger">Failed to load payout schedules.</CAlert>}
        {data && data.schedules.length === 0 && (
          <p className="text-muted small">No payout schedules found.</p>
        )}

        {data && data.schedules.map((schedule) => (
          <CCard key={schedule.id} className="mb-3 border">
            <CCardHeader className="d-flex justify-content-between align-items-center py-2">
              <div>
                <span
                  className="small fw-semibold text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/trips/${schedule.tripId}`)}
                >
                  {schedule.trip ? schedule.trip.title : schedule.tripId.slice(0, 8)}
                </span>
                <CBadge color="light" textColor="dark" className="ms-2 small">
                  {schedule.recipientRole.replace(/_/g, ' ')}
                </CBadge>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="small text-muted fw-semibold">
                  Total: {formatRupees(schedule.totalAmountMinor)}
                </span>
                <span className="small text-muted">ID: {schedule.id.slice(0, 8)}</span>
              </div>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable small responsive className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style={{ width: 48 }}>#</CTableHeaderCell>
                    <CTableHeaderCell>Milestone</CTableHeaderCell>
                    <CTableHeaderCell>Trigger</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Scheduled</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {schedule.milestones.map((m, idx) => {
                    const status = milestoneStatus(m)
                    return (
                      <CTableRow key={m.id}>
                        <CTableDataCell className="small text-muted">{idx + 1}</CTableDataCell>
                        <CTableDataCell className="small">
                          Milestone {m.position + 1}
                          <span className="text-muted ms-1">({Math.round(m.sharePct * 100)}%)</span>
                        </CTableDataCell>
                        <CTableDataCell className="small text-muted">
                          {m.triggerKind || '-'}
                        </CTableDataCell>
                        <CTableDataCell className="small fw-semibold">
                          {formatRupees(m.amountMinor)}
                        </CTableDataCell>
                        <CTableDataCell className="small text-muted">
                          {fmtDate(m.scheduledAt)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={MILESTONE_STATUS_COLOR[status] || 'secondary'}>
                            {status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {m.payoutId ? (
                            <CButton
                              size="sm"
                              color="outline-primary"
                              onClick={() => navigate(`/payouts/${m.payoutId}`)}
                            >
                              View Payout
                            </CButton>
                          ) : (
                            <span className="small text-muted">-</span>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        ))}

        {data && (
          <AdminTableFooter
            total={data.total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
          />
        )}
      </CCardBody>
    </CCard>
  )
}

export default PayoutSchedule
