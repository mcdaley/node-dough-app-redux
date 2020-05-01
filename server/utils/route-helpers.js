//-----------------------------------------------------------------------------
// server/utils/route-helpers.js
//-----------------------------------------------------------------------------
const mongoose            = require('mongoose')
const { ObjectID }        = require('mongodb')

const Transaction         = require('../models/transaction')
const Account             = require('../models/account')
const { DBModelIdError }  = require('./custom-errors')
const logger              = require('../config/winston')

/**
 * Validates the format of the MongoDB ObjectID and then finds and returns
 * a Promise with the Account. If the Account is not found it rejects the
 * promise with a DBModelError.
 * @param   {String}  accountId - Account Id to validate
 * @param   {String}  msg       - Override the default error message
 * @returns {Promise} Returns a Promise w/ the account.
 */
const validateAndFindAccountId = (accountId, {msg = 'Account not found'} = {}) => {
  return new Promise( async (resolve, reject) => {
    let error = {code: 404, message: msg}

    // Validate if valid ObjectID
    if(!ObjectID.isValid(accountId)) {
      logger.error('Invalid account id=[%s]', accountId)
      reject(new DBModelIdError(error))
    }
    else {
      // Validate Account is in the DB
      let account = await Account.findOne({ _id: accountId })
      if(account == null) {
        reject(new DBModelIdError(error))
      }
      else {
        resolve(account)
      }
    }
  })
}

/**
 * Validates the format of the MongoDB ObjectID and then finds and returns
 * a Promise with the Transaction. If the Transaction is not found it rejects
 * the promise with a DBModelError.
 
 * @param   {String}  transactionId - Account Id to validate
 * @returns {Object}  Returns a Promise w/ the transaction
 * @throws  {DBModelIdError} For an invalid transaction ID
 */
const validateAndFindTransactionId = (transactionId) => {
  return new Promise( async (resolve, reject) => {
    let error = {code: 404, message: 'Transaction not found'}

    // Validate if valid ObjectID
    if(!ObjectID.isValid(transactionId)) {
      logger.error('Invalid transaction id=[%s]', transactionId)
      reject(new DBModelIdError(error))
    }
    else {
      // Validate Account is in the DB
      let transaction = await Transaction.findOne({ _id: transactionId })
      if(transaction == null) {
        reject(new DBModelIdError(error))
      }
      else {
        resolve(transaction)
      }
    }
  })
}

/**
 * Handle express.js route and mongoose.js errors and return a formatted 
 * response that includes the status, code, and message. The errors for
 * the Account and Transaction POST and PUT requests are the same, so 
 * consolidating logic into a single error handler.
 * 
 * @param   {Error}   err
 * @returns {Object}  Returns the http status, error code, and message.
 */
const handleErrors = (err) => {
  let errorResponse = {}
  let postErrors    = []

  if(err instanceof DBModelIdError) {
    errorResponse = {status: err.code, errors: err}
  }
  else if(err instanceof mongoose.Error.ValidationError) {
    /**
     * Loop through all of the errors and standardize on error format:
     * { code: 7xx, type: '', path: 'form-field, message: ''}
     */
    Object.keys(err.errors).forEach( (formField) => {
      if(err.errors[formField] instanceof mongoose.Error.ValidatorError) {
        postErrors.push({
          code:     701, 
          category: 'ValidationError', 
          ...err.errors[formField].properties
        })
      }
      else if(err.errors[formField] instanceof mongoose.Error.CastError) {
        postErrors.push({
          code:         701,
          category:     'ValidationError', 
          path:         err.errors[formField].path,
          type:         'cast-error',
          value:        err.errors[formField].value,
          shortMessage: err.errors[formField].stringValue,
          message:      err.errors[formField].message,
        })
      }
      else {
        logger.error(`[error] Unknown mongoose.Error.ValidationError err= `, err)
        postErrors.push({code: 799, message: "Unknown mongoose validation error"})
      }
    })

    errorResponse = {status: 400, errors: postErrors}
  }
  else if(err instanceof mongoose.Error.CastError) {
    postErrors.push({
      code:         701,
      category:     'CastError', 
      path:         err.path,
      type:         'cast-error',
      value:        err.value,
      message:      err.message,
    })

    errorResponse = {status: 400, errors: postErrors}
  }
  else {
    logger.error(`[error] Unknown error, err= `, err)
    errorResponse = {status: 400, errors: err}
  }
  
  return errorResponse
}

// Export the functions
module.exports = { validateAndFindAccountId, validateAndFindTransactionId, handleErrors }