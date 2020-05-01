//-----------------------------------------------------------------------------
// client/utils/custom-errors.js
//-----------------------------------------------------------------------------
const util = require('util')

/**
 * The DBModelIDError should be thrown for invalid mongoose ObjectID fields.
 * The error should be thrown when the ObjectID is invalid or if the 
 * record for the ObjectID is not found in the DB.
 * 
 * @param {Number} code
 * @param {String} message
 */
function DBModelIdError({code = 404, message = 'ID not found'}) {
  //* Error.captureStackTrace(this, CustomError);
  this.name     = DBModelIdError.name;
  this.code     = code;
  this.message  = message;
}
util.inherits(DBModelIdError, Error);

// Export the errors
module.exports = { DBModelIdError }

