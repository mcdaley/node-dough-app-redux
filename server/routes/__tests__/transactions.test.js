//-----------------------------------------------------------------------------
// server/routes/__tests__/transactions.test.js
//-----------------------------------------------------------------------------
const expect        = require('chai').expect
const request       = require('supertest')
const cookieParser  = require('cookie-parser')
const { ObjectID }  = require('mongodb')

const { app }       = require('../../../index')
const Transaction   = require('../../models/transaction')
const User          = require('../../models/user')
const Account       = require('../../models/account')

/*
 * Test Data for Transactions API
 */
let usersData = [
  { 
    _id:      new ObjectID(), 
    email:    'fergie@bills.com', 
    phone:    '415-694-2910',
    password: 'password123',
  },
]

let accountsData = [
  { 
    _id:                new ObjectID(), 
    name:               "Test Checking Account", 
    financialInstitute: 'USAA',
    type:               'Checking',
    openingBalance:     500,
    balance:            500,
    userId:             usersData[0]._id,
  },
  { 
    _id:                new ObjectID(), 
    name:               "Test Credit Card",
    financialInstitute: 'NFCU',
    type:               'Credit Card',
    openingBalance:     -1000,
    balance:            -1000,
    userId:             usersData[0]._id,
  }
]

let transactionsData = [
  {
    _id:            new ObjectID(),
    description:    'Target',
    date:           new Date('3/24/2020').toISOString(),
    charge:         'debit',
    amount:         -75.00,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Haystack Pizza',
    date:           new Date('3/17/2020').toISOString(),
    charge:         'debit',
    amount:         -45.00,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Whole Foods',
    date:           new Date('3/17/2020').toISOString(),
    amount:         0,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  },
  {
    _id:            new ObjectID(),
    description:    'Opening Balance',
    date:           new Date('3/01/2020').toISOString(),
    category:       'Balance',
    charge:         'credit',
    amount:         500,
    accountId:      accountsData[0]._id,
    userId:         accountsData[0].userId,
  }
]

/*
 * Transactions API Tests
 */
