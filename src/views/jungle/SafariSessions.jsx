﻿import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import SortableHeader from '../../components/SortableHeader'
import AdminTableFooter from '../../components/AdminTableFooter'
import api from '../../lib/api'
import { fmtDate, fmtDateTime } from '../../lib/dateUtils'

const STATUS_COLOR = { ACTIVE: 'success', ENDED: 'secondary', ABANDONED: 'warning' }

const fetchSessions = async ({ limit, offset, status, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/safari-sessions?${params}`)
  return res.data.data
}

const SafariSessions = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('startTime')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-safari-sessions', { page, pageSize, status, sortBy, sortOrder }],
    queryFn: () => fetchSessions({ limit: pageSize, offset, status, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Safari Sessions</strong>

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
              <option value="ACTIVE">Active</option>
              <option value="ENDED">Ended</option>
              <option value="ABANDONED">Abandoned</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {isLoading && (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {isError && <CAlert color="danger">Failed to load safari sessions.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <CTableHeaderCell>Started By</CTableHeaderCell>
                  <CTableHeaderCell>Destination</CTableHeaderCell>
                  <CTableHeaderCell>Trip</CTableHeaderCell>
                  <CTableHeaderCell>Zone</CTableHeaderCell>
                  <SortableHeader
                    field="status"
                    label="Status"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <CTableHeaderCell>Participants</CTableHeaderCell>
                  <CTableHeaderCell>Sightings</CTableHeaderCell>
                  <SortableHeader
                    field="startTime"
                    label="Start Time"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.sessions.map((s, idx) => (
                  <CTableRow key={s.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div className="small fw-semibold">{s.startedByUser?.name}</div>
                      <div className="small text-muted">{s.startedByUser?.email}</div>
                    </CTableDataCell>
                    <CTableDataCell className="small">{s.destination?.name || '-"'}</CTableDataCell>
                    <CTableDataCell className="small">{s.trip?.title || '-"'}</CTableDataCell>
                    <CTableDataCell className="small">{s.zone || '-"'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[s.status] || 'secondary'}>{s.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">
                      {s.participants?.length || 0}
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">
                      {s._count?.sightings || 0}
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDateTime(s.startTime)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="outline-primary"
                        title="View session"
                        onClick={() => navigate(`/jungle-mode/${s.id}`)}
                      >
                        <CIcon icon={cilSearch} size="sm" />
                      </CButton>
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

export default SafariSessions
