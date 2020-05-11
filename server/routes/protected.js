//-----------------------------------------------------------------------------
// server/routes/protected.js
//-----------------------------------------------------------------------------
const express             = require('express')
const jwt                 = require('jsonwebtoken')

const User                = require('../models/user')
const passport            = require('../config/passport')
const { authenticateJwt } = require('../utils/auth-helpers')
const logger              = require('../config/winston')

const router = express.Router()

/****************************************************************************** 
 * Examples of implementing protected routes. the '/v1/protected' endpoint
 * uses the authenticateJwt helper to validate the request and the second
 * endpoint, '/v1/protected_v01' uses the IIEF as outlined in the passport.js
 * authenticate documentation.
 ******************************************************************************/

/**
 * GET /api/v1/protected
 */
router.get('/v1/protected', authenticateJwt, (req, res) => {
  const { user } = req
  logger.debug('Authenticated user= %o', user)
  res.status(200).send({user})
})

/**
 * GET /api/v1/protected_v01
 * 
 * Implementation checking if there is a valid JSON Web Token as outlined in
 * the passport.js documentation under passport.authenticate. This method is
 * not scalable since I would have to add the IIEF to every protected API.
 */
router.get('/v1/protected_v01',
  (req, res) => {
    passport.authenticate(
      'jwt',
      {session: false},
      (error, payload) => {
        if(error) {
          logger.error('Unauthorized access to protected route, error= %o', error)
          return res.status(401).send({error})
        }
        
        if(!payload) {
          logger.error('Invalid payload')
          return res.status(401).send({error: {code: 401, message: 'Unauthorized'}})
        }

        const { _id, email } = payload
        logger.debug('Verified the user - do some work, _id=[%s], email=[%s]', _id, email)
        res.status(200).send({user: {_id: _id, email: email}})
      }
    )(req, res)
  }
)

// Export Authentication Routes
module.exports = router
