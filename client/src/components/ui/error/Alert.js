//-----------------------------------------------------------------------------
// client/src/components/ui/error/Alert.js
//-----------------------------------------------------------------------------
import React            from 'react'
import { Alert }        from 'react-bootstrap'
import { useHistory }   from 'react-router-dom'

/**
 * If the user is not authorized then redirect the user to the /login page. If
 * there is an error than return a component that displays the error.
 * 
 * @props {Object} error - Error object w/ code and message.
 */
const ErrorAlert = ({error}) => {
  let history = useHistory()

  if(error.code === 401) {
    history.push('/login', {message: 'Please log in'})
  }

  return (
    <Alert variant='danger'>
      {error.message}
    </Alert>
  )
}

// Export the ErrorAlert component
export default ErrorAlert
