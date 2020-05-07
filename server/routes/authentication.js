//-----------------------------------------------------------------------------
// server/routes/authenication.js
//-----------------------------------------------------------------------------
const express       = require('express')
const { ObjectID }  = require('mongoose')

const User          = require('../models/user')
const passport      = require('../config/passport')
const logger        = require('../config/winston')

const router = express.Router()

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

// Export Authentication Routes
module.exports = router