//-----------------------------------------------------------------------------
// server/utils/route-helpers.js
//-----------------------------------------------------------------------------
//* const mongoose        = require('mongoose')
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

// Export the functions
module.exports = { validateAccountId, validateTransactionId }