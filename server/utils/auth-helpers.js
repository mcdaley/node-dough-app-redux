//-----------------------------------------------------------------------------
// server/utils/auth-helpers.js
//-----------------------------------------------------------------------------
const passport  = require('../config/passport')
const logger    = require('../config/winston')

/**
 * Helper method to check to see if a user is authenticated which is added
 * as the 2nd parameter in the route call. If the token is expired or 
 * the user is not authorized then it returns a 401 error. 
 * 
 * NOTE:
 * Not sure if this is the correct implementation. The route.use() method
 * uses the node "connect" middleware and in the examples, the code looks
 * more like the following:
 * 
 *    if(error) return next(error)
 *    if(!user) return throw new AuthError('401', 'Unauthorized')
 * 
 *    req.user = user
 *    next()
 * 
 * When I tried this implementation then I received <HTML> responses w/
 * 500 error status instead of JSON w/ 401 status.
 * 
 * @param {Object}   req 
 * @param {Object}   res 
 * @param {Function} next 
 */
function authenticateJwt(req, res, next) {
  passport.authenticate('jwt', function(error, user, info) {
    if(error) {
      logger.error('Unauthorized access to protected route, error= %o', error)
      return res.status(401).send({error})
    }

    if(!user) {
      logger.error('Unauthorized access to protected route, error= %o', error)
      let authError = {code: 401, message: 'Not authorized'}
      return res.status(401).send({error: authError})
    }

    req.user = user;
    next();
  })(req, res, next);
}

// Export the authentication helpers.
module.exports = { authenticateJwt }