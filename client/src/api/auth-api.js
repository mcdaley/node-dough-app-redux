//-----------------------------------------------------------------------------
// client/src/api/auth-api.js
//-----------------------------------------------------------------------------
import axios      from 'axios'
import Cookies    from 'js-cookie'

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
  register(email, password) {
    return new Promise( async (resolve, reject) => {
      const url = 'http://localhost:5000/api/v1/register'

      try {
        let result = await axios.post(url, {email: email, password: password})

        console.log(`[debug] Registered user= `, result.data)
        resolve(result.data)
      }
      catch(error) {
        console.log(`[error] Failed to create account for email=[${email}], error= `, error)
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
      const url    = 'http://localhost:5000/api/v1/login'
      const config = {withCredentials: true}

      try {
        let response = await axios.post(url, {email: email, password: password}, config)

        console.log(`[debug] Login config= `, response.config)
        console.log(`[debug] Login Headers= `, response.headers)
        console.log(`[debug] Login Cookies= `, response.headers['set-cookie'])
        ///////////////////////////////////////////////////////////////////////
        // TODO: 05/13/20
        // ONCE I GET THE COOKIE THEN I SHOULD BE ABLE TO USE JS-COOKIE TO
        // SET THE COOKIE IN THE BROWSER, I THINK IT WILL THEN BE SENT IN 
        // ALL OF MY FUTURE REQUESTS?
        //
        // I can set the cookie using the following code:
        //  Cookie.set('jwt', token) 
        ///////////////////////////////////////////////////////////////////////

        console.log(`[debug] Signed in user= `, response.data)
        resolve(response.data)
      }
      catch(error) {
        console.log(`[error] Failed to login user w/ email=[${email}], error= `, error)
        reject(error)
      }
    })
  }
}

// Export the authAPI
export default AuthAPI