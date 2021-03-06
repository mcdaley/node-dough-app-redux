//-----------------------------------------------------------------------------
// client/src/ducks/__tests__/transactions/actions.test.js
//-----------------------------------------------------------------------------
import { types, actions }   from '../../transactions'

import transactionsApiMock  from '../../../api/transactions-api'
jest.mock('../../../api/transactions-api')

import accountsApiMock      from '../../../api/accounts-api'
jest.mock('../../../api/accounts-api')

// Mock account data
const accountsData = {
  '99': { 
    _id:                '99', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            1000.00,
    asOfDate:           '2020-03-01T07:00:00.000Z',
    userId:             'Me'
  },
}

// Mock transaction data for an account
const transactionsData = {
  '1': { 
    _id:          '1',
    date:         '2020-03-17T07:00:00.000Z',
    description:  'Expense Transaction One', 
    category:     'Groceries', 
    amount:       -100.00,
    accountId:    '99',
    userId:       'Me'
  },
  '2': { 
    _id:          '2',
    date:         '2020-04-01T07:00:00.000Z',
    description:  'Expense Transaction Two', 
    category:     'Household', 
    amount:       -55.55,
    accountId:    '99',
    userId:       'Me'
  },
  '3': { 
    _id:          '3',
    date:         '2020-04-04T07:00:00.000Z',
    description:  'Deposit Transaction', 
    category:     'Salary', 
    amount:       300.00,
    accountId:    '99',
    userId:       'Me'
  }
}

/**
 * Transactions Redux Actions
 */
describe('Transactions Redux Actions', () => {
  //
  // TEST actions.fetchTransactionsByAccountId()
  //
  describe('fetchTransactionsByAccountId', () => { 
    it('Dispatches FETCH_TRANSACTIONS_BY_ACCOUNT_ID', async () => {
      const dispatch = jest.fn()
      
      const account  = { _id: '99', name: 'Test Checking Account' }
      const response = {
        transactions: transactionsData,
      }
      transactionsApiMock.findByAccountId.mockResolvedValueOnce(response)
      accountsApiMock.find.mockResolvedValueOnce(account)

      await actions.fetchTransactionsByAccountId()(dispatch)
      
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
        payload:  {
          transactions: response.transactions,
          account:      account,
        }
      })
    })
    
    it('Dispatches FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR', async () => {
      const dispatch = jest.fn()
      
      // Mock the fetch call by passing in an array of accountsData
      const error = {code: 500, message: 'Server error'}
      transactionsApiMock.findByAccountId.mockRejectedValueOnce(error)

      await actions.fetchTransactionsByAccountId()(dispatch)
      
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR,
        payload:  {error: error},
      })
    }) 
  })
  //
  // TEST actions.createTransaction()
  //
  describe('createTransaction', () => {
    it('Dispatches CREATE_TRANSACTION', async () => {
      const dispatch = jest.fn()

      transactionsApiMock.create.mockResolvedValueOnce({
        transaction:  transactionsData['3'],
        account:      accountsData['99'],
      })

      await actions.createTransaction()(dispatch)

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.CREATE_TRANSACTION,
        payload:  {
          transaction:  transactionsData['3'],
          account:      accountsData['99'],
        }
      })
    })
  })
  //
  // TEST actions.updateTransactions
  //
  describe('updateTransaction', () => {
    it('Dispatchs UPDATE_TRANSACTION', async () =>{
      const dispatch       = jest.fn()
      const updatedTxn     = {
        ...transactionsData['2'],
        description:  'Updated Expense', 
        category:     'Dining', 
        amount:       -25.0
      }
      const updatedAccount = {...accountsData['99'], balance: 375.00}
      const response       = {
        transaction:  updatedTxn,
        account:      updatedAccount,
      }
      transactionsApiMock.update.mockResolvedValueOnce(response)

      await actions.updateTransaction()(dispatch)

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:       types.UPDATE_TRANSACTION,
        payload:    {
          transaction:  updatedTxn, 
          account:      updatedAccount
        }
      })
    })
  })
})
