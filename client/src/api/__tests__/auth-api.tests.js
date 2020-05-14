//-----------------------------------------------------------------------------
// client/src/api/__tests__/auth-api.tests.js
//-----------------------------------------------------------------------------
import mockAxios      from 'axios'
import localStorage   from 'local-storage'
import AuthAPI        from '../auth-api'

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

  let userData  = { _id: 'xxx', email: credentials.email, expires: Date.now() + 5000 }
  let headers   = { authorization: 'Bearer encryptedtoken'}

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

      // Call sign-up api
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

  /**
   * TEST: AuthAPI.login()
   */
  describe('login', () => {
    //---------------------------------------------------------------------------
    // Login Tests
    //  [x] 1.) Logins user and returns user and jwt
    //  2.) Requires an email and password
    //  3.) User email not found
    //  4.) Incorrect password
    //---------------------------------------------------------------------------
    it('Requires an email and a password', async () => {
      let error  = {
        errors: {
          email:    { message: 'User email is required' },
          password: { message: 'Password is required' }
        }
      }

      mockAxios.post.mockImplementationOnce( () =>
        Promise.reject(error),
      )

      try {
        let result = await AuthAPI.login()
      }
      catch(err) {
        //* console.log(`[error] MCD reqister error= `, err)
        expect(err.errors.email.message).toMatch(/email is require/i)
        expect(err.errors.password.message).toMatch(/password is require/i)
      }
    })

    it('Returns 400 error for an incorrect password', async () => {
      let error = {
        "error": {
          "code": 400,
          "message": "Invalid credentials"
        } 
      }

      mockAxios.post.mockImplementationOnce( () =>
        Promise.reject(error),
      )

      try {
        let result = await AuthAPI.login()
      }
      catch(err) {
        //* console.log(`[error] MCD reqister error= `, err)
        expect(err.error.code).toBe(400)
        expect(err.error.message).toMatch(/invalid credentials/i)       
      }
    })

    it('Logs a user into the app', async () => {
      mockAxios.post.mockResolvedValueOnce({
        headers:  headers,
        data:     { user: userData },
      })

      const { user } = await AuthAPI.login(credentials.email, credentials.password)
      
      expect(user.email).toBe(userData.email)
      expect(user._id).toBe(userData._id)

      expect(localStorage.get('token')).toBe(headers.authorization)
      expect(localStorage.get('user')._id).toBe(userData._id)
      expect(localStorage.get('user').email).toBe(userData.email)
    })
  })
})