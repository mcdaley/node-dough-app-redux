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
      const accounts = [
        {id: '1', name: 'Checking'},
        {id: '2', name: 'Savings'},
      ]

      const result = reducer(undefined, {
        type:     types.FETCH_ACCOUNTS,
        payload:  accounts,
      })

      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe('1')
      expect(result.data[0].name).toBe('Checking')
    })

    it('FETCH_ACCOUNTS_ERROR: Returns an error', () => {
      const error  = {error: { code: 500, message: 'Server error' } }
      const result = reducer(undefined, {
        type:     types.FETCH_ACCOUNTS_ERROR,
        payload:  error
      })

      expect(result.code).toBe(error.error.code)
      expect(result.message).toBe(error.error.message)
    })
  })

  //
  // TEST create account
  //
  describe('createAccounts()', () => {
    const initialState = { data: [
      {id: '1', name: 'Checking'},
      {id: '2', name: 'Savings'},
    ] }

    it('CREATE_ACCOUNT: Creates and returns an account', () => {
      const result = reducer(initialState, {
        type:     types.CREATE_ACCOUNT,
        payload:  { id: '3', name: 'Credit Card' }
      })

      expect(result.data.length).toBe(3)
      expect(result.data[2].id).toBe('3')
      expect(result.data[2].name).toBe('Credit Card')
    })

    it('CREATE_ACCOUNT_ERROR: Returns an error', () => {
      const error  = {error: { code: 400, message: 'Bad request' } }
      const result = reducer(initialState, {
        type:     types.CREATE_ACCOUNT_ERROR,
        payload:  error,
      })

      expect(result.data.length).toBe(2)
      expect(result.code).toBe(error.error.code)
      expect(result.message).toBe(error.error.message)
    })
  })
})