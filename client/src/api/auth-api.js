//-----------------------------------------------------------------------------
// client/src/api/auth-api.js
//-----------------------------------------------------------------------------
import axios          from 'axios'
import localStorage   from 'local-storage'

/**
 * User authentication API
 */
const AuthAPI = {
  /**
   * Create a new account for a user.
   * @param   {String}  email 
   * @param   {String}  password
   * @returns {Promise} New user if successful, otherwise the error
   */
  register(email, password, username) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/register'

      try {
        let result = await axios.post(url, {email: email, password: password, username: username})

        //* console.log(`[debug] Registered user= `, result.data)
        resolve(result.data)
      }
      catch(err) {
        //* console.log(`[error] Failed to create account for email=[${email}], error= `, err)
        const error = parseRegisterErrors(err)
        
        reject(error)
      }
    })
  },
  /**
   * Logs a user into the the application. The login function stores the json
   * web token in cookie/local storage and is used to authenticate the user for
   * protected API calls.
   * @param   {String} email 
   * @param   {String} password 
   * @returns Returns a promise w/ the user's id, email, and expiration.
   */
  login(email, password) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/login'

      try {
        let response = await axios.post(url, {email: email, password: password})

        // Save the JWT and user to local storage.
        if(!response.headers['authorization']) {
          reject({code: 500, message: 'Authorization error from the server'})
        }
        const jwt     = response.headers['authorization']
        const {user}  = response.data
        saveAuthorization(jwt, user)

        //* console.log(`[debug] Signed in user= `, response.data)
        resolve({user})
      }
      catch(err) {
        //* console.log(`[error] Failed to login user w/ email=[${email}], error= `, err)
        if(err.response) {
          const {error} = err.response.data
          return reject(error)
        }
        reject(err)
      }
    })
  },
  /**
   * Check to see if the user has a valid jwt. Vreify that the token exists
   * and if it is not expired. If the token is expired then remove it.
   * @returns {String} Return the token if it is valid, otherwise returns null.
   */
  isAuthenticated() {
    function isTokenExpired() {
      if(user.expires < Date.now()) {
        AuthAPI.logout()
        return true
      }
      return false
    }

    const user  = localStorage.get('user')
    const token = localStorage.get('token')

    if(!user && !token)  { return null }
    if(isTokenExpired()) { return null }

    return token
  },
  /**
   * Log out the user by clearing the jwt and user from local storage. I do
   * not need to log the user out of the server because I am using 
   * sessionless authentication.
   */
  logout() {
    //* console.log(`[debug] Sign user out of the app`)
    localStorage.remove('token')
    localStorage.remove('user')
  }
} // end of AuthAPI

/**
 * Save the user and the jwt in localstorage so that it can be retrieved and
 * used to authenticate requests to the server.
 * @param {String} token 
 * @param {Object} user 
 */
const saveAuthorization = (jwt, user) => {
  localStorage.set('token', jwt)
  localStorage.set('user',  user)

  return true
}

/**
 * Utility function to parse the errors returned from the sign-up api. The
 * server api may return multiple sign-up errors, so I need to convert them
 * to a single error w/ the format: {code: xxx, message: 'error message'}
 * 
 * @param   {Object} err 
 * @returns {Object} Formatted error object.
 */
const parseRegisterErrors = (err) => {
  let error = null
  if(err.response && err.response.data.errors) {
    let keys  = Object.keys(err.response.data.errors)
    error     = err.response.data.errors[keys[0]]
  }
  else if(err.reponse) {
    error = err.response.data.error
  }
  else {
    error = err
  }
  return error
}

// Export the authAPI
export default AuthAPI