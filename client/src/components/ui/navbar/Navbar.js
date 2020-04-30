//-----------------------------------------------------------------------------
// client/src/components/ui/navbar/Navbar.js
//-----------------------------------------------------------------------------
import React      from 'react'
import Navbar     from 'react-bootstrap/Navbar'
import Nav        from 'react-bootstrap/Nav'
import { 
  useLocation,
  NavLink,
}                 from 'react-router-dom'

/**
 * Component for the top navigation bar for the dough app. 
 */
const AppBar = () => {
  let location = useLocation()
  
  // Render the top navigation bar
  return(
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <NavLink to="/" className="navbar-brand">Dough Money Redux</NavLink>
      <Navbar.Toggle    aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse  id="responsive-navbar-nav">
        <Nav className="mr-auto" activeKey={location.pathname}>
          <NavLink to="/home"  className='nav-link' data-rb-event-key="/home">
            Home
          </NavLink>
          <NavLink to="/accounts/list" className='nav-link' data-rb-event-key="/accounts/list">
            Accounts
          </NavLink>
          <NavLink to="/about" className='nav-link' data-rb-event-key="/about">
            About
          </NavLink>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

// Export the AppBar
export default AppBar