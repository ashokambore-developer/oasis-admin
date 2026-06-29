import React from 'react'
import { CPagination, CPaginationItem, CFormSelect } from '@coreui/react'

const LIMIT_OPTIONS = [20, 40, 100, 200]

const AdminTableFooter = ({ total, page, pageSize, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.ceil(total / pageSize) || 1

  let startPage = Math.max(1, page - 2)
  let endPage = Math.min(totalPages, startPage + 4)
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4)
  const pages = []
  for (let p = startPage; p <= endPage; p++) pages.push(p)

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
      <div className="text-muted small">
        {total === 0 ? 'No records' : `Showing ${from}–${to} of ${total} records`}
      </div>

      {totalPages > 1 && (
        <CPagination className="mb-0" size="sm">
          <CPaginationItem disabled={page === 1} onClick={() => onPageChange(1)}>
            {'<<'}
          </CPaginationItem>
          <CPaginationItem disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            {'<'}
          </CPaginationItem>
          {pages.map((p) => (
            <CPaginationItem key={p} active={p === page} onClick={() => onPageChange(p)}>
              {p}
            </CPaginationItem>
          ))}
          <CPaginationItem disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            {'>'}
          </CPaginationItem>
          <CPaginationItem disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>
            {'>>'}
          </CPaginationItem>
        </CPagination>
      )}

      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small text-nowrap">Rows per page:</span>
        <CFormSelect
          size="sm"
          style={{ width: 80 }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </CFormSelect>
      </div>
    </div>
  )
}

export default AdminTableFooter
