//-----------------------------------------------------------------------------
// server/utils/current-user-helper.js
//-----------------------------------------------------------------------------
const logger  = require('../config/winston')
const User    = require('../models/user')

/**
 * Temporary method for getting the current user for APIs that I will use
 * until I emplement authentication w/ passport.js. When I implement
 * authentication, then the user will be retreived from the DB in the
 * deserialize function and saved in the req.passport.user.
 * 
 * The function requires that the user w/ email 'fergie@bills.com' is in 
 * the development and test DBs system.
 * 
 * @returns Promise w/ the authenticated user, 'fergie@bills.com'
 */
const currentUser = () => {
  return new Promise( (resolve, reject) => {
    User.findOne({email: 'fergie@bills.com'})
      .then( (user) => {
        logger.silly('Authenticated user= %o', user) 
        resolve(user)  
      })
      .catch( (err) => {
        logger.error(
          `Failed to get user w/ email=[fergie@bills.com], err= %o`, err
        )
        reject(err)  
      })
  })
}

// Export the functions
module.exports = { currentUser }
