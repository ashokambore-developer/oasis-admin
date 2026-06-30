﻿import React, { useState } from 'react'
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
  CSpinner,
  CAlert,
  CFormSelect,
} from '@coreui/react'
import SortableHeader from '../../components/SortableHeader'
import AdminTableFooter from '../../components/AdminTableFooter'
import api from '../../lib/api'
import { fmtDate, fmtDateTime } from '../../lib/dateUtils'

const STATUS_COLOR = {
  RECEIVED: 'info',
  PROCESSING: 'warning',
  PROCESSED: 'success',
  FAILED: 'danger',
  IGNORED: 'secondary',
}

// comment now

const fetchWebhooks = async ({ limit, offset, status, source, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (source) params.set('source', source)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/webhook-events?${params}`)
  return res.data.data
}

const WebhookLog = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-webhooks', { page, pageSize, status, source, sortBy, sortOrder }],
    queryFn: () => fetchWebhooks({ limit: pageSize, offset, status, source, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Webhook Events</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3 g-2">
          <CCol md={3}>
            <CFormSelect
              size="sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All statuses</option>
              {['RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormSelect
              size="sm"
              value={source}
              onChange={(e) => {
                setSource(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All sources</option>
              {['RAZORPAY', 'EMAIL', 'SMS', 'WHATSAPP'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {isError && <CAlert color="danger">Failed to load webhook events.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <SortableHeader
                    field="source"
                    label="Source"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Event ID</CTableHeaderCell>
                  <SortableHeader
                    field="status"
                    label="Status"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="retryCount"
                    label="Retries"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <CTableHeaderCell>Error</CTableHeaderCell>
                  <SortableHeader
                    field="processedAt"
                    label="Processed At"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="createdAt"
                    label="Received At"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.events.map((e, idx) => (
                  <CTableRow key={e.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="light" textColor="dark">
                        {e.source}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small">{e.type}</CTableDataCell>
                    <CTableDataCell
                      className="small text-muted"
                      style={{
                        maxWidth: 140,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.eventId}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[e.status] || 'secondary'}>{e.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">{e.retryCount}</CTableDataCell>
                    <CTableDataCell
                      className="small text-danger"
                      style={{
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.error || '-'}
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
              onPageSizeChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
            />
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default WebhookLog
