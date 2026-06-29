import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const Placeholder = ({ title }) => (
  <CCard>
    <CCardHeader><strong>{title}</strong></CCardHeader>
    <CCardBody>Coming soon.</CCardBody>
  </CCard>
)

export default Placeholder
