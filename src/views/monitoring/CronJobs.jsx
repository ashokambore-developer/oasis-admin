import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CSpinner,
  CAlert,
} from '@coreui/react'
import api from '../../lib/api'

const fetchCronJobs = async () => {
  const res = await api.get('/api/admin/cron-jobs')
  return res.data.data
}

const CronJobs = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-cron-jobs'],
    queryFn: fetchCronJobs,
  })

  return (
    <CCard>
      <CCardHeader>
        <strong>Cron Jobs</strong>
        <div className="small text-muted mt-1">
          Static list of scheduled background jobs. Run history is not tracked yet — this
          shows what's currently scheduled, not whether a given run succeeded.
        </div>
      </CCardHeader>
      <CCardBody>
        {isLoading && (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {isError && <CAlert color="danger">Failed to load cron jobs.</CAlert>}

        {data && (
          <>
            <div className="small text-muted mb-2">{data.total} job(s) registered</div>
            <CTable hover responsive small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 48 }}>Sr No</CTableHeaderCell>
                  <CTableHeaderCell>Job Name</CTableHeaderCell>
                  <CTableHeaderCell>Schedule</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Source File</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {data.jobs.map((job, idx) => (
                  <CTableRow key={job.name}>
                    <CTableDataCell className="small text-muted">{idx + 1}</CTableDataCell>
                    <CTableDataCell className="small fw-semibold">{job.name}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="light" textColor="dark" className="border font-monospace">
                        {job.schedule}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-muted">{job.description}</CTableDataCell>
                    <CTableDataCell
                      className="small text-muted font-monospace"
                      style={{ fontSize: 11 }}
                    >
                      {job.sourceFile}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default CronJobs
