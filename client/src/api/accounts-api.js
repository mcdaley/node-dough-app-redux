//-----------------------------------------------------------------------------
// client/src/api/accounts-api.js
//-----------------------------------------------------------------------------
import axios              from 'axios'

import AuthAPI            from './auth-api'
import { handleErrors }   from '../utils/api-helpers'

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
        //* console.log(`[error] Failed to get accounts, error= `, err)
        const error = handleErrors(err)
        reject(error) 
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
        const error = handleErrors(err)
        reject(error)
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
      catch(err) {
        const error = handleErrors(err)
        reject(error)
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