import React from 'react'
import { CTableHeaderCell } from '@coreui/react'

const SortIcon = ({ active, order }) => {
  const isDesc = !active || order === 'desc'
  const lines = isDesc
    ? [[6, 1.5, 13.5, 1.5], [6, 4.5, 11.5, 4.5], [6, 7.5, 9.5, 7.5], [6, 10.5, 7.5, 10.5]]
    : [[6, 1.5, 7.5, 1.5], [6, 4.5, 9.5, 4.5], [6, 7.5, 11.5, 7.5], [6, 10.5, 13.5, 10.5]]

  return (
    <svg viewBox="0 0 14 12" width="12" height="12" style={{ verticalAlign: 'middle', flexShrink: 0 }}>
      <line x1="2" y1="0.5" x2="2" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {active ? (
        order === 'desc' ? (
          <polyline points="0.5,8.5 2,11.5 3.5,8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <polyline points="0.5,3.5 2,0.5 3.5,3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )
      ) : (
        <>
          <polyline points="0.5,3.5 2,0.5 3.5,3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0.5,8.5 2,11.5 3.5,8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  )
}

const SortableHeader = ({ field, label, sortBy, sortOrder, onSort, style }) => {
  const active = sortBy === field
  const nextOrder = active && sortOrder === 'asc' ? 'desc' : 'asc'

  return (
    <CTableHeaderCell
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style }}
      onClick={() => onSort(field, nextOrder)}
    >
      <span className="d-inline-flex align-items-center gap-1">
        {label}
        <span className={active ? 'text-primary' : 'text-body-tertiary'} style={{ opacity: active ? 1 : 0.5 }}>
          <SortIcon active={active} order={sortOrder} />
        </span>
      </span>
    </CTableHeaderCell>
  )
}

export default SortableHeader
