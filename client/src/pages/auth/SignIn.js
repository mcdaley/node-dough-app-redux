//-----------------------------------------------------------------------------
// src/client/pages/auth/SignIn.js
//-----------------------------------------------------------------------------
import React, { useState }          from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Alert, 
  Col,
  Container, 
  Row,
}                                   from 'react-bootstrap'
import { useLocation, Redirect }  from 'react-router-dom'

import Form                         from '../../components/auth/Form'
import AuthAPI                      from '../../api/auth-api'
import { actions }                  from '../../ducks/users'

/**
 * SignIn page for the app.
 */
const PagesAuthSignIn = () => {
  const location  = useLocation()

  const dispatch  = useDispatch()
  const user      = useSelector(state => state.user.user)

  /**
   * Callback to sign the user into the app. If the user is authenticated then
   * the user is redirected to their home page.
   * 
   * @param {Object} credentials - User's email and password
   */
  const handleSignIn = ({email, password}) => {
    console.log(`[debug] Sign in user w/ email=${email}, password=${password}`)

    dispatch(actions.login(email, password))
    console.log(`[info] Success, Logged in user w/ email=${email} & password=${password}`);
    
    return
  }

  const renderErrors = () => {
    let isError = false
    let message = ''

    if(location.state && location.state.message) {
      isError = true
      message = location.state.message
    }
    else if(user.error && Object.keys(user.error).length > 0) {
      isError = true
      message = user.error.message
    }

    return isError ? (
        <Alert variant='danger'>
          {message}
        </Alert>
    ) : null
  }

  /**
   * Render the Sign-In form. If the user is authenticated then redirect
   * the user to his home page, otherwise render the login page.
   */
  return AuthAPI.isAuthenticated() ? ( 
    <Redirect to='/accounts/list' />
  ) : (
    <Container fluid>
      <Row>
        <Col>
          <h1>Dough Sign In</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          {renderErrors()}
        </Col>
      </Row>
      <Row>
        <Col>
          <Form onSubmit={handleSignIn} />
        </Col>
      </Row>
    </Container>
  )
}

// Export the sign-in page
export default PagesAuthSignIn