//-----------------------------------------------------------------------------
// server/utils/route-helpers.js
//-----------------------------------------------------------------------------
const mongoose        = require('mongoose')
const { ObjectID }    = require('mongodb')

const Transaction     = require('../models/transaction')
const Account         = require('../models/account')
const logger          = require('../config/winston')

/**
 * Helper to validate an accountId. First, the method just verifies if the
 * accountId is a valid mongodb ObjectID. If the accountId is not valid
 * it returns false. If the accountId is valid then function returns valid
 * and if the model flag is set to true then the function looks up the
 * account and returns it.
 * @param   {String} accountId - Account Id to validate
 * @param   {Object} options   - Object w/ boolean valid and account 
 * @returns {Object} Returns an object w/ a boolean valid flag and an account.
 */
const validateAccountId = (accountId, options = {model: false, msg: 'Account not found'}) => {
  return new Promise( async (resolve, reject) => {
    let error = {code: 404, message: options.msg}

    if(!ObjectID.isValid(accountId)) {
      logger.error('Invalid account id=[%s]', accountId)
      reject(error)
    }
    else if(options.model === false) {
      resolve(undefined)
    }
    else { // options.model === true
      //* account = await Account.findById(accountId)
      let account = await Account.findOne({ _id: accountId })
      if(account == null) {
        reject(error)
      }
      else {
        resolve(account)
      }
    }
  })
}

/**
 * Helper to validate an transactionId. First, the method just verifies if the
 * transactionId is a valid mongodb ObjectID. If the transactionId is not valid
 * it returns false. If the transactionId is valid then function returns valid
 * and if the model flag is set to true then the function looks up the
 * transaction and returns it.
 * @param   {String} accountId - Account Id to validate
 * @param   {Object} options   - Object w/ boolean valid and account 
 * @returns {Object} Returns an object w/ a boolean valid flag and an account.
 */
const validateTransactionId = (transactionId, options = {model: false}) => {
  return new Promise( async (resolve, reject) => {
    let error = {code: 404, message: 'Transaction not found'}

    if(!ObjectID.isValid(transactionId)) {
      logger.error('Invalid transaction id=[%s]', transactionId)
      reject(error)
    }
    else if(options.model === false) {
      resolve(undefined)
    }
    else {    // options.modle === true
      let transaction = await Transaction.findOne({ _id: transactionId })
      transaction == null ? reject(error) : resolve(transaction)
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

  if(err instanceof mongoose.Error.ValidationError) {
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
module.exports = { validateAccountId, validateTransactionId, handleErrors }