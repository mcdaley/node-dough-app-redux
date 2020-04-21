//-----------------------------------------------------------------------------
// client/src/components/ui/navbar/Navbar.js
//-----------------------------------------------------------------------------
import React      from 'react'
import Navbar     from 'react-bootstrap/Navbar'
import Nav        from 'react-bootstrap/Nav'
import { 
  withRouter, 
  useLocation 
}                 from 'react-router-dom'

/**
 * Component for the top navigation bar for the dough app. 
 */
const AppBar = () => {
  let location = useLocation()
  
  // Render the top navigation bar
  return(
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand     href="/">Dough Money</Navbar.Brand>
      <Navbar.Toggle    aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse  id="responsive-navbar-nav">
        <Nav className="mr-auto" activeKey={location.pathname}>
          <Nav.Link href="/home">
            Home
          </Nav.Link>
          <Nav.Link href="/accounts/list">
            Accounts
          </Nav.Link>
          <Nav.Link href="/about" >
            About
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
const AppBarWithRouter = withRouter(AppBar)

// Export the AppBar
export default AppBarWithRouter