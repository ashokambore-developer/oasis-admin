import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CAlert } from '@coreui/react'
import { CChartDoughnut, CChartBar, CChartPie } from '@coreui/react-chartjs'
import api from '../../lib/api'

const fetchStats = async () => {
  const res = await api.get('/api/admin/stats')
  return res.data.data
}

const fmt = (paise) => {
  const r = Number(paise || 0) / 100
  if (r >= 1_00_00_000) return `₹${(r / 1_00_00_000).toFixed(1)}Cr`
  if (r >= 1_00_000) return `₹${(r / 1_00_000).toFixed(1)}L`
  if (r >= 1000) return `₹${(r / 1000).toFixed(1)}K`
  return `₹${r.toFixed(0)}`
}

const Analytics = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  })

  if (isLoading) return <div className="text-center py-5"><CSpinner color="primary" /></div>
  if (isError) return <CAlert color="danger">Failed to load analytics.</CAlert>
  if (!stats) return null

  const { users, trips, finance, queue } = stats

  const others = users.total - users.photographers - users.serviceProviders - users.tripManagers
  const userDistData = {
    labels: ['Photographers', 'Service Providers', 'Trip Managers', 'Others'],
    datasets: [{
      data: [users.photographers, users.serviceProviders, users.tripManagers, Math.max(0, others)],
      backgroundColor: ['#321fdb', '#2eb85c', '#e55353', '#768192'],
      hoverOffset: 4,
    }],
  }

  const financialData = {
    labels: ['This Month Revenue', 'All-Time Revenue'],
    datasets: [{
      label: 'Revenue (₹)',
      backgroundColor: ['#2eb85c', '#321fdb'],
      data: [
        Number(finance.revenueTotal || 0) / 100,
        Number(finance.revenueAllTime || 0) / 100,
      ],
    }],
  }

  const queueData = {
    labels: ['SP Verifications', 'Destination Requests', 'Open Cases'],
    datasets: [{
      data: [queue.pendingSpVerifications, queue.pendingDestRequests, queue.openCases],
      backgroundColor: ['#f9b115', '#3399ff', '#e55353'],
    }],
  }

  const inactive = Math.max(0, trips.total - trips.active)
  const tripData = {
    labels: ['Active Trips', 'Inactive / Ended'],
    datasets: [{
      data: [trips.active, inactive],
      backgroundColor: ['#2eb85c', '#c8ced3'],
    }],
  }

  return (
    <>
      <CRow className="g-3 mb-3">
        <CCol md={6}>
          <CCard>
            <CCardHeader><strong>User Distribution</strong></CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={userDistData}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader><strong>Trip Status</strong></CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={tripData}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-3 mb-3">
        <CCol md={8}>
          <CCard>
            <CCardHeader>
              <strong>Revenue Overview</strong>
              <span className="ms-2 text-muted small">
                (Month: {fmt(finance.revenueTotal)} / Total: {fmt(finance.revenueAllTime)})
              </span>
            </CCardHeader>
            <CCardBody>
              <CChartBar
                data={financialData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { y: { ticks: { callback: (v) => `₹${Number(v).toLocaleString('en-IN')}` } } },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard>
            <CCardHeader><strong>Action Queue</strong></CCardHeader>
            <CCardBody>
              <CChartPie
                data={queueData}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-3">
        <CCol md={4}>
          <CCard>
            <CCardHeader><strong>Payouts</strong></CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={{
                  labels: ['Pending', 'On Hold'],
                  datasets: [{
                    data: [finance.pendingPayouts, finance.onHoldPayouts],
                    backgroundColor: ['#f9b115', '#e55353'],
                  }],
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={8}>
          <CCard>
            <CCardHeader><strong>Account Health</strong></CCardHeader>
            <CCardBody>
              <CChartBar
                data={{
                  labels: ['Total Users', 'Photographers', 'Service Providers', 'Trip Managers', 'Suspended'],
                  datasets: [{
                    label: 'Count',
                    backgroundColor: ['#321fdb','#2eb85c','#f9b115','#3399ff','#e55353'],
                    data: [
                      users.total,
                      users.photographers,
                      users.serviceProviders,
                      users.tripManagers,
                      users.suspended,
                    ],
                  }],
                }}
                options={{ plugins: { legend: { display: false } }, indexAxis: 'y' }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Analytics
