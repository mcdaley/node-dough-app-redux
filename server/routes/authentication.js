//-----------------------------------------------------------------------------
// server/routes/authenication.js
//-----------------------------------------------------------------------------
const express       = require('express')
const jwt           = require('jsonwebtoken')

const User          = require('../models/user')
const passport      = require('../config/passport')
const logger        = require('../config/winston')

const router = express.Router()

/**
 * POST /api/v1/register
 */
router.post('/v1/register', async (req, res) => {
  const { email, password } = req.body
  logger.debug('Attempt to create user w/ email=[%s], password=[%s]', email, password)

  try {
    let user    = new User({email: email, password: password})
    let result  = await user.save()

    logger.info('Successfully created account for user= %o', result)
    res.status(200).send({result})
  }
  catch(error) {
    logger.error('Failed to create account for email=[%s], error= %o', email, error)
    res.status(400).send({error})
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
      
      const payload = {
        email:  user.email,
        expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
      };

      // Assign a payload to req.user
      req.login(payload, {session: false}, (error) => {
        if (error) {
          return res.status(400).send({error});
        }

        // Generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);
        const data  = {_id: user._id, email: user.email}

        res.cookie('jwt', token, { httpOnly: true });
        res.status(200).send({user: data});
      })
    }
  )(req, res)
})

// Export Authentication Routes
module.exports = router