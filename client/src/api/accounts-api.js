//-----------------------------------------------------------------------------
// client/src/api/accounts-api.js
//-----------------------------------------------------------------------------
import axios              from 'axios'

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
        const result   = await axios.get('http://localhost:5000/api/v1/accounts');
        const accounts = normalize(result.data.accounts)
        
        //* console.log(`[debug] fetchData, results = `, result.data)
        resolve(accounts);
      } 
      catch (err) {
        //* console.log(`[error] Failed to retrieve user accounts, error= `, err)
        reject({
          server: {
            code:     500,
            message:  'Unable to get your accounts',
          }
        })
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
        const result  = await axios.get(url);
        
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
   * Create a new account for the user in the DB.
   * @param {*} account 
   */
  create(params) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/accounts'

      try {
        let response = await axios.post(url, params)

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