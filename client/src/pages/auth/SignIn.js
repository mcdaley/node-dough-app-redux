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
import { useLocation, Redirect }    from 'react-router-dom'

import SignInForm                   from '../../components/auth/SignInForm'
import ErrorAlert                   from '../../components/ui/error/Alert'
import AuthAPI                      from '../../api/auth-api'
import { actions }                  from '../../ducks/users'

/**
 * SignIn page for the app.
 */
const PagesAuthSignIn = () => {
  const location  = useLocation()

  const dispatch  = useDispatch()
  const user      = useSelector(state => state.user.user)

  let   error     = false

  /**
   * Callback to sign the user into the app. If the user is authenticated then
   * the user is redirected to their home page.
   * 
   * @param {Object} credentials - User's email and password
   */
  const handleSignIn = ({email, password}) => {
    console.log(`[debug] Sign in user w/ email=${email}, password=${password}`)

    dispatch(actions.login(email, password))
    console.log(`[info] Success, Logged in user w/ email=${email}`)
    
    return
  }

  /**
   * Check to see if there was an error when the user attempted to login. If 
   * there is an error return true, otherwise return false.
   * @returns {Boolean} True if login error, otherwise false.
   */
  const isError = () => {
    if(location.state && location.state.message) {
      error = { code: 400, message: location.state.message }
      return  true
    }
    else if(user.error && Object.keys(user.error).length > 0) {
      error = { code: 400, message: user.error.message }
      return  true
    }

    return false
  }


  /**
   * Render the Sign-In form. If the user is authenticated after submitting
   * the form then redirect the user to his home page, otherwise render the 
   * login page w/ the error messages.
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
          {isError() && <ErrorAlert error={error} />}
          <SignInForm onSubmit={handleSignIn} />
        </Col>
      </Row>
    </Container>
  )
}

// Export the sign-in page
export default PagesAuthSignIn