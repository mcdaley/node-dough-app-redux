//-----------------------------------------------------------------------------
// client/src/api/__tests__/auth-api.tests.js
//-----------------------------------------------------------------------------
import Cookies    from 'js-cookie'
import mockAxios  from 'axios'
import AuthAPI    from '../auth-api'

jest.mock('axios')    // https://jestjs.io/docs/en/mock-functions#mocking-modules

/**
 * AuthAPI Tests
 */
describe('AuthAPI', () => {
  afterEach( () => {
    mockAxios.get.mockClear()
    mockAxios.post.mockClear()
  })

  let credentials = {
    email:    'marv@bills.com',
    password: 'password123'
  }

  let userData = { _id: 'xxx', email: credentials.email, expires: Date.now() + 5000 }

  /**
   * TEST: AuthAPI.register()
   */
  describe('register', () => {
    const url = 'http://localhost:5000/api/v1/register'

    it('Requires an email and a password', async () => {
      let error  = {
        errors: {
          email:    { message: 'User email is required' },
          password: { message: 'Password is required' }
        }
      }

      // Add mock implementation to simulate a server error
      mockAxios.post.mockImplementationOnce( () =>
        Promise.reject(error),
      )

      // Call AuthAPI
      try {
        let result = await AuthAPI.register()
      }
      catch(err) {
        //* console.log(`[error] MCD reqister error= `, err)
        expect(err.errors.email.message).toMatch(/email is require/i)
        expect(err.errors.password.message).toMatch(/password is require/i)
      }
    })

    it('Requires a unique email address', async () => {
      let error = {
        "errors": {
          "email": {
              "message": "Email already in use"
          }
        }
      }

      // Add mock implementation to simulate a server error
      mockAxios.post.mockImplementationOnce( () =>
        Promise.reject(error),
      )

      // Call AuthAPI
      try {
        let result = await AuthAPI.register()
      }
      catch(err) {
        expect(err.errors.email.message).toMatch(/email already in use/i)
      }
    })

    it('Creates a user account', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: {user: userData},
      })

      const { user } = await AuthAPI.register(credentials.email, credentials.password)
      expect(user.email).toBe(userData.email)
      expect(user._id).toBe(userData._id)
    })
  })
})

/**
 * TEST: AuthAPI.login()
 */
describe('login', () => {
  //---------------------------------------------------------------------------
  // Login Tests
  //  1.) Logins user and returns user and jwt
  //  2.) Requires an email and password
  //  3.) User email not found
  //  4.) Incorrect password
  //---------------------------------------------------------------------------
  it.skip('Logs a user into the app', async () => {
    ///////////////////////////////////////////////////////////////////////////
    // Mock the Cookies.get() when I am trying to access a protected route?
    //  Cookies.get = jest.fn().mockImplementation(() => 'fake-json-web-token')
    //
    //  NEED TO THINK THROUGH HOW THE COOKIE INTEGRATION WORKS:
    //  1.) LOGIN RESPONSE
    //    a.) PARSE COOKIE FROM THE HEADER
    //    b.) SET THE COOKIE IN THE BROWSER USING Cookies.set(). I THINK THAT
    //        I WANT TO MOCK THIS CALL, BUT HOW? OR DO I MOCK THE CALL TO THE
    //        SERVICE THAT STORES THE COOKIE? I THINK THE 2ND OPTION MAKES
    //        THE MOST SENSE.
    //  2.) HOW DO I TEST THE LOGIN RESPONSE?
    //    a.) HERE I HAVE TO FIGURE OUT HOW I WANT TO VERIFY A COOKIE WAS 
    //        SENT IN THE RESPONSE. TYPICALLY. THIS IS WHERE I CAN MOCK THE
    //        SERVICE THAT STORES THE COOKIE.
    ///////////////////////////////////////////////////////////////////////////
    
  })
})