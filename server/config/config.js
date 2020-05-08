//-----------------------------------------------------------------------------
// server/config/config.js
//-----------------------------------------------------------------------------
require('dotenv').config()

// ############################################################################
//  TODO: 03/09/20
//  LOOK AT REFACTORING THE CONFIGURATION LOGIC, THE GOOD THING ABOUT THIS
//  CONFIGURATION IS THAT I ONLY HAVE ONE CONFIGURATION FILE.
// ############################################################################

let env = process.env.NODE_ENV || 'development'

if(env === 'development') {
  process.env.NODE_ENV            = 'development'
  process.env.PORT                = process.env.DEV_PORT
  process.env.MONGODB_URI         = process.env.DEV_MONGODB_URI
  process.env.SECRET              = process.env.DEV_SECRET
  process.env.JWT_EXPIRATION_MS   = process.env.DEV_JWT_EXPIRATION_MS
  process.env.LOG_FILE            = process.env.DEV_LOG_FILE
}
else if(env === 'test') {
  process.env.NODE_ENV            = 'test'
  process.env.PORT                = process.env.TEST_PORT
  process.env.MONGODB_URI         = process.env.TEST_MONGODB_URI
  process.env.SECRET              = process.env.TEST_SECRET
  process.env.JWT_EXPIRATION_MS   = process.env.TEST_JWT_EXPIRATION_MS
  process.env.LOG_FILE            = process.env.TEST_LOG_FILE
}

