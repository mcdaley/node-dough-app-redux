//-----------------------------------------------------------------------------
// src/client/pages/auth/SignOut.js
//-----------------------------------------------------------------------------
import React, { useEffect }   from 'react'
import { 
  Container, 
  Row,
  Col,
}                             from 'react-bootstrap'

import AuthAPI                from '../../api/auth-api'

/**
 * Log the user out.
 */
const PagesAuthSignOut = () => {
  useEffect( () => {
    AuthAPI.logout()
  }, [])

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1>Dough Signed Out</h1>
        </Col>
      </Row>
    </Container>
  )
}

// Export sign out page
export default PagesAuthSignOut