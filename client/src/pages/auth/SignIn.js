//-----------------------------------------------------------------------------
// src/client/pages/auth/SignIn.js
//-----------------------------------------------------------------------------
import React      from 'react'
import { 
  Container, 
  Row,
  Col,
  Button, 
}                 from 'react-bootstrap'

import Form       from '../../components/auth/Form'
import AuthAPI    from '../../api/auth-api'

/**
 * SignIn page for the app.
 */
const PagesAuthSignIn = () => {
  const handleSignIn = async ({email, password}) => {
    console.log(`[debug] Sign in user w/ email=${email}, password=${password}`)

    try {
      let user = await AuthAPI.login(email, password)
      console.log(`[info] Logged in user w/ email=${email} & password=${password}`)

      //////////////////////////////////////////////////////////////////////////////
      // Need to redirect to the /accounts page after the user logs into the app
      //////////////////////////////////////////////////////////////////////////////
    }
    catch(err) {
      console.log(`[error] Failed to login user w/ email=${email}, password=${password}, err=`, err)
      // Need to set the error state so display the error message.
    }

    return
  }

  /**
   * Render the Sign-In form
   */
  return (
    <Container fluid>
      <Row>
        <Col>
          <h1>Dough Sign In</h1>
          <Form onSubmit={handleSignIn} />
        </Col>
      </Row>
    </Container>
  )
}

// Export the sign-in page
export default PagesAuthSignIn