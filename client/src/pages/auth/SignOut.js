//-----------------------------------------------------------------------------
// src/client/pages/auth/SignOut.js
//-----------------------------------------------------------------------------
import React, { useEffect }   from 'react'
import { useDispatch }        from 'react-redux'
import { 
  Container, 
  Row,
  Col,
}                             from 'react-bootstrap'

import { actions }            from '../../ducks/users'

/**
 * Log the user out.
 */
const PagesAuthSignOut = () => {
  const dispatch  = useDispatch()

  useEffect( () => {
    dispatch(actions.logout())
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