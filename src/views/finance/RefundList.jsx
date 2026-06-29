import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CCard, CCardBody, CCardHeader,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CBadge, CButton, CSpinner, CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoomIn } from '@coreui/icons'
import SortableHeader from '../../components/SortableHeader'
import AdminTableFooter from '../../components/AdminTableFooter'
import api from '../../lib/api'
import { fmtDate, fmtDateTime } from '../../lib/dateUtils'
import { formatRupees as fmt } from '../../lib/constants'

const STATUS_COLOR = {
  REQUESTED: 'warning', PROCESSING: 'info', ISSUED: 'success',
  FAILED: 'danger', CANCELLED: 'secondary',
}

const fetchRefunds = async ({ limit, offset, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ limit, offset })
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)
  const res = await api.get(`/api/admin/refunds?${params}`)
  return res.data.data
}

const RefundList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const offset = (page - 1) * pageSize

  const handleSort = (field, order) => { setSortBy(field); setSortOrder(order); setPage(1) }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-refunds', { page, pageSize, sortBy, sortOrder }],
    queryFn: () => fetchRefunds({ limit: pageSize, offset, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Refunds</strong>

      </CCardHeader>
      <CCardBody>
        {isLoading && <div className="text-center py-4"><CSpinner color="primary" /></div>}
        {isError && <CAlert color="danger">Failed to load refunds.</CAlert>}

        {data && (
          <>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Trip</CTableHeaderCell>
                  <SortableHeader field="amountMinor" label="Amount" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="reason" label="Reason" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell>Initiator</CTableHeaderCell>
                  <SortableHeader field="status" label="Status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader field="createdAt" label="Date" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.refunds.map((r, idx) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell className="small text-muted">{offset + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div className="small fw-semibold">{r.payment?.fromUser?.name}</div>
                      <div className="small text-muted">{r.payment?.fromUser?.email}</div>
                    </CTableDataCell>
                    <CTableDataCell className="small">{r.payment?.trip?.title}</CTableDataCell>
                    <CTableDataCell className="small fw-semibold">{fmt(r.amountMinor)}</CTableDataCell>
                    <CTableDataCell className="small">{r.reason?.replace(/_/g, ' ')}</CTableDataCell>
                    <CTableDataCell className="small">{r.initiatedBy}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[r.status] || 'secondary'}>{r.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">
                      {fmtDate(r.createdAt)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="outline-primary" onClick={() => navigate(`/payments/refunds/${r.id}`)}>
                        <CIcon icon={cilZoomIn} size="sm" />
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
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RefundList
