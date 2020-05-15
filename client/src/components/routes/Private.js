//-----------------------------------------------------------------------------
// client/src/components/routes/Private.js
//-----------------------------------------------------------------------------
import React                from 'react'
import { Redirect, Route }  from 'react-router-dom'

import AuthAPI              from '../../api/auth-api'

/**
 * 
 * @param {*} param0 
 */
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render = { props => 
      AuthAPI.isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/about',
            state:    {from: props.location}
          }}
        />
      )
    }
  />
)

// Export the PrivateRoute
export default PrivateRoute
