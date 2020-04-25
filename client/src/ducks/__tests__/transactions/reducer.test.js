//-----------------------------------------------------------------------------
// client/src/ducks/__tests__/transactions/reducer.test.js
//-----------------------------------------------------------------------------
import { types, reducer }   from '../../transactions'

/**
 * Transactions Redux Reducer Tests
 */
describe('Transactions Reducer', () => {
  const transactions = {
    '90': { _id: '90', name: 'Shopping' },
    '91': { _id: '91', name: 'Dining' },
  }

  //
  // TEST: fetchTransactionsByAccountId
  //
  describe('fetchTransactionsByAccountId', () => {
    it('FETCH_TRANSACTIONS_BY_ACCOUNT_ID: Returns all the transactions', () => {
      
      const result = reducer({}, {
        type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
        payload:  {transactions: transactions},
      })

      expect(Object.keys(result.data).length).toBe(2)
      expect(result.data['90']._id).toBe(transactions['90']._id)
      expect(result.data['91'].name).toBe(transactions['91'].name)
    })

    it('FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR: Returns an error', () => {
      const error = {code: 404, message: 'Not found'}
      const result = reducer({}, {
        type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR,
        payload:  {error: error},
      })

      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })
  //
  // TEST: createTransaction
  //
  describe('createTransaction', () => {
    it('CREATES_TRANSACTION: Create a new transaction', () => {
      const transaction = { _id: '99', name: 'Entertainment' }
      const result      = reducer( {data: transactions, error: {}}, {
        type:     types.CREATE_TRANSACTION,
        payload:  {transaction: transaction}
      })

      expect(Object.keys(result.data).length).toBe(3)
      expect(result.data['99'].name).toBe(transaction.name)
    })

    it('CREATES_TRANSACTION_ERROR: Returns an error', () => {
      const error   = { code: 400, message: 'Bad request' }
      const result  = reducer( {data: transactions, error: {}}, {
        type:     types.CREATE_TRANSACTION_ERROR,
        payload:  {error: error}
      })

      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })
  describe('updateTransaction', () => {
    it('UPDATES_TRANSACTION: Update a transactions', () => {
      const initialState = {data: transactions, error: {}}
      const id           = '90'
      const transaction  = {
        ...transactions[id],
        name: 'Updated Name'
      }
      const result = reducer( initialState, {
        type:     types.UPDATE_TRANSACTION,
        payload:  {transaction: transaction}
      })

      expect(Object.keys(result.data).length).toBe(2)
      expect(result.data[id].name).toBe('Updated Name')
    })

    it('UPDATE_TRANSACTION_ERROR: Returns an error', () => {
      const error        = { code: 400, message: 'Bad request' }
      const initialState = { data: transactions, error: {} }
      const result  = reducer(initialState, {
        type:     types.UPDATE_TRANSACTION_ERROR,
        payload:  {error: error}
      })

      expect(result.error.code).toBe(error.code)
      expect(result.error.message).toBe(error.message)
    })
  })
})