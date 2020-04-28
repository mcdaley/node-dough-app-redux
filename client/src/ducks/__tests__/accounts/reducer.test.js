//-----------------------------------------------------------------------------
// client/src/ducks/__tests__/accounts/reducer.test.js
//-----------------------------------------------------------------------------
import { types, reducer } from '../../accounts'

/**
 * Account Redux Reducer
 */
describe('Account Redux Reducer', () => {
  //
  // TEST fetching accounts
  //
  describe('fetchAccounts()', () => {
    it('FETCH_ACCOUNTS: Returns array of accounts', () => {
      const initialState = { data: {} }
      const accounts     = {
        '1': { _id: '1', name: 'Checking' },
        '2': { _id: '2', name: 'Savings' },
      }

      const result = reducer(initialState, {
        type:     types.FETCH_ACCOUNTS,
        payload:  {accounts: accounts},
      })

      expect(Object.keys(result.data).length).toBe(2)
      expect(result.data['1'].id).toBe(accounts['1'].id)
      expect(result.data['1'].name).toBe('Checking')
    })

    it('FETCH_ACCOUNTS_ERROR: Returns an error', () => {
      const error  = { code: 500, message: 'Server error' }
      const result = reducer(undefined, {
        type:     types.FETCH_ACCOUNTS_ERROR,
        payload:  {error: error}
      })

      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })

  describe('findAccount', () => {
    const initialState = {
      data: {
        '1': { _id: '1', name: 'Checking' },
        '2': { _id: '2', name: 'Savings' },
      }
    }

    it('FIND_ACCOUNT: Returns an account', () => {
      const account = { _id: '1', name: 'Checking' }
      const result  = reducer(initialState, {
        type:     types.CREATE_ACCOUNT,
        payload:  { account: account }
      })

      expect(Object.keys(result.data).length).toBe(2)
      expect(result.data['1']._id).toBe(account._id)
      expect(result.data['1'].name).toBe(account.name)
    })

    it('FIND_ACCOUNT_ERROR: Returns an error', () => {
      const error   = { code: 500, message: 'Server error' }
      const result  = reducer(initialState, {
        type:     types.FIND_ACCOUNT_ERROR,
        payload:  {error: error}
      })

      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })

  //
  // TEST create account
  //
  describe('createAccounts()', () => {
    const initialState = {
      data: {
        '1': { _id: '1', name: 'Checking' },
        '2': { _id: '2', name: 'Savings' },
      }
    }

    it('CREATE_ACCOUNT: Creates and returns an account', () => {
      const account = {_id: '3', name: 'Credit Card'}

      const result  = reducer(initialState, {
        type:     types.CREATE_ACCOUNT,
        payload:  { account: account }
      })
    
      expect(Object.keys(result.data).length).toBe(3)
      expect(result.data['3']._id).toBe(account._id)
      expect(result.data['3'].name).toBe(account.name)
    })

    it('CREATE_ACCOUNT_ERROR: Returns an error', () => {
      const error  = { code: 400, message: 'Bad request' }
      const result = reducer(initialState, {
        type:     types.CREATE_ACCOUNT_ERROR,
        payload:  {error: error},
      })

      //* expect(Object.keys(result).length).toBe(2)
      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })

  //
  // TEST updating account balance when a transaction is created
  //
  describe('Transaction Actions', () => {
    const initialState = {
      data: {
        '1': { _id: '1', name: 'Checking', balance: 1000 },
        '2': { _id: '2', name: 'Savings',  balance: 5000 },
      }
    }
    const account = { _id: '2', name: 'Savings',  balance: 4000 }

    describe('createTransaction', () => {
      it('Updates the account balance', () => {
        const result  = reducer(initialState, {
          type:     types.CREATE_TRANSACTION,
          payload:  { account: account }
        })
  
        expect(Object.keys(result.data).length).toBe(2)
        expect(result.data['2'].balance).toBe(4000)
      })
    })
  })
})