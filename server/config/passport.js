//-----------------------------------------------------------------------------
// server/config/passport.js
//-----------------------------------------------------------------------------
const passport      = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User          = require('../models/user')

/**
 * Setup the passport Local strategy to handle the signup and signin
 * routes for the API.
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField:  'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({email: email})
    
    if(!user) {
      logger.error('Unable to find user w/ email=[%s] in DB', email)
      return done(null, false, {message: 'Invalid credentials'})
    }
    else if(user.password === password) {
      logger.info('Authenticated credential for user=[%o]', user)
      return done(null, user)
    }
    else {
      logger.info('User w/ email=[%s] entered invalid password=[%s]', email, password)
      return done(null, false, {message: 'Invalid credentials'})
    }
  }
  catch(error) {
    logger.error('Failed to authenticate user w/ email=[%s], err=[%o]', email, err)
    return done(err)
  }
}))

// Export the passport module
module.export = passport