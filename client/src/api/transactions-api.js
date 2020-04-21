//-----------------------------------------------------------------------------
// client/src/api/transactions-api.js
//-----------------------------------------------------------------------------
import axios  from 'axios'

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
        let result        = await axios.get(url)
        let account       = result.data.account
        let transactions  = result.data.transactions.map( (txn) => setCreditAndDebitFields(txn) )

        //* console.log(`[debug] Account Id=[${accountId}], transactions = `, transactions)
        resolve({account, transactions});
      }
      catch(error) {
        //* console.log(`[error] Failed to fetch transactions for account id=[${accountId}], error= `, error)
        reject({
          server: {
            code:     500,
            message:  `Unable to get transactions for account id=[${accountId}]`,
          }
        })
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
        let result      = await axios.post(url, params)
        let transaction = setCreditAndDebitFields(result.data)
        //* console.log(`[debug] Created transaction for account=[${accountId}], `, transaction)

        resolve({transaction})
      }
      catch(error) {
        if (error.response) {
          console.log(
            `[error] Failed to create transaction, ` + 
            `status=[${error.response.status}], `    +
            `data= [${error.response.data}]`
          )
          // Convert errors from [] to an {}
          let errors = {}
          error.response.data.errors.forEach( (err) => {
            errors[err.path] = {
              code:     err.code, 
              field:    err.path, 
              message:  err.message}
          })
    
          reject(errors)
        } 
        else if (error.request) {
          // The request was made but no response was received
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        } 
        else {
          // Received unknown server error.
          //* console.log('Error', error.message);
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        }
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
        let result      = await axios.put(url, params)
        let transaction = setCreditAndDebitFields(result.data.transaction)

        //* console.log(`[debug] Updated transaction for account=[${accountId}], `, transaction)
        resolve(transaction)
      }
      catch(error) {
        if (error.response) {
          console.log(
            `[error] Failed to update the transaction, `  + 
            `status=[${error.response.status}], ` +
            `data= [${error.response.data}]`
          )
          // Convert errors from [] to an {}
          let errors = {}
          error.response.data.errors.forEach( (err) => {
            errors[err.path] = {
              code:     err.code, 
              field:    err.path, 
              message:  err.message}
          })
    
          reject(errors)
        } 
        else if (error.request) {
          // The request was made but no response was received
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        } 
        else if(Array.isArray(error.errors)) {
          // Handle form input validation errors
          let inputErrors = error.errors.map( (err) => {
            return { 
              code:     err.code, 
              path:     err.path,
              value:    err.value,
              message:  err.message
            } 
          })
          reject(inputErrors)
        }
        else {
          // Received unknown server error.
          //** console.log('Error', error.message);
          reject({
            server: {
              code:     error.code || 500,
              message:  error.message || 'Unable to connect to the server',
            }
          })
        }
      }
    })
  }
}

// Export the Transactions api
export default TransactionsAPI

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
