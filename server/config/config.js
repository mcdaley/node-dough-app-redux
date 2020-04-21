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
  process.env.NODE_ENV    = 'development'
  process.env.PORT        = process.env.DEV_PORT
  process.env.MONGODB_URI = process.env.DEV_MONGODB_URI
  process.env.LOG_FILE    = process.env.DEV_LOG_FILE
}
else if(env === 'test') {
  process.env.NODE_ENV    = 'test'
  process.env.PORT        = process.env.TEST_PORT
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI
  process.env.LOG_FILE    = process.env.TEST_LOG_FILE
}

/** 
module.exports = {
  PORT:   process.env.PORT,
  MONGODB_URI
}
**/

