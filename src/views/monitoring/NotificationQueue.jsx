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

const STATUS_COLOR = {
  PENDING: 'secondary', PROCESSING: 'warning', SENT: 'success',
  FAILED: 'danger', CANCELLED: 'light',
}

const fetchQueue = async ({ limit, offset, status, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/notification-queue?${params}`)
  return res.data.data
}

const NotificationQueue = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => { setSortBy(field); setSortOrder(order); setPage(1) }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-notification-queue', { page, pageSize, status, sortBy, sortOrder }],
    queryFn: () => fetchQueue({ limit: pageSize, offset, status, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Notification Queue</strong>
        {data && <span className="ms-2 text-muted small">({data.total} items)</span>}
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3 g-2">
          <CCol md={3}>
            <CFormSelect size="sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All statuses</option>
              {['PENDING','PROCESSING','SENT','FAILED','CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && <div className="text-center py-4"><CSpinner color="primary" /></div>}
        {isError && <CAlert color="danger">Failed to load notification queue.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <CTableHeaderCell>Recipient</CTableHeaderCell>
                  <SortableHeader field="type" label="Type" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <SortableHeader field="status" label="Status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="priority" label="Priority" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell>Retries</CTableHeaderCell>
                  <SortableHeader field="scheduledFor" label="Scheduled For" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="createdAt" label="Created" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.items.map((item, idx) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div className="small fw-semibold">{item.user?.name}</div>
                      <div className="small text-muted">{item.user?.email}</div>
                    </CTableDataCell>
                    <CTableDataCell className="small">{item.type}</CTableDataCell>
                    <CTableDataCell className="small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[item.status] || 'secondary'}>{item.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small">{item.priority}</CTableDataCell>
                    <CTableDataCell className="small text-center">{item.retryCount}/{item.maxRetries}</CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(item.scheduledFor)}
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(item.createdAt)}
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

export default NotificationQueue
