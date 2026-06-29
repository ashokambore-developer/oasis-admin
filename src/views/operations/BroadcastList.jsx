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
  OPEN: 'danger',
  CLAIMED: 'warning',
  COMPLETED: 'success',
  INCOMPLETE: 'secondary',
}
const PRIORITY_COLOR = { URGENT: 'danger', NORMAL: 'secondary' }

const fetchBroadcasts = async ({ limit, offset, status, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/broadcasts?${params}`)
  return res.data.data
}

const BroadcastList = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-broadcasts', { page, pageSize, status, sortBy, sortOrder }],
    queryFn: () => fetchBroadcasts({ limit: pageSize, offset, status, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Broadcasts</strong>

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
              <option value="OPEN">Open</option>
              <option value="CLAIMED">Claimed</option>
              <option value="COMPLETED">Completed</option>
              <option value="INCOMPLETE">Incomplete</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {isError && <CAlert color="danger">Failed to load broadcasts.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Destination</CTableHeaderCell>
                  <CTableHeaderCell>Trip</CTableHeaderCell>
                  <SortableHeader
                    field="priority"
                    label="Priority"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="broadcastStatus"
                    label="Status"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <CTableHeaderCell>Target</CTableHeaderCell>
                  <CTableHeaderCell>Created By</CTableHeaderCell>
                  <CTableHeaderCell>Accepted By</CTableHeaderCell>
                  <SortableHeader
                    field="expiresAt"
                    label="Expires"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.broadcasts.map((b, idx) => (
                  <CTableRow key={b.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div className="small fw-semibold">{b.title}</div>
                      <div
                        className="small text-muted"
                        style={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {b.message}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="small">{b.destination?.name}</CTableDataCell>
                    <CTableDataCell className="small">{b.trip?.title}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={PRIORITY_COLOR[b.priority] || 'secondary'}>
                        {b.priority}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[b.broadcastStatus] || 'secondary'}>
                        {b.broadcastStatus}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      {b.targetRole || 'ALL'}
                      {b.targetService && <span className="text-muted"> / {b.targetService}</span>}
                    </CTableDataCell>
                    <CTableDataCell className="small">{b.creator?.name}</CTableDataCell>
                    <CTableDataCell className="small">{b.acceptedBy?.name || '-'}</CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(b.expiresAt)}
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

export default BroadcastList