describe('Transactions API', () => {

  // Seed the test data
  beforeEach( async () => {
    try {
      await User.deleteMany({})
      let users = await User.insertMany(usersData)
  
      await Account.deleteMany({})
      let accounts = await Account.insertMany(accountsData)

      await Transaction.deleteMany({})
      let transactions = await Transaction.insertMany(transactionsData)
    }
    catch(err) {
      console.log(`[ERROR] Failed to create account test data, err= `, err)
    }
  })

  // Login the user and store the json web token
  let jwt           = null
  let credentials   = {email: usersData[0].email, password: usersData[0].password}
  let currentUser   = request.agent(app)

  beforeEach( function(done) {
    currentUser
      .post('/api/v1/login')
      .send(credentials)
      .expect(200)
      .end( (err, res) => {
        if(err) { return done(err) }

        //* console.log(`[DEBUG] Response Header = `, JSON.stringify(res.header, undefined, 2))
        jwt = res.header['authorization']
        done()
      })
  });
  
  /*
   * GET /api/v1/accounts/:accountId/transactions/:id
   */
  describe('GET /api/v1/accounts/:accountId/transactions/:id', () => {
    it('Returns 401 error for an unauthorized user', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(401)
        .expect( (res) => {
          //* console.log(`[debug] res.body= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.error.message).to.match(/not authorized/i)
        })
        .end(done)
    })

    it('Returns 404 for an invalid account Id', (done) => {
      let invalidAccountId  = 'bad-account-id'
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${invalidAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for account Id not in the DB', (done) => {
      let missingAccountId  = new ObjectID().toHexString()
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${missingAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for an invalid transaction Id', (done) => {
      let accountId     = accountsData[0]._id.toHexString()
      let invalidTxnId  = 'invalid-txn-id'

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${invalidTxnId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for transaction that is not in DB', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns array of transactions', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = transactionsData[1]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .set('Authorization', jwt)
        .expect(200)
        .expect( (res) => {
          let {transaction} = res.body
          expect(transaction.description).to.equal(transactionsData[1].description)
          expect(transaction.date).to.equal(transactionsData[1].date)
          expect(transaction.accountId).to.equal(transactionsData[1].accountId.toHexString())
          expect(transaction.userId).to.equal(usersData[0]._id.toHexString())
        })
        .end(done)
    })
  })

  /*
   * GET /api/v1/accounts/:accountId/transactions
   */
  describe('GET /api/v1/accounts/:accountId/transactions', () => {
    it('Returns 401 error for an unauthorized user', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(401)
        .expect( (res) => {
          //* console.log(`[debug] res.body= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.error.message).to.match(/not authorized/i)
        })
        .end(done)
    })

    it('Returns 404 for an invalid account ID', (done) => {
      let invalidAccountId = 'bad-account-id'

      request(app)
        .get(`/api/v1/accounts/${invalidAccountId}/transactions`)
        .set('Authorization', jwt)
        .expect(404)
        .expect( (res) => {
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Returns 404 for an account not in the DB', (done) => {
      let missingAccountId = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${missingAccountId}/transactions`)
        .set('Authorization', jwt)
        .expect(404)
        .expect( (res) => {
          expect(res.body.code).to.equal(404)
          expect(res.body.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Returns all transactions for an account', (done) => {
      let accountId = accountsData[0]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .expect(200)
        .expect( (res) => {
          expect(res.body.transactions.length).to.equal(4)
        })
        .end(done)
    })

    it('Calculates the running balance', (done) => {
      let accountId = accountsData[0]._id.toHexString()

      request(app)
        .get(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .expect(200)
        .expect( (res) => {
          let {transactions}  = res.body
          let runningBalances = [380, 455, 500, 500]

          expect(transactions.length).to.equal(4)
          for(let i = 0; i < transactions.length; ++i) {
            expect(transactions[i].balance).to.equal(runningBalances[i])
          }
        })
        .end(done)
    })
  })

  /*
   * POST /api/v1/accounts/:accountId/transactions
   */
  describe('POST /api/v1/accounts/:accountId/transactions', () => {
    const accountId   = accountsData[0]._id.toHexString()
    let   transaction = null
    
    beforeEach( () => {
      transaction = {
        _id:          new ObjectID().toHexString(),
        description:  'Test Transaction',
        amount:       -40.25,
        date:         new Date('3/20/2020').toISOString(),
        userId:       accountsData[0].userId.toHexString(),
      }
    })

    it('Returns 401 error for an unauthorized user', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(401)
        .expect( (res) => {
          //* console.log(`[debug] res.body= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.error.message).to.match(/not authorized/i)
        })
        .end(done)
    })

    it('Returns 400 error if the description is not defined', (done) =>{
      // Remove description from the transaction
      delete transaction.description
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(transaction)
        .expect(400)
        .end(done)
    })

    it('Returns 400 error for an invalid date', (done) => {
      transaction.date = 'invalid-date'

      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(transaction)
        .expect(400)
        .end(done)
    })

    it('Returns 404 error for an invalid accountId', (done) => {
      let badAccountId = 'BAD'

      request(app)
        .post(`/api/v1/accounts/${badAccountId}/transactions`)
        .set('Authorization', jwt)
        .send(transaction)
        .expect(404)
        .expect( (res) => {
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.equal('Account not found')
        })
        .end(done)
    })

    it('Returns 404 error if accountId is not found in DB', (done) => {
      let missingAccountId = new ObjectID().toHexString()

      request(app)
        .post(`/api/v1/accounts/${missingAccountId}/transactions`)
        .set('Authorization', jwt)
        .send(transaction)
        .expect(404)
        .expect( (res) => {
          //* console.log(`[debug] post error response= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.match(/Account not found/)
        })
        .end(done)
    })

    it('Returns 400 error if the description is blank', (done) => {
      let badTxn = {...transaction, description: ''}

      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(badTxn)
        .expect(400)
        .expect( (res) => {
          let error = res.body.errors[0]
          expect(error.code).to.equal(701)
          expect(error.path).to.equal('description')
          expect(error.type).to.equal('required')
          expect(error.value).to.equal('')
          expect(error.message).to.match(/description is required/i)
        })
        .end(done)
    })

    it('Returns 400 error for an invalid amount', (done) => {
      let badTxn = {...transaction, amount: 'invalid-amount'}

      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(badTxn)
        .expect(400)
        .expect( (res) => {
          let error = res.body.errors[0]
          expect(error.code).to.equal(701)
          expect(error.path).to.equal('amount')
          expect(error.value).to.equal(badTxn.amount)
          expect(error.message).to.match(/cast to number failed for value/i)
        })
        .end(done)
    })

    it('Creates a debit transaction and updates the account balance', (done) => {
      let account    = accountsData[0]
      let newBalance = account.balance + transaction.amount
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(transaction)
        .expect(201)
        .expect( (res) => {
          expect(res.body.transaction.description).to.equal(transaction.description)
          expect(res.body.transaction.amount).to.equal(transaction.amount)
          expect(res.body.transaction.accountId).to.equal(accountId)
          expect(res.body.transaction.date).to.equal(transaction.date)
          expect(res.body.transaction.userId).to.equal(transaction.userId)

          expect(res.body.account._id).to.equal(accountId)
          expect(res.body.account.balance).to.equal(newBalance)
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          Transaction
            .findOne({
              description:  transaction.description, 
              accountId:    accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(transaction.description)
              expect(result.amount).to.equal(transaction.amount)
              expect(result.date.toISOString()).to.equal(transaction.date)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(transaction.userId)
            })
            .catch( (err) => done(err) )

          // Verify account and opening balance transaction are written to DB
          Account
            .findOne({_id: accountId})
            .then( (result) => {
              expect(result.name).to.equal(account.name)
              expect(result.type).to.equal(account.type)
              expect(result.openingBalance).to.equal(account.openingBalance)
              expect(result.balance).to.equal(newBalance)
            })
            .catch( (err) => done(err) )

          done()
        })
    })

    it('Creates a credit transaction and updates the balance', (done) => {
      let account     = accountsData[1]
      let accountId   = account._id.toHexString()
      let creditTxn   = {
        _id:            new ObjectID().toHexString(),
        description:    'Test Credit Transaction',
        amount:         75,
        date:           new Date('3/20/2020').toISOString(),
        userId:         account.userId.toHexString(),
      }
      let newBalance  = account.balance + creditTxn.amount
      
      request(app)
        .post(`/api/v1/accounts/${accountId}/transactions`)
        .set('Authorization', jwt)
        .send(creditTxn)
        .expect(201)
        .expect( (res) => {
          expect(res.body.transaction.description).to.equal(creditTxn.description)
          expect(res.body.transaction.amount).to.equal(creditTxn.amount)
          expect(res.body.transaction.accountId).to.equal(accountId)
          expect(res.body.transaction.date).to.equal(creditTxn.date)
          expect(res.body.transaction.userId).to.equal(creditTxn.userId)

          expect(res.body.account._id).to.equal(accountId)
          expect(res.body.account.balance).to.equal(newBalance)
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }

          Transaction
            .findOne({
              description:  creditTxn.description, 
              accountId:    accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(creditTxn.description)
              expect(result.amount).to.equal(creditTxn.amount)
              expect(result.date.toISOString()).to.equal(creditTxn.date)
              expect(result.accountId.toHexString()).to.equal(accountId)
              expect(result.userId.toHexString()).to.equal(creditTxn.userId)
            })
            .catch( (err) => done(err) )

          // Verify account and opening balance transaction are written to DB
          Account
            .findOne({_id: accountId})
            .then( (result) => {
              expect(result.name).to.equal(account.name)
              expect(result.type).to.equal(account.type)
              expect(result.openingBalance).to.equal(account.openingBalance)
              expect(result.balance).to.equal(newBalance)
              
            })
            .catch( (err) => done(err) )

          done()
        })
    }) 
  })

  /*
   * PUT /api/v1/accounts/:accountId/transactions/:id
   */
  describe('PUT /api/v1/accounts/:accountId/transactions/:id', () => {
    it('Returns 401 error for an unauthorized user', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(401)
        .expect( (res) => {
          //* console.log(`[debug] res.body= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.error.message).to.match(/not authorized/i)
        })
        .end(done)
    })

    it('Returns 404 error for an invalid accountId', (done) => {
      let badAccountId  = 'BAD'
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = {
        description: 'Invalid accountID'
      }

      request(app)
        .put(`/api/v1/accounts/${badAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(404)
        .expect( (res) => {
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.equal('Transaction not found')
        })
        .end(done)
    })

    it('Returns 404 error for a missing accountId', (done) => {
      let badAccountId  = new ObjectID().toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = {
        description: 'Missing accountID'
      }

      request(app)
        .put(`/api/v1/accounts/${badAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(404)
        .expect( (res) => {
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.equal('Transaction not found')
        })
        .end(done)
    })

    it('Returns 404 error for an invalid transactionId', (done) => {
      let transactionId = 'invalid-transaction-id'
      let accountId     = accountsData[0]._id.toHexString()
      let update        = {
        description: 'Invalid transactionId'
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(404)
        .expect( (res) => {
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.equal('Transaction not found')
        })
        .end(done)
    })

    it('Returns 404 error for a missing transactionId', (done) => {
      let transactionId = new ObjectID().toHexString()
      let accountId     = accountsData[0]._id.toHexString()
      let update        = {
        description: 'Missing transactionId'
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(404)
        .expect( (res) => {
          expect(res.body.errors.code).to.equal(404)
          expect(res.body.errors.message).to.equal('Transaction not found')
        })
        .end(done)
    })

    it('Returns 400 error if the description is blank', (done) => {
      let accountId     = transactionsData[1].accountId.toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = {
        description: '',
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(400)
        .expect( (res) => {
          let error = res.body.errors[0]
          expect(error.code).to.equal(701)
          expect(error.path).to.equal('description')
          expect(error.type).to.equal('required')
          expect(error.value).to.equal('')
          expect(error.message).to.match(/description is required/i)
        })
        .end(done)
    })

    it('Returns 400 error for an invalid date', (done) => {
      let accountId     = transactionsData[1].accountId.toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = {
        date: 'invalid-date',
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(400)
        .expect( (res) => {
          let error = res.body.errors[0]
          expect(error.code).to.equal(701)
          expect(error.path).to.equal('date')
          expect(error.type).to.equal('cast-error')
          expect(error.value).to.equal(update.date)
          expect(error.message).to.match(/cast to date failed/i)
        })
        .end(done)
    })

    it('Returns 400 error for an invalid amount', (done) => {
      let accountId     = transactionsData[1].accountId.toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = { amount: 'invalid-amount' }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(400)
        .expect( (res) => {
          let error = res.body.errors[0]
          expect(error.code).to.equal(701)
          expect(error.path).to.equal('amount')
          expect(error.value).to.equal(update.amount)
          expect(error.message).to.match(/cast to number failed for value/i)
        })
        .end(done)
    })

    it('Forbids updates to change the accountId and the userId', (done) => {
      let accountId     = transactionsData[1].accountId.toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = { 
        description:  'Security Test',
        amount:       -2500.00,
        accountId:    new ObjectID().toHexString(),
        userId:       new ObjectID().toHexString(),
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(200)
        .expect( (res) => {
          let {transaction} = res.body
          expect(transaction.description).to.equal(update.description)
          expect(transaction.amount).to.equal(update.amount)
          expect(transaction.accountId).to.equal(accountId)
          expect(transaction.userId).to.not.equal(update.userId)
        })
        .end(done)
    })

    it('Updates transaction amount and account balance', (done) => {
      // Expect account balance to change from 500.00 to 445.00
      let accountId     = transactionsData[1].accountId.toHexString()
      let transactionId = transactionsData[1]._id.toHexString()
      let update        = { 
        date:         new Date('3/17/2020').toISOString(),
        description:  'Updated transaction',
        category:     'Category',
        amount:       -100.00,
      }

      request(app)
        .put(`/api/v1/accounts/${accountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .send(update)
        .expect(200)
        .expect( (res) => {
          let {transaction, account} = res.body
          expect(transaction.date).to.equal(update.date)
          expect(transaction.description).to.equal(update.description)
          expect(transaction.category).to.equal(update.category)
          expect(transaction.amount).to.equal(update.amount)
          expect(transaction.accountId).to.equal(accountId)

          expect(account.balance).to.equal(445.00)
          expect(account._id).to.equal(accountId)
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          let {transaction, account} = res.body
          Transaction
            .findOne({
              _id:        transaction._id, 
              accountId:  transaction.accountId
            })
            .then( (result) => {
              expect(result.description).to.equal(update.description)
              expect(result.amount).to.equal(update.amount)
              expect(result.date.toISOString()).to.equal(update.date)
              expect(result.accountId.toHexString()).to.equal(transaction.accountId)
              expect(result.userId.toHexString()).to.equal(transaction.userId)
            })
            .catch( (err) => done(err) )

            Account
              .findOne({
                _id:  account._id,
              })
              .then( (result) => {
                expect(result.balance).to.equal(445.00)
              })
              .catch((err) => done(err) )
            done()
        })
    })
    
  })

  /*
   * DELETE /api/v1/accounts/:accountId/transactions/:id
   */
  describe('DELETE /api/v1/accounts/:accountId/transactions/:id', () => {
    it('Returns 401 error for an unauthorized user', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(401)
        .expect( (res) => {
          //* console.log(`[debug] res.body= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.error.message).to.match(/not authorized/i)
        })
        .end(done)
    })

    it('Returns 404 for an invalid account Id', (done) => {
      let invalidAccountId  = 'bad-account-id'
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${invalidAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for account Id not in the DB', (done) => {
      let missingAccountId  = new ObjectID().toHexString()
      let transactionId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${missingAccountId}/transactions/${transactionId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for an invalid transaction Id', (done) => {
      let accountId     = accountsData[0]._id.toHexString()
      let invalidTxnId  = 'invalid-txn-id'

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${invalidTxnId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Returns 404 for transaction that is not in DB', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = new ObjectID().toHexString()

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .set('Authorization', jwt)
        .expect(404)
        .end(done)
    })

    it('Deletes a transaction', (done) => {
      let accountId = accountsData[0]._id.toHexString()
      let txnId     = transactionsData[1]._id.toHexString()

      request(app)
        .delete(`/api/v1/accounts/${accountId}/transactions/${txnId}`)
        .set('Authorization', jwt)
        .expect(200)
        .expect( (res) => {
          let txn = res.body.transaction
          expect(txn.description).to.equal(transactionsData[1].description)
          expect(txn.userId).to.equal(transactionsData[1].userId.toHexString())
          expect(txn.accountId).to.equal(transactionsData[1].accountId.toHexString())
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          //* console.log(`[DEBUG] res.body= `, JSON.stringify(res.body, undefined, 2))
          Transaction
            .findById(res.body.transaction._id)
            .then( (result) => {
              expect(result).to.equal(null)
              done()
            })
            .catch( (err) => done )
        })
    })
  })
})
