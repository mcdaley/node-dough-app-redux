//-----------------------------------------------------------------------------
// server/config/passport.js
//-----------------------------------------------------------------------------
const passport      = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User          = require('../models/user')
const logger        = require('./winston')

/**
 * Setup the passport Local strategy to handle the signup and signin
 * routes for the API.
 */
passport.use(new LocalStrategy({
    usernameField:  'email',
    passwordField:  'password',
    session:        false
  }, 
  async (email, password, done) => {
    try {
      const user = await User.findOne({email: email})
      
      if(!user) {
        logger.error('Unable to find user w/ email=[%s] in DB', email)
        return done({code: 400, message: 'Invalid credentials'})
      }
      else if(user.password !== password) {
        logger.info('User w/ email=[%s] entered invalid password=[%s]', email, password)
        return done({code: 400, message: 'Invalid credentials'})
      }
      else {
        logger.info('Authenticated credential for user=[%o]', user)
        return done(null, user)
      }
    }
    catch(error) {
      logger.error('Failed to authenticate user w/ email=[%s], err=[%o]', email, error)
      return done(error)
    }
  }
))

// Export the passport module
module.exports = passport