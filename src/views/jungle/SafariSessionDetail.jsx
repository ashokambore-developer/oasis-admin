import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CBadge, CButton, CSpinner, CAlert, CListGroup, CListGroupItem,
} from '@coreui/react'
import api from '../../lib/api'
import { fmtDate, fmtDateTime } from '../../lib/dateUtils'

const STATUS_COLOR = { ACTIVE: 'success', ENDED: 'secondary', ABANDONED: 'warning' }

const SafariSessionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['admin-safari-session', id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/safari-sessions/${id}`)
      return res.data.data
    },
  })

  if (isLoading) return <div className="text-center py-5"><CSpinner color="primary" /></div>
  if (isError) return <CAlert color="danger">Failed to load session.</CAlert>
  if (!session) return null

  return (
    <>
      <CButton color="secondary" size="sm" className="mb-3" onClick={() => navigate(-1)}>
        - Back
      </CButton>

      <CRow className="g-3">
        <CCol md={4}>
          <CCard>
            <CCardHeader><strong>Session Info</strong></CCardHeader>
            <CCardBody className="p-0">
              <CListGroup flush>
                <CListGroupItem className="d-flex justify-content-between">
                  <span className="text-muted small">Status</span>
                  <CBadge color={STATUS_COLOR[session.status] || 'secondary'}>{session.status}</CBadge>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between">
                  <span className="text-muted small">Started By</span>
                  <span className="small">{session.startedByUser?.name}</span>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between">
                  <span className="text-muted small">Destination</span>
                  <span className="small">{session.destination?.name}</span>
                </CListGroupItem>
                {session.trip && (
                  <CListGroupItem className="d-flex justify-content-between">
                    <span className="text-muted small">Trip</span>
                    <span className="small">{session.trip.title}</span>
                  </CListGroupItem>
                )}
                {session.zone && (
                  <CListGroupItem className="d-flex justify-content-between">
                    <span className="text-muted small">Zone</span>
                    <span className="small">{session.zone}</span>
                  </CListGroupItem>
                )}
                <CListGroupItem className="d-flex justify-content-between">
                  <span className="text-muted small">Start</span>
                  <span className="small">{fmtDateTime(session.startTime)}</span>
                </CListGroupItem>
                {session.endTime && (
                  <CListGroupItem className="d-flex justify-content-between">
                    <span className="text-muted small">End</span>
                    <span className="small">{fmtDateTime(session.endTime)}</span>
                  </CListGroupItem>
                )}
                <CListGroupItem className="d-flex justify-content-between">
                  <span className="text-muted small">Participants</span>
                  <span className="small">{session.participants?.length || 0}</span>
                </CListGroupItem>
                {session.notes && (
                  <CListGroupItem>
                    <div className="text-muted small mb-1">Notes</div>
                    <div className="small">{session.notes}</div>
                  </CListGroupItem>
                )}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={8}>
          <CCard>
            <CCardHeader>
              <strong>Sightings</strong>
              <span className="ms-2 text-muted small">({session.sightings?.length || 0})</span>
            </CCardHeader>
            <CCardBody>
              {session.sightings?.length === 0 && (
                <p className="text-muted small mb-0">No sightings recorded.</p>
              )}
              {session.sightings?.length > 0 && (
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Species</CTableHeaderCell>
                      <CTableHeaderCell>Group</CTableHeaderCell>
                      <CTableHeaderCell>Count</CTableHeaderCell>
                      <CTableHeaderCell>Confidence</CTableHeaderCell>
                      <CTableHeaderCell>Verified</CTableHeaderCell>
                      <CTableHeaderCell>Observed At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {session.sightings.map((s) => (
                      <CTableRow key={s.id}>
                        <CTableDataCell className="small fw-semibold">
                          {s.species?.commonName || s.speciesText || '-'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {s.species?.taxonGroup && (
                            <CBadge color="light" textColor="dark">{s.species.taxonGroup}</CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="small">{s.count}</CTableDataCell>
                        <CTableDataCell className="small">{s.confidence}%</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={s.isVerified ? 'success' : 'secondary'}>
                            {s.isVerified ? 'Yes' : 'No'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="small text-muted">
                          {fmtDateTime(s.observedAt)}
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
    </>
  )
}

export default SafariSessionDetail
