//-----------------------------------------------------------------------------
// client/src/api/__tests__/transactions-api.test.js
//-----------------------------------------------------------------------------
import axiosMock        from 'axios'
import TransactionsAPI  from '../transactions-api'

jest.mock('axios')      // https://jestjs.io/docs/en/mock-functions#mocking-modules

// Mock account data
const accountsData = [
  { 
    _id:                '99', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            1000.00,
    asOfDate:           '2020-03-01T07:00:00.000Z',
    userId:             'Me'
  },
]

// Mock transaction data for an account
const transactionsData = [
  { 
    _id:          '1',
    date:         '2020-03-17T07:00:00.000Z',
    description:  'Expense Transaction One', 
    category:     'Groceries', 
    amount:       -100.00,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '2',
    date:         '2020-04-01T07:00:00.000Z',
    description:  'Expense Transaction Two', 
    category:     'Household', 
    amount:       -55.55,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '3',
    date:         '2020-04-04T07:00:00.000Z',
    description:  'Deposit Transaction', 
    category:     'Salary', 
    amount:       300.00,
    accountId:    '99',
    userId:       'Me'
  }
]

describe('Transactions API', () => {
  afterEach( () => {
    axiosMock.get.mockClear()
    axiosMock.post.mockClear()
    axiosMock.put.mockClear()
  })
  
  /**
   * TransactionsAPI.findByAccountId()
   */
  describe('findByAccountId', () => {
    it('Returns an array of transactions', async () => {
      axiosMock.get.mockResolvedValueOnce({
        data: { account: accountsData[0], transactions: transactionsData },
      })

      const {account, transactions} = await TransactionsAPI.findByAccountId(accountsData[0]._id)
      
      // Verify the account
      expect(account._id).toBe(accountsData[0]._id)
      expect(account.name).toBe(accountsData[0].name)
      expect(account.financialInstitute).toBe(accountsData[0].financialInstitute)
      expect(account.type).toBe(accountsData[0].type)
      expect(account.balance).toBe(accountsData[0].balance)
      expect(account.asOfDate).toBe(accountsData[0].asOfDate)
      expect(account.userId).toBe(accountsData[0].userId)

      // Verify the transactions
      let id = transactionsData[0]._id
      expect(Object.keys(transactions).length).toBe(3)
      expect(transactions[id].description).toBe(transactionsData[0].description)
      expect(transactions[id].amount).toBe(transactionsData[0].amount)
      expect(transactions[id].debit).toBe(transactionsData[0].amount)
      expect(transactions[id].credit).toBe('')

      id = transactionsData[2]._id
      expect(transactions[id].description).toBe(transactionsData[2].description)
      expect(transactions[id].amount).toBe(transactionsData[2].amount)
      expect(transactions[id].credit).toBe(transactionsData[2].amount)
      expect(transactions[id].debit).toBe('')
    })

    it('Returns 401 error for an expired token', async () => {
      // Fake error response for expired token
      const accountId = transactionsData[0].accountId
      const error     = {
        response: {
          status: 401,
          data:   {
            error: {
              code:     401,
              message:  'Expired token'
            }
          }
        }
      }

      // Add mock implementation to simulate a server error
      axiosMock.get.mockImplementationOnce(() =>
        Promise.reject(error),
      )

      try {
        const accounts = await TransactionsAPI.findByAccountId(accountId)
      }
      catch(err) {
        expect(err.code).toBe(401)
        expect(err.message).toMatch(/expired token/i)
      }
    })

    it('Returns 500 server error', async () => {
      const accountId = transactionsData[0].accountId
      const error     = {
        code:     500, 
        message:  `Failed to get transactions for account id=[${accountId}]`,
      }

      // Add mock implementation to simulate a server error
      axiosMock.get.mockImplementationOnce(() =>
        Promise.reject(error),
      )

      try {
        const transactions = await TransactionsAPI.findByAccountId(accountId)
      }
      catch(error) {
        expect(error.code).toBe(500)
        expect(error.message).toMatch(/Failed to get transactions/i)
      }
    })
  })

  /**
   * TransactionsAPI.create()
   */
  describe('create', () => {
    it('Creates a debit transaction', async () => {
      const accountId   = transactionsData[0].accountId
      const url         = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      const txnParams   = {
        date:         '2020-03-31T07:00:00.000Z',
        description:  'Transaction One', 
        category:     'Groceries', 
        amount:       -100.00
      }
      const newBalance  = accountsData[0].balance + txnParams.amount

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce( (url, txnParams) =>
        Promise.resolve({ data: {
          transaction: {...txnParams, _id: '99', accountId: accountId, userId: 'Me'},
          account:     {...accountsData[0], balance: newBalance}
        }})
      )

      let {transaction, account} = await TransactionsAPI.create(accountId, txnParams)

      expect(transaction.date).toBe('2020-03-31T07:00:00.000Z')
      expect(transaction.description).toMatch(/transaction on/i)
      expect(transaction.category).toBe('Groceries')
      expect(transaction.amount).toBe(-100)
      expect(transaction.debit).toBe(-100)
      expect(transaction.credit).toBe('')
      expect(transaction._id).toBe('99')
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe('Me')

      expect(account.balance).toBe(newBalance)
    })

    it('Creates a credit transaction', async () => {
      const accountId   = transactionsData[0].accountId
      const url         = `http://localhost:5000/api/v1/accounts/${accountId}/transactions`
      const txnParams   = {
        date:         '2020-03-31T07:00:00.000Z',
        description:  'Transaction Two', 
        category:     'Salary', 
        amount:       400.00
      }
      const newBalance  = accountsData[0].balance + txnParams.amount

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce( (url, params) =>
        Promise.resolve({ 
          data: {
            transaction: {...txnParams, _id: '99', accountId: accountId, userId: 'Me'},
            account:     {...accountsData[0], balance: newBalance}
        }})
      )

      let {transaction, account} = await TransactionsAPI.create(accountId, txnParams)

      expect(transaction.date).toBe('2020-03-31T07:00:00.000Z')
      expect(transaction.description).toMatch(/transaction two/i)
      expect(transaction.category).toBe(txnParams.category)
      expect(transaction.amount).toBe(txnParams.amount)
      expect(transaction.debit).toBe('')
      expect(transaction.credit).toBe(txnParams.amount)
      expect(transaction._id).toBe('99')
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe('Me')

      expect(account.balance).toBe(newBalance)
    })

    it('Returns 500 server error', async () => {
      const url     = 'http://localhost:5000/api/v1/accounts/xxx/transactions'
      const params  = {}

      const error = { code: 500, message: 'api message' }

      // Add mock implementation to simulate a server error
      axiosMock.post.mockImplementationOnce((url, params) =>
        Promise.reject(error),
      )

      try {
        const transaction = await TransactionsAPI.create(params)
      }
      catch(error) {
        expect(error.code).toBe(500)
        expect(error.message).toMatch(/failed to create transaction/i)
      }
    })
  })

  /**
   * TransactionsAPI.update()
   */
  describe('update', () => {
    it('Updates a transaction', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const txnId     = txn._id
      const url       = `http://localhost:5000/api/v1/accounts/${accountId}/transactions/${txnId}`
      const params    = {
        description: 'Updated Description',
        category:    'Dining',
        amount:      -888,
      }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce( (url, params) =>
        Promise.resolve({ 
          data: {
            transaction: { ...txn, ...params },
            account:     { ...accountsData[0], balance: 2000} 
          }
        }),
      )

      let {transaction, account} = await TransactionsAPI.update(accountId, txnId, params)

      expect(transaction.date).toBe(new Date(txn.date).toISOString())
      expect(transaction.description).toBe(params.description)
      expect(transaction.category).toBe(params.category)
      expect(transaction.amount).toBe(params.amount)
      expect(transaction._id).toBe(txn._id)
      expect(transaction.accountId).toBe(accountId)
      expect(transaction.userId).toBe(txn.userId)

      expect(account.balance).toBe(2000)    // Returns the updated account balance
    })

    it('Returns a 404 error for an invalid transaction id', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const badTxnId  = 'XXX'
      const baseUrl   = `http://localhost:5000/api/v1`
      const url       = `${baseUrl}/${accountId}/transactions/${badTxnId}`
      const params    = {}
      const error = {
        response: {
          status: 404,
          data:   {
            error: {
              code:     404,
              message:  'Not found'
            }
          }
        }
      }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce((url, params) =>
        Promise.reject(error),
      )

      try {
        let {transaction} = await TransactionsAPI.update(accountId, badTxnId, params)
        console.debug(`[debug]: transaction= `, transaction)
      }
      catch(err) {
        //* console.log(`[error] Failed to update txn= `, JSON.stringify(err, undefined, 2))
        expect(err.code).toBe(404)
        expect(err.message).toMatch(/not found/i)
      }
    })

    it('Returns a 400 error for invalid transaction parameters', async () => {
      const txn       = transactionsData[0]
      const accountId = txn.accountId
      const txnId     = txn._id
      const baseUrl   = `http://localhost:5000/api/v1`
      const url       = `${baseUrl}/accounts/${accountId}/transactions/${txnId}`
      const params    = {
        description:  '',
        amount:       'invalid-amount'
      }
      const error = {
        response: {
          status: 400,
          data:   {
            errors: [
              { code: 701, path: 'description', value: '', message: 'Description is required'},
              { code: 701, path: 'amount', value: 'invalid-amount', message: 'Amount is a number'},
            ]
          }
        }
      }

      // Add mock implementation to simulate a server error
      axiosMock.put.mockImplementationOnce( (url, params) =>
        Promise.reject(error)
      )

      try {
        let {transaction} = await TransactionsAPI.update(accountId, txnId, params)
      }
      catch(err) {
        //* console.log(`[error] MCD Failed to update txn= `, JSON.stringify(err, undefined, 2))

        expect(err['description'].code).toBe(701)
        expect(err['description'].field).toBe('description')
        expect(err['description'].message).toMatch(/description is required/i)

        expect(err['amount'].code).toBe(701)
        expect(err['amount'].field).toBe('amount')
        expect(err['amount'].message).toMatch(/amount is a number/i)
      }
    })
  })
})
