import React                from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
}                           from 'react-router-dom'
import { Provider }         from 'react-redux'

import AppBar               from './components/ui/navbar/Navbar'
import PrivateRoute         from './components/routes/Private'
import PagesAuthSignIn      from './pages/auth/SignIn'
import PagesAuthSignUp      from './pages/auth/SignUp'
import PagesAuthSignOut     from './pages/auth/SignOut'
import PagesAccountsIndex   from './pages/accounts/Index'
import PagesAccountsShow    from './pages/accounts/Show'
import Home                 from './pages/home/home-page'
import About                from './pages/about/about-page'

// Setup redux store
import configureStore from './ducks/configureStore'
const  store  = configureStore()

/**
 * Dough App
 */
function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <AppBar />

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            {/* Protected Routes */}
            <PrivateRoute exact path="/accounts/list"      component={PagesAccountsIndex} />
            <PrivateRoute exact path="/accounts/show/:id"  component={PagesAccountsShow} />

            {/* Public Routes */}
            <Route exact path='/home'     component={Home} />
            <Route exact path='/about'    component={About} />
            <Route exact path='/login'    component={PagesAuthSignIn} />
            <Route exact path='/logout'   component={PagesAuthSignOut} />
            <Route exact path='/register' component={PagesAuthSignUp} />
            <Route path="/"               component={Home} />
          </Switch>
        </Router>
      </div>
    </Provider>
  );
}

// Export the app.
export default App;
