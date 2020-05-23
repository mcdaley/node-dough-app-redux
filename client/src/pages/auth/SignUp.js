//-----------------------------------------------------------------------------
// client/src/pages/auth/SignUp.js
//-----------------------------------------------------------------------------
import React, { useState }          from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Col,
  Container, 
  Row,
}                                   from 'react-bootstrap'
import { useLocation, Redirect }    from 'react-router-dom'

import SignUpForm                   from '../../components/auth/SignUpForm'
import ErrorAlert                   from '../../components/ui/error/Alert'
import { actions }                  from '../../ducks/users'

const PagesAuthSignUp = () => {
  const dispatch  = useDispatch()
  const user      = useSelector(state => state.user.user)

  /**
   * Sign up the user for a new account.
   * @param {*} param0 
   */
  const handleSubmit = async ({email, password, confirmPassword}) => {
    dispatch(actions.register(email, password))
    console.log(`[info] Success, Registered user w/ email=${email}`)
  }

  /**
   * Test to see if the user successfully registered. Consider a user signed up
   * if the user stored in redux has in '_id'. If the user is registered then
   * return true, otherwise return false.
   * 
   * @returns {Boolean} Return true if the object is empty, otherwise false.
   */
  const isRegistered = () => {
    return user.hasOwnProperty('_id')
  }

  /**
   * Test to see if there was an error when registering the user.
   * @returns Returns true if there was an error, otherwise false.
   */
  const isError = () => {
    return user.error ? true : false
  }

  /**
   * Render the sign-up page.
   */
  return isRegistered() ? ( 
    <Redirect to='/login' />
  ) : (
    <Container fluid>
      <Row>
        <Col>
          <h1>Dough Money - Sign Up</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          {isError() &&  <ErrorAlert message={user.error.message} />}
        </Col>
      </Row>
      <Row>
        <Col>
          <SignUpForm onSubmit={handleSubmit} />
        </Col>
      </Row>
    </Container>
  )
}

// Export Sign Up page
export default PagesAuthSignUp