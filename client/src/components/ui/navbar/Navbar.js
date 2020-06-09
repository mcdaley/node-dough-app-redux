//-----------------------------------------------------------------------------
// client/src/components/ui/navbar/Navbar.js
//-----------------------------------------------------------------------------
import React            from 'react'
import { useSelector }  from 'react-redux'
import Navbar           from 'react-bootstrap/Navbar'
import Nav              from 'react-bootstrap/Nav'
import NavDropdown      from 'react-bootstrap/NavDropdown'
import { 
  useLocation,
  NavLink,
}                       from 'react-router-dom'

import AuthAPI          from '../../../api/auth-api'

/**
 * Component for the top navigation bar for the dough app. 
 */
const AppBar = () => {
  let   location  = useLocation()
  const user      = useSelector(state => state.user.user)

  /**
   * Render navigation links for unauthenticated users.
   */
  const renderUnauthenticatedLinks = () => (
    <Nav className="mr-auto" activeKey={location.pathname}>
      <NavLink to="/home"  className='nav-link' data-rb-event-key="/home">
        Home
      </NavLink>
      <NavLink to="/about" className='nav-link' data-rb-event-key="/about">
        About
      </NavLink>
    </Nav>
  )

  /**
   * Render navigation links for authenticated users
   */
  const renderAuthenticatedLinks = () => (
    <Nav className="mr-auto" activeKey={location.pathname}>
      <NavLink to="/dashboard"  className='nav-link' data-rb-event-key="/dashboard">
        Dashboard
      </NavLink>
      <NavLink to="/accounts/list" className='nav-link' data-rb-event-key="/accounts/list">
        Accounts
      </NavLink>
      <NavLink to="/reports" className='nav-link' data-rb-event-key="/reports">
        Reports
      </NavLink>
    </Nav>
  )

  /**
   * Render the links for Sign In and Sign Up if the user is not authenticated.
   * If the user is authenticated then render the Sign Out link.
   */
  const renderAuthenticationLinks = () => {
    return AuthAPI.isAuthenticated() ? signOutLinks() : signInLinks()
  }

  const signInLinks = () => (
    <Nav>
      <NavLink to="/login" className='nav-link' data-rb-event-key='/login'>
        Sign In
      </NavLink>
      <NavLink to="/register" className='nav-link' data-rb-event-key='/register'>
        Sign Up
      </NavLink>
    </Nav>
  )

  const signOutLinks = () => (
    <Nav>
      <NavDropdown title={user.username} id="basic-nav-dropdown" alignRight>
        <NavDropdown.Item  className='dropdown-menu-left' href='/logout'>Sign Out</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  )
  
  /** 
   * Render the App navigation bar
   */
  return(
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <NavLink to="/" className="navbar-brand">Dough Money Redux</NavLink>
      <Navbar.Toggle    aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse  id="responsive-navbar-nav">
        <Nav className="mr-auto" activeKey={location.pathname}>
          {AuthAPI.isAuthenticated() ? renderAuthenticatedLinks() : renderUnauthenticatedLinks() }
        </Nav>
        <Nav className='justify-content-end'>
          {renderAuthenticationLinks()}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

// Export the AppBar
export default AppBar