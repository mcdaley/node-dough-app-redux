//-----------------------------------------------------------------------------
// src/client/pages/auth/SignIn.js
//-----------------------------------------------------------------------------
import React, { useState }    from 'react'
import { 
  Alert, 
  Col,
  Container, 
  Row,
}                             from 'react-bootstrap'
import { useHistory }         from 'react-router-dom'

import Form                   from '../../components/auth/Form'
import AuthAPI                from '../../api/auth-api'

/**
 * SignIn page for the app.
 */
const PagesAuthSignIn = () => {
  const [error, setError] = useState(null)
  const history           = useHistory()

  /**
   * Callback to sign the user into the app. If the user is authenticated then
   * the user is redirected to their home page.
   * 
   * @param {Object} credentials - User's email and password
   */
  const handleSignIn = async ({email, password}) => {
    console.log(`[debug] Sign in user w/ email=${email}, password=${password}`)

    try {
      let user = await AuthAPI.login(email, password);
      console.log(`[info] Logged in user w/ email=${email} & password=${password}`);

      history.replace('/accounts/list')
    }
    catch(err) {
      console.log(`[error] Failed to login user w/ email=${email}, password=${password}, err=`, err)
      setError(err)
    }

    return
  }

  const renderErrors = () => {
    return error ? (
      <Alert variant='danger'>{error.message}</Alert>
    ) : null
  }

  /**
   * Render the Sign-In form
   */
  return (
    <Container fluid>
      <Row>
        <Col>
          <h1>Dough Sign In</h1>
          {renderErrors()}
          <Form onSubmit={handleSignIn} />
        </Col>
      </Row>
    </Container>
  )
}

// Export the sign-in page
export default PagesAuthSignIn