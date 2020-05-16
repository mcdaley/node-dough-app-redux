//-----------------------------------------------------------------------------
// client/src/api/accounts-api.js
//-----------------------------------------------------------------------------
import axios              from 'axios'

import AuthAPI            from './auth-api'

/**
 * API for managing user accounts.
 */
const AccountsAPI = {
  /**
   * Return all of the users accounts, calls the following api:
   * GET /api/v1/accounts
   */
  get() {
    return new Promise( async (resolve, reject) => {
      try {
        const token     = AuthAPI.isAuthenticated()
        const config    = { headers: {Authorization: token} }
        const result    = await axios.get('http://localhost:5000/api/v1/accounts', config);
        const accounts  = normalize(result.data.accounts)
        
        //* console.log(`[debug] fetchData, results = `, result.data)
        resolve(accounts);
      } 
      catch (err) {
        ///////////////////////////////////////////////////////////////////////
        // TODO: 05/16/2020
        // - MAKE SURE I CAN HANDLE THE DIFFERENT TYPES OF SERVER ERRORS. 
        //   NEED TO CHECK API TO SEE WHAT ERROR CODES CAN BE RETURNED.
        //
        // - IF TOKEN EXPIRED OR IF TOKEN IS INVALID THEN I SHOULD CLEAR THE
        //   'jwt' TOKEN FROM LOCAL-STORAGE.
        ///////////////////////////////////////////////////////////////////////
        if(err.response) {
          // Server returned a response w/ a message.
          console.log(`[error] Failed to retrieve user accounts, error= `, err.response)
          
          let {error} = err.response.data
          reject(error)
        }
        else {
          reject({
            server: {
              code:     500,
              message:  'Unable to get your accounts',
            }
          })
        } 
      }
    })
  },
  /**
   * Find and return a user's account, calls the following api:
   * GET /api/v1/accounts/:id
   * 
   * @param {string} id - Account ID. 
   */
  find(id) {
    return new Promise( async (resolve, reject) => {
      if(!id) reject({ accountId: {code: 400, message: 'Account Id is required'} })

      const url = `http://localhost:5000/api/v1/accounts/${id}`
      try {
        const token   = AuthAPI.isAuthenticated()
        const config  = { headers: {Authorization: token} }

        const result  = await axios.get(url, config);
        
        //* console.log(`[debug] find(${id}), results = `, result.data)
        resolve(result.data.account);
      }
      catch (err) {
        //* console.log(`[error] Failed to retrieve accounts w/ id=[${id}], error= `, err)
        reject({
          server: {
            code:     500,
            message:  `Unable to get account, id=[${id}]`,
          }
        })
      }
    })
  },
  /**
   * Create a new account for the user in the DB, calls the following api:
   * POST /api/v1/accounts
   * @param   {Object}  params - Fields to create a new account.
   * @returns {Promise} Returns a promise w/ the new account.
   */
  create(params) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/accounts'

      try {
        const token     = AuthAPI.isAuthenticated()
        const config    = { headers: {Authorization: token} }
        
        let   response  = await axios.post(url, params, config)

        //* console.log(`[info] Created account= `, response.data)
        resolve(response.data)
      }
      catch(error) {
        if (error.response) {
          console.log(
            `[error] Failed to create account, `  + 
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
        else {
          // Received unknown server error.
          console.log('Error', error.message);
          reject({
            server: {
              code:     500,
              message:  'Unable to connect to the server',
            }
          })
        }
      }
    })
  }
}

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


// Export accounts api
export default AccountsAPI