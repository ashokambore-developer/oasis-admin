﻿import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import api from '../../lib/api'

const fetchDestination = async (id) => {
  const res = await api.get(`/api/destinations/${id}`)
  return res.data.data || res.data
}

const DestinationEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isNew = !id || id === 'new'
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState(null)
  const [hotspotModal, setHotspotModal] = useState(false)
  const [hotspotForm, setHotspotForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: '',
  })
  const [editingHotspot, setEditingHotspot] = useState(null)
  const [error, setError] = useState(null)

  const { data: destination, isLoading } = useQuery({
    queryKey: ['admin-destination', id],
    queryFn: () => fetchDestination(id),
    enabled: !isNew,
    onSuccess: (d) => {
      if (!form)
        setForm({
          name: d.name || '',
          country: d.country || '',
          region: d.region || '',
          description: d.description || '',
          photographyFriendly: d.photographyFriendly || 'Medium',
          isPopular: d.isPopular || false,
          tags: (d.tags || []).join(', '),
          bestTimeToVisit: (d.bestTimeToVisit || []).join(', '),
          latitude: d.latitude || '',
          longitude: d.longitude || '',
        })
    },
  })

  const saveMut = useMutation({
    mutationFn: async (data) => {
      if (isNew) {
        return api.post('/api/admin/destinations', data)
      }
      return api.patch(`/api/admin/destinations/${id}`, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-destinations'] })
      navigate('/destinations')
    },
    onError: (err) => setError(err.response?.data?.message || 'Save failed'),
  })

  const hotspotMut = useMutation({
    mutationFn: async (data) => {
      if (editingHotspot) {
        return api.patch(`/api/admin/hotspots/${editingHotspot.id}`, data)
      }
      return api.post(`/api/admin/destinations/${id}/hotspots`, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-destination', id] })
      setHotspotModal(false)
      setEditingHotspot(null)
    },
    onError: (err) => setError(err.response?.data?.message || 'Hotspot save failed'),
  })

  const deleteHotspotMut = useMutation({
    mutationFn: (hotspotId) => api.delete(`/api/admin/hotspots/${hotspotId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-destination', id] }),
  })

  const field = (key) => ({
    value: form?.[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  const handleSave = () => {
    if (!form) return
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      bestTimeToVisit: form.bestTimeToVisit
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
    }
    saveMut.mutate(payload)
  }

  const openNewHotspot = () => {
    setEditingHotspot(null)
    setHotspotForm({ name: '', latitude: '', longitude: '', description: '' })
    setHotspotModal(true)
  }

  const openEditHotspot = (h) => {
    setEditingHotspot(h)
    setHotspotForm({
      name: h.name,
      latitude: h.latitude,
      longitude: h.longitude,
      description: h.description || '',
    })
    setHotspotModal(true)
  }

  const handleHotspotSave = () => {
    hotspotMut.mutate({
      name: hotspotForm.name,
      latitude: parseFloat(hotspotForm.latitude),
      longitude: parseFloat(hotspotForm.longitude),
      description: hotspotForm.description || undefined,
    })
  }

  if (!isNew && isLoading)
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )

  if (!isNew && !form && destination) {
    setForm({
      name: destination.name || '',
      country: destination.country || '',
      region: destination.region || '',
      description: destination.description || '',
      photographyFriendly: destination.photographyFriendly || 'Medium',
      isPopular: destination.isPopular || false,
      tags: (destination.tags || []).join(', '),
      bestTimeToVisit: (destination.bestTimeToVisit || []).join(', '),
      latitude: destination.latitude || '',
      longitude: destination.longitude || '',
    })
  }

  if (!form && isNew) {
    setForm({
      name: '',
      country: '',
      region: '',
      description: '',
      photographyFriendly: 'Medium',
      isPopular: false,
      tags: '',
      bestTimeToVisit: '',
      latitude: '',
      longitude: '',
    })
  }

  const hotspots = destination?.hotspots || []

  return (
    <>
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      <CCard className="mb-3">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>{isNew ? 'New Destination' : `Edit: ${destination?.name}`}</strong>
          <div className="d-flex gap-2">
            <CButton color="secondary" size="sm" onClick={() => navigate('/destinations')}>
              Cancel
            </CButton>
            <CButton color="primary" size="sm" onClick={handleSave} disabled={saveMut.isLoading}>
              {saveMut.isLoading ? <CSpinner size="sm" className="me-1" /> : null}
              Save
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CNav variant="tabs" className="mb-3">
            {['basic', 'hotspots'].map((tab) => (
              <CNavItem key={tab}>
                <CNavLink
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ cursor: 'pointer' }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>

          <CTabContent>
            <CTabPane visible={activeTab === 'basic'}>
              {form && (
                <CRow className="g-3">
                  <CCol md={6}>
                    <label className="form-label small fw-semibold">Name *</label>
                    <CFormInput size="sm" {...field('name')} />
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold">Country *</label>
                    <CFormInput size="sm" {...field('country')} />
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold">Region</label>
                    <CFormInput size="sm" {...field('region')} />
                  </CCol>
                  <CCol md={12}>
                    <label className="form-label small fw-semibold">Description *</label>
                    <CFormTextarea rows={3} {...field('description')} />
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold">Latitude</label>
                    <CFormInput size="sm" type="number" step="any" {...field('latitude')} />
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold">Longitude</label>
                    <CFormInput size="sm" type="number" step="any" {...field('longitude')} />
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold">Photography Friendly</label>
                    <CFormSelect size="sm" {...field('photographyFriendly')}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <label className="form-label small fw-semibold d-block">Popular</label>
                    <CFormCheck
                      label="Mark as popular"
                      checked={form?.isPopular || false}
                      onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label small fw-semibold">Tags (comma-separated)</label>
                    <CFormInput
                      size="sm"
                      placeholder="Wildlife, Forest, Lake."
                      {...field('tags')}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label small fw-semibold">
                      Best Time To Visit (comma-separated months)
                    </label>
                    <CFormInput
                      size="sm"
                      placeholder="Oct, Nov, Dec."
                      {...field('bestTimeToVisit')}
                    />
                  </CCol>
                </CRow>
              )}
            </CTabPane>

            <CTabPane visible={activeTab === 'hotspots'}>
              {isNew ? (
                <p className="text-muted small">Save the destination first to manage hotspots.</p>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong className="small">Hotspots ({hotspots.length})</strong>
                    <CButton size="sm" color="primary" onClick={openNewHotspot}>
                      + Add Hotspot
                    </CButton>
                  </div>
                  {hotspots.length === 0 ? (
                    <p className="text-muted small">No hotspots added yet.</p>
                  ) : (
                    <CTable small hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Name</CTableHeaderCell>
                          <CTableHeaderCell>Lat / Lng</CTableHeaderCell>
                          <CTableHeaderCell>Description</CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {hotspots.map((h) => (
                          <CTableRow key={h.id}>
                            <CTableDataCell className="small fw-semibold">{h.name}</CTableDataCell>
                            <CTableDataCell className="small text-muted">
                              {h.latitude}, {h.longitude}
                            </CTableDataCell>
                            <CTableDataCell className="small">
                              {h.description || '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="d-flex gap-1">
                                <CButton
                                  size="sm"
                                  color="outline-primary"
                                  onClick={() => openEditHotspot(h)}
                                >
                                  Edit
                                </CButton>
                                <CButton
                                  size="sm"
                                  color="outline-danger"
                                  onClick={() => {
                                    if (window.confirm('Delete hotspot?'))
                                      deleteHotspotMut.mutate(h.id)
                                  }}
                                >
                                  Delete
                                </CButton>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </>
              )}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      {/* Hotspot Modal */}
      <CModal visible={hotspotModal} onClose={() => setHotspotModal(false)}>
        <CModalHeader>
          <CModalTitle>{editingHotspot ? 'Edit Hotspot' : 'Add Hotspot'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Name *</label>
            <CFormInput
              size="sm"
              value={hotspotForm.name}
              onChange={(e) => setHotspotForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <CRow className="mb-3">
            <CCol>
              <label className="form-label small fw-semibold">Latitude *</label>
              <CFormInput
                size="sm"
                type="number"
                step="any"
                value={hotspotForm.latitude}
                onChange={(e) => setHotspotForm((f) => ({ ...f, latitude: e.target.value }))}
              />
            </CCol>
            <CCol>
              <label className="form-label small fw-semibold">Longitude *</label>
              <CFormInput
                size="sm"
                type="number"
                step="any"
                value={hotspotForm.longitude}
                onChange={(e) => setHotspotForm((f) => ({ ...f, longitude: e.target.value }))}
              />
            </CCol>
          </CRow>
          <div>
            <label className="form-label small fw-semibold">Description</label>
            <CFormTextarea
              rows={2}
              value={hotspotForm.description}
              onChange={(e) => setHotspotForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setHotspotModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleHotspotSave} disabled={hotspotMut.isLoading}>
            {hotspotMut.isLoading ? <CSpinner size="sm" className="me-1" /> : null}
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default DestinationEdit
