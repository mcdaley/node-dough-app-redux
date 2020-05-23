//-----------------------------------------------------------------------------
// client/src/components/ui/error/Alert.js
//-----------------------------------------------------------------------------
import React        from 'react'
import { Alert }    from 'react-bootstrap'

/**
 * Displays an error message on the page.
 * @props {String} message - error message
 */
const ErrorAlert = (props) => (
  <Alert variant='danger'>
    {props.message}
  </Alert>
)

// Export the ErrorAlert component
export default ErrorAlert
