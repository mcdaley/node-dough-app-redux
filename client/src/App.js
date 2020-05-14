import React                from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
}                           from 'react-router-dom'
import { Provider }         from 'react-redux'

import AppBar               from './components/ui/navbar/Navbar'
import Home                 from './pages/home/home-page'
import SignIn               from './pages/auth/SignIn'
import PagesAccountsIndex   from './pages/accounts/Index'
import PagesAccountsShow    from './pages/accounts/Show'
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
            <Route path="/home"               exact component={Home} />
            <Route page="/login"              exact component={SignIn} />
            <Route path="/accounts/list"      exact component={PagesAccountsIndex} />
            <Route path="/accounts/show/:id"  exact component={PagesAccountsShow} />
            <Route path="/about"              exact component={About} />
            <Route path="/"                   component={Home} />
          </Switch>
        </Router>
      </div>
    </Provider>
  );
}

// Export the app.
export default App;
