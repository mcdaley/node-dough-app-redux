//-----------------------------------------------------------------------------
// client/src/api/__tests__/accounts-api.test.js
//-----------------------------------------------------------------------------
import axiosMock      from 'axios'
import AccountsAPI    from '../accounts-api'

jest.mock('axios')    // https://jestjs.io/docs/en/mock-functions#mocking-modules

// Mock account data
const accountsData = [
  { 
    _id:                '1', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            100.00,
    asOfDate:           '2020-03-31T07:00:00.000Z',
    userId:             'Me'
  },
  { 
    _id:                '2', 
    name:               'Test Credit Card', 
    financialInstitute: 'Credit Union', 
    type:               'Credit Card', 
    balance:            500.00,
    asOfDate:           '2020-03-31T07:00:00.000Z',
    userId:             'Me',
  }
]

describe('Accounts API', () => {

  afterEach( () => {
    axiosMock.get.mockClear()
    axiosMock.post.mockClear()
  })

  /**
   * AccountsAPI.get()
   */
  describe('get', () => {
    /**
     * Instead of calling axios.get(url), I want to mocj the axios.get() to return 
     * the accountsData
     */
    it('Returns an array of accounts', async () => {
      axiosMock.get.mockResolvedValueOnce({
        data: { accounts: accountsData },
      })

      const accounts = await AccountsAPI.get()
      expect(accounts.length).toBe(2)
    })

    it('Returns a server error', async () => {
      const serverError = {
        server: { code: 500, message: 'Unable to get your accounts' }
      }

      // Add mock implementation to simulate a server error
      axiosMock.get.mockImplementationOnce(() =>
        Promise.reject(serverError),
      )

      try {
        const accounts = await AccountsAPI.get()
      }
      catch(error) {
        expect(error.server.code).toBe(500)
        expect(error.server.message).toMatch(/Unable to get your accounts/)
      }
    })
  })

  /**
   * AccountsAPI.create()
   */
  describe('create', () => {
    it('Creates an account', async () => {
      axiosMock.post.mockResolvedValueOnce({
        data: accountsData[1],
      })

      const url     = 'http://localhost:5000/api/v1/accounts'
      const params  = accountsData[1]

      const account = await AccountsAPI.create(url, params)
      expect(account.name).toBe(accountsData[1].name)
    })
    
    /**
     * Different way to do the previous test that creates a mock implementation
     * for the axios.post() api call.
     */
    it('Create an account using a mock implementation', async () => {
      const url     = 'http://localhost:5000/api/v1/accounts'
      const params  = {
        name:               'Test Credit Card', 
        financialInstitute: 'Credit Union', 
        type:               'Credit Card', 
        balance:            500.00,
        asOfDate:           '2020-03-31T07:00:00.000Z',
      }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce( (url, params) =>
        Promise.resolve({ data: {...params, _id: '99', userId: '55'} }),
      )

      const account = await AccountsAPI.create(params)
      expect(account.name).toBe(params.name)
      expect(account.type).toBe(params.type)
      expect(account._id).toBe('99')
      expect(account.userId).toBe('55')
    })
    
    it('Returns a server error', async () => {
      const url     = 'http://localhost:5000/api/v1/accounts'
      const params  = {
        name:               'Test Credit Card', 
        financialInstitute: 'Credit Union', 
        type:               'Credit Card', 
        balance:            500.00,
        asOfDate:           '2020-03-31T07:00:00.000Z',
      }

      const serverError = {
        server: { code: 500, message: 'Unable to get your accounts' }
      }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce((url, params) =>
        Promise.reject(serverError),
      )

      try {
        const accounts= await AccountsAPI.create(params)
      }
      catch(error) {
        expect(error.server.code).toBe(500)
        expect(error.server.message).toMatch(/Unable to connect to the server/)
      }
    })
  })
})