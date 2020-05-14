//-----------------------------------------------------------------------------
// server/routes/authenication.js
//-----------------------------------------------------------------------------
const express             = require('express')
const jwt                 = require('jsonwebtoken')
const MongoError          = require('mongodb').MongoError

const User                = require('../models/user')
const passport            = require('../config/passport')
const { authenticateJwt } = require('../utils/auth-helpers')
const logger              = require('../config/winston')

const router = express.Router()

/**
 * POST /api/v1/register
 */
router.post('/v1/register', async (req, res) => {
  const { email, password } = req.body
  logger.debug('Attempt to create user w/ email=[%s], password=[%s]', email, password)

  try {
    let userModel = new User({email: email, password: password})
    await userModel.save()
    let user      = { _id: userModel._id, email: userModel.email }
    
    logger.info('Successfully created account for user= %o', user)
    res.status(201).send({user})
  }
  catch(error) {
    logger.error('Failed to create account for email=[%s], error= %o', email, error)
    if(error instanceof MongoError) {
      // Email already exists in the DB
      let err = { email: {code: 707, message: 'Email already in use'} }
      res.status(400).send({status: error.code, errors: err})
    }
    else {
      res.status(400).send(error)
    }
  }
})

/**
 * POST /api/v1/login
 */
router.post('/v1/login', (req, res) => {
  passport.authenticate(
    'local',
    {session: false},
    (error, user, message) => {
      if(error || !user) {
        return res.status(400).send({error})
      }
      
      logger.debug('[MCD] JWT_EXPIRATION_MS= %d', parseInt(process.env.JWT_EXPIRATION_MS))
      const payload = {
        _id:      user._id.toHexString(),
        email:    user.email,
        expires:  Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
      };

      // Assign a payload to req.user
      req.login(payload, {session: false}, (error) => {
        if (error) {
          return res.status(400).send({error});
        }

        // Generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);
        const data  = {_id: payload._id, email: payload.email, expires: payload.expires}

        res.status(200).set({Authorization: `Bearer ${token}`}).send({user: data})
      })
    }
  )(req, res)
})


// Export Authentication Routes
module.exports = router