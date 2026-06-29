import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CBadge, CSpinner, CAlert, CFormSelect,
} from '@coreui/react'
import SortableHeader from '../../components/SortableHeader'
import AdminTableFooter from '../../components/AdminTableFooter'
import api from '../../lib/api'
import { fmtDate, fmtDateTime } from '../../lib/dateUtils'

const STATUS_COLOR = { PENDING: 'secondary', PROCESSING: 'warning', COMPLETED: 'success', FAILED: 'danger' }

const fetchEvents = async ({ limit, offset, status, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/notification-events?${params}`)
  return res.data.data
}

const NotificationLog = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => { setSortBy(field); setSortOrder(order); setPage(1) }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-notification-events', { page, pageSize, status, sortBy, sortOrder }],
    queryFn: () => fetchEvents({ limit: pageSize, offset, status, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Notification Event Log</strong>

      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3 g-2">
          <CCol md={3}>
            <CFormSelect size="sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All statuses</option>
              {['PENDING','PROCESSING','COMPLETED','FAILED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && <div className="text-center py-4"><CSpinner color="primary" /></div>}
        {isError && <CAlert color="danger">Failed to load notification events.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <SortableHeader field="eventType" label="Event Type" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell>Entity</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <SortableHeader field="status" label="Status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="attempts" label="Attempts" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell>Error</CTableHeaderCell>
                  <SortableHeader field="processedAt" label="Processed At" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="createdAt" label="Created At" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.events.map((e, idx) => (
                  <CTableRow key={e.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell className="small fw-semibold">{e.eventType}</CTableDataCell>
                    <CTableDataCell className="small">
                      <span className="text-muted">{e.entityType}</span>
                      <span className="ms-1 text-muted">#{e.entityId?.slice(0, 8)}</span>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="small">{e.user?.name || '—'}</div>
                      <div className="small text-muted">{e.user?.email}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[e.status] || 'secondary'}>{e.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">{e.attempts}</CTableDataCell>
                    <CTableDataCell className="small text-danger" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.lastError || '—'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(e.processedAt)}
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(e.createdAt)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            <AdminTableFooter
              total={data.total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default NotificationLog
