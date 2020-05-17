//-----------------------------------------------------------------------------
// client/src/api/transactions-api.js
//-----------------------------------------------------------------------------
import axios              from 'axios'

import AuthAPI            from './auth-api'
import { handleErrors }   from '../utils/api-helpers'

/**
 * API for managing a user's account transactions.
 */
const TransactionsAPI = {
  /**
   * Fetch and return all of the transactions for the specified account.
   * @param  {string}  accountId - Account ID
   * @return {promise} Returns array of transactions
   */
  findByAccountId(accountId) {
    return new Promise( async (resolve, reject) => {
      if(!accountId) reject({ accountId: {code: 400, message: 'Account Id is required'} })

      const url = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      try {
        let config        = { headers: {Authorization: AuthAPI.isAuthenticated()} }
        let result        = await axios.get(url, config)
        let account       = result.data.account
        let transactions  = result.data.transactions.map( (txn) => setCreditAndDebitFields(txn) )
        transactions      = normalize(transactions)

        //* console.log(`[debug] Account Id=[${accountId}], transactions = `, transactions)
        resolve({account, transactions});
      }
      catch(err) {
        //* console.log(`[error] Failed to fetch transactions for account id=[${accountId}], error= `, error)
        const message = `Failed to get transactions for account id=[${accountId}]`
        const error   = handleErrors(err, message)
        reject(error)
      }
    })
  },
  /**
   * Create a new transaction for an account. Calls the POST /api/v1/account/:accountId/transactions
   * API endpoint to create the transaction.
   * 
   * @param  {String}  accountId - Unique account identifier
   * @param  {Object}  params    - Transaction params(date, description, category, charge, amount)
   * @return {Promise} Transaction if POST was successful, ortherwise return an error.
   */
  create(accountId, params) {
    return new Promise( async (resolve, reject) => {
      if(!accountId) reject({ accountId: {code: 400, message: 'Account Id is required'} })

      const url = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      try {
        let config      = { headers: {Authorization: AuthAPI.isAuthenticated()} }
        let result      = await axios.post(url, params, config)
        let transaction = setCreditAndDebitFields(result.data.transaction)
        let account     = result.data.account
        //* console.log(`[debug] Created transaction for account=[${accountId}], `, transaction)

        resolve({transaction, account})
      }
      catch(err) {
        const message = `Failed to create transaction for account id=[${accountId}]`
        const error   = handleErrors(err, message)
        reject(error)
      }
    })
  },
  /**
   * Update a transaction for an account. Calls the PUT /api/v1/account/:accountId/transactions/:id
   * API endpoint to update the transaction.
   * 
   * @param  {String}  accountId     - Unique account identifier
   * @param  {String}  transactionId - Unique transaction identifier
   * @param  {Object}  params        - Transaction params(_id, date, description, category, charge, amount)
   * @return {Promise} Transaction if PUT was successful, ortherwise return an error.
   */
  update(accountId, transactionId, params) {
    return new Promise( async (resolve, reject) => {
      if(!accountId)     reject({ accountId: {code: 400, message: 'Account Id is required'} })
      if(!transactionId) reject({ transactionId: {code: 400, message: 'Transaction Id is required'} })
      
      const url = `http://localhost:5000/api/v1/accounts/${accountId}/transactions/${transactionId}`
      try {
        let config      = { headers: {Authorization: AuthAPI.isAuthenticated()} }
        let result      = await axios.put(url, params, config)
        let transaction = setCreditAndDebitFields(result.data.transaction)
        let account     = result.data.account

        //* console.log(`[debug] Updated transaction for account=[${accountId}], `, transaction)
        resolve({transaction, account})
      }
      catch(err) {
        const message = `Failed to update transaction for account id=[${accountId}]`
        const error   = handleErrors(err, message)
        reject(error)
      }
    })
  }
}

// Export the Transactions api
export default TransactionsAPI

/**
 * Map an array of transactions into an object that contains all of the transactions
 * that is indexed by the transaction id.
 * @param   {Array}   transactions 
 * @returns {Object}  Map of transactions indexed by transaction ids.
 */
const normalize = (transactions) => {
  let normalized = {}
  transactions.forEach( (txn) => {
    normalized[txn._id] = txn
  })
  return normalized
}

/**
 * Add a debit and credit field to transactions return by the server. The
 * transactions need a debit and credit field for the transaction data grid.
 * 
 * Map the transaction amount field to either the debit or credit field based
 * on the amount of the charge. I need to do this, because in the data grid
 * I am displaying the amount as either a debit or creidt.
 * 
 * @param {Array} transactions 
 */
function setCreditAndDebitFields(transaction) {
  if(transaction.amount <= 0) {
    transaction.debit   = transaction.amount
    transaction.credit  = ''
  }
  else {
    transaction.credit  = transaction.amount
    transaction.debit   = ''
  }
  return transaction
}
