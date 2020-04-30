//-----------------------------------------------------------------------------
// client/src/ducks/__tests__/accounts/reducer.test.js
//-----------------------------------------------------------------------------
import { types, reducer } from '../../accounts'

/**
 * Account Redux Reducer
 */
describe('Account Redux Reducer', () => {
  const accounts     = {
    '1': { _id: '1', name: 'Checking', balance: 1000, transactions: ['a', 'b', 'c'] },
    '2': { _id: '2', name: 'Savings',  balance: 5000, transactions: [] },
  }

  const transactions = {
    'a': { _id: 'a', description: 'One',   amount:  50.00, accountId: '1' },
    'b': { _id: 'b', description: 'Two',   amount: -25.00, accountId: '1' },
    'c': { _id: 'c', description: 'Three', amount:  20.00, accountId: '1' },
  }

  //
  // TEST fetching accounts
  //
  describe('fetchAccounts()', () => {
    it('FETCH_ACCOUNTS: Returns array of accounts', () => {
      const initialState = {}
      const result       = reducer(initialState, {
        type:     types.FETCH_ACCOUNTS,
        payload:  {accounts: accounts},
      })

      expect(Object.keys(result.byId).length).toBe(2)
      expect(result.byId['1'].id).toBe(accounts['1'].id)
      expect(result.byId['1'].name).toBe('Checking')
    })

    it('FETCH_ACCOUNTS_ERROR: Returns an error', () => {
      const error  = { code: 500, message: 'Server error' }
      const result = reducer(undefined, {
        type:     types.FETCH_ACCOUNTS_ERROR,
        payload:  {error: error}
      })

      console.log(`[debug] result byId= `, result)
      expect(result.byId.error.code).toBe(error.code)
      expect(result.byId.error.message).toBe(error.message)
    })
  })

  describe('findAccount', () => {
    const initialState = { byId: accounts }

    it('FIND_ACCOUNT: Returns an account', () => {
      const account = { _id: '1', name: 'Checking' }
      const result  = reducer(initialState, {
        type:     types.FIND_ACCOUNT,
        payload:  { account: account }
      })

      expect(Object.keys(result.byId).length).toBe(2)
      expect(result.byId['1']._id).toBe(account._id)
      expect(result.byId['1'].name).toBe(account.name)
    })

    it('FIND_ACCOUNT_ERROR: Returns an error', () => {
      const error   = { code: 500, message: 'Server error' }
      const result  = reducer(initialState, {
        type:     types.FIND_ACCOUNT_ERROR,
        payload:  {error: error}
      })

      expect(result.byId.error.code).toBe(error.code)
      expect(result.byId.error.message).toBe(error.message)
    })
  })

  //
  // TEST create account
  //
  describe('createAccounts()', () => {
    const initialState = { byId: accounts }
    
    it('CREATE_ACCOUNT: Creates and returns an account', () => {
      const account = {_id: '3', name: 'Credit Card'}

      const result  = reducer(initialState, {
        type:     types.CREATE_ACCOUNT,
        payload:  { account: account }
      })
    
      expect(Object.keys(result.byId).length).toBe(3)
      expect(result.byId['3']._id).toBe(account._id)
      expect(result.byId['3'].name).toBe(account.name)
    })

    it('CREATE_ACCOUNT_ERROR: Returns an error', () => {
      const error  = { code: 400, message: 'Bad request' }
      const result = reducer(initialState, {
        type:     types.CREATE_ACCOUNT_ERROR,
        payload:  {error: error},
      })

      //* expect(Object.keys(result).length).toBe(2)
      expect(result.byId.error.code).toBe(error.code)
      expect(result.byId.error.message).toBe(error.message)
    })
  })

  //
  // TEST Transaction Actions that effect Accounts
  //
  describe('Transaction Actions', () => {
    const initialState = { byId: accounts }
    const account      = { _id: '2', name: 'Savings',  balance: 4000, transaction: [] }

    // CREATE_TRANSACTION
    describe('createTransaction', () => {
      it('Updates the account balance', () => {
        const result  = reducer(initialState, {
          type:     types.CREATE_TRANSACTION,
          payload:  { 
            account:      account, 
            transaction:  transactions['a'] }
        })
  
        expect(Object.keys(result.byId).length).toBe(2)
        expect(result.byId['2'].balance).toBe(4000)
        expect(result.byId['2'].transactions.length).toBe(1)
      })
    })

    // UPDATE_TRANSACTION
    describe('updateTransaction', () => {
      it('Updates the account balance', () => {
        const account = accounts['1']
        const result  = reducer(initialState, {
          type:     types.UPDATE_TRANSACTION,
          payload:  { 
            account:      account,
            transaction:  transactions['a']
          }
        })
  
        expect(Object.keys(result.byId).length).toBe(2)
        expect(result.byId['1'].balance).toBe(1000)
        expect(result.byId['1'].transactions.length).toBe(3)
      })
    })

    // FETCH_TRANSACTIONS_BY_ACCOUNT_ID
    describe('fetchTransactionsByAccountId', () => {
      const result = reducer( initialState, {
        type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
        payload:  {
          account:      accounts['1'],
          transactions: transactions,
        }
      })

      expect(Object.keys(result.byId).length).toBe(2)
      expect(result.byId['1'].transactions.length).toBe(3)
    })
  })
})