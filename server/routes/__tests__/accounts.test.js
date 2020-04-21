//-----------------------------------------------------------------------------
// server/routes/__tests__/accounts.test.js
//-----------------------------------------------------------------------------
const expect        = require('chai').expect
const request       = require('supertest')
const { ObjectID }  = require('mongodb')

const { app }       = require('../../../index')
const User          = require('../../models/user')
const Account       = require('../../models/account')
const Transaction   = require('../../models/transaction')

/*
 * Create accounts test data
 */
let usersData = [
  { _id: new ObjectID(), email: 'fergie@bills.com', phone: '415-694-2910' },
]

let accountsData = [
  { 
    _id:                new ObjectID(), 
    name:               "Test Checking Account",
    financialInstitute: 'USAA',
    type:               'Checking',
    balance:            500,
    userId:             usersData[0]._id,
  },
  { 
    _id:                new ObjectID(), 
    name:               "Test Savings Account",
    financialInstitute: 'NFCU',
    type:               'Savings',
    asOfDate:           new Date().toISOString(),
    userId:             usersData[0]._id,
  },
  { 
    _id:                new ObjectID(), 
    name:               "Test Credit Card",
    financialInstitute: 'Wells Fargo',
    type:               'Credit Card',
    balance:            750,
    asOfDate:           new Date().toISOString(),
    userId:             usersData[0]._id,
  }
]

beforeEach( async () => {
  try {
    await User.deleteMany({})
    let users   = await User.insertMany(usersData)

    await Account.deleteMany({})
    let results = await Account.insertMany(accountsData)

    await Transaction.deleteMany({})
  }
  catch(err) {
    console.log(`[ERROR] Failed to create account test data, err= `, err)
  }
})

describe('Accounts API', () => {
  /*
   * GET /api/v1/accounts
   */
  describe('GET /api/v1/accounts', () => {
    it('Returns all of the users accounts', (done) => {
      request(app)
        .get('/api/v1/accounts')
        .expect(200)
        .expect( (res) => {
          expect(res.body.accounts.length).to.equal(3)
        })
        .end(done)        
    })
  })

  /*
   * GET /api/v1/accounts/:id
   */
  describe('GET /api/v1/accounts/:id', () => {
    it('Returns the user\'s account w/ id', (done) => {
      let accountId = accountsData[0]._id

      request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.account.name).to.equal(accountsData[0].name)
          expect(res.body.account.userId).to.equal(accountsData[0].userId.toHexString())
        })
        .end(done)
    })

    it('Returns error for invalid account ID', (done) => {
      request(app)
        .get(`/api/v1/accounts/invalid-id`)
        .expect(404)
        .end(done)
    })

    it('Returns error for account that is not found', (done) => {
      let notFoundId = new ObjectID().toHexString()

      request(app)
        .get(`/api/v1/accounts/${notFoundId}`)
        .expect(404)
        .end(done)
    })
  })

  /*
   * POST /api/v1/accounts
   */
  describe('POST /api/v1/accounts', () => {
    it('Returns an error if required fields are blank', (done) => {
      let account   = {...accountsData[1]}
      delete(account.name)
      delete(account.financialInstitute)

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] post error response= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.errors.length).to.equal(2)
          expect(res.body.errors[0].code).to.equal(701)
          expect(res.body.errors[0].path).to.equal('name')
          expect(res.body.errors[0].type).to.equal('required')
          expect(res.body.errors[1].code).to.equal(701)
          expect(res.body.errors[1].path).to.equal('financialInstitute')
          expect(res.body.errors[1].type).to.equal('required')
        })
        .end(done)
    })

    it('Returns an error for invalid account type', (done) => {
      let account   = {...accountsData[1]}
      account.type  = 'Invalid-Account-Type'

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(400)
        .expect( (res) => {
          expect(res.body.errors.length).to.equal(1)
          expect(res.body.errors[0].code).to.equal(701)
          expect(res.body.errors[0].path).to.equal('type')
          expect(res.body.errors[0].type).to.equal('enum')
        })
        .end(done)
    })

    it('Returns an error for invalid balance', (done) => {
      let account     = {...accountsData[1]}
      account.balance = 'Invalid-Balance'

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] post error response= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.errors.length).to.equal(1)
          expect(res.body.errors[0].code).to.equal(701)
          expect(res.body.errors[0].path).to.equal('balance')
          expect(res.body.errors[0].type).to.equal('cast-error')
        })
        .end(done)
    })

    it('Returns an error for invalid asOfDate', (done) => {
      let account       = {...accountsData[1]}
      account.asOfDate  = 'Invalid-Date'

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] post error response= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.errors.length).to.equal(1)
          expect(res.body.errors[0].code).to.equal(701)
          expect(res.body.errors[0].path).to.equal('asOfDate')
          expect(res.body.errors[0].type).to.equal('cast-error')
        })
        .end(done)
    })

    it('Creates a Credit Card Account', (done) => {
      let account = {...accountsData[2]}

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(201)
        .expect( (res) => {
          expect(res.body.name).to.equal(account.name)
          expect(res.body.balance).to.equal(-1 * Math.abs(account.balance))
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }
          
          // Verify account and opening balance transaction are written to DB
          Account
            .findOne({_id: res.body._id, userId: account.userId})
            .then( (result) => {
              expect(result.name).to.equal(account.name)
              expect(result.type).to.equal(account.type)
              expect(result.financialInstitute).to.equal(account.financialInstitute)
              expect(result.balance).to.equal(-1 * Math.abs(account.balance))
              expect(result.asOfDate.toISOString()).to.equal(account.asOfDate)
            })
            .catch( (err) => done(err) )

          Transaction
            .findOne({accountId: res.body._id, userId: account.userId})
            .then( (result) => {
              expect(result.date.toISOString()).to.equal(account.asOfDate)
              expect(result.description).to.match(/Opening Balance/)
              expect(result.amount).to.equal(-1 * Math.abs(account.balance))
            })
            .catch( (err) => done(err) )
          
          done()
        })
    })

    it('Creates a Checking Account', (done) => {
      let account = {...accountsData[0]}

      request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(201)
        .expect( (res) => {
          expect(res.body.name).to.equal(account.name)
          expect(res.body.balance).to.equal(Math.abs(account.balance))
        })
        .end( (err, res) => {
          if(err) {
            return done(err)
          }

          /////////////////////////////////////////////////////////////////////
          // TODO: 04/10/2020
          // NEED TO CHECK THAT THE asOfDate IS EQUAL TO TODAY, SINCE I DO
          // NOT SET IT IN THE TEST DATA.
          /////////////////////////////////////////////////////////////////////
          
          // Verify account and opening balance transaction are written to DB
          Account
            .findOne({_id: res.body._id, userId: account.userId})
            .then( (result) => {
              expect(result.name).to.equal(account.name)
              expect(result.type).to.equal(account.type)
              expect(result.financialInstitute).to.equal(account.financialInstitute)
              expect(result.balance).to.equal(Math.abs(account.balance))
              expect(result.asOfDate.getTime()).to.be.lessThan(Date.now())
              expect(result.asOfDate.getTime()).to.be.greaterThan(Date.now() - 3600)
            })
            .catch( (err) => done(err) )

          Transaction
            .findOne({accountId: res.body._id, userId: account.userId})
            .then( (result) => {
              expect(result.date.getTime()).to.be.lessThan(Date.now())
              expect(result.date.getTime()).to.be.greaterThan(Date.now() - 3600)
              expect(result.description).to.match(/Opening Balance/)
              expect(result.amount).to.equal(Math.abs(account.balance))
            })
            .catch( (err) => done(err) )
          
          done()
        })
    })
  })

  /*
   * PUT /api/v1/accounts/:id
   */
  describe('PUT /api/v1/accounts/:id', () => {
    it('Returns a 404 status if the account is not found', (done) => {
      let id      = new ObjectID().toHexString()
      let update  = { name: 'ID Not Found' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(404)
        .end(done)
    })
    
    it('Returns an error if the account is invalid', (done) => {
      let id      = 'invalid-account-id'
      let update  = { name: 'Invalid Account ID' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(400)
        .end(done)
    })

    it('Returns error for an invalid account type', (done) => {
      let id      = accountsData[0]._id
      let update  = { type: 'INVALID ACCOUNT TYPE' }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(400)
        .end(done)
    })

    it('Ignores extra fields in the request body', (done) => {
      let id      = accountsData[0]._id
      let update  = { name: 'Extra Fields', extra: 'Lorem ipsum'}

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(update.name)
          expect(res.body.extra).to.equal(undefined)
        })
        .end(done)
    })

    it('Updates an account', (done) => {
      let id      = accountsData[0]._id
      let update  = {
        name:     'Updated Savings Account',
        type:     'Savings',
        balance:  2000,
      }

      request(app)
        .put(`/api/v1/accounts/${id}`)
        .send(update)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(update.name)
          expect(res.body.type).to.equal(update.type)
          expect(res.body.balance).to.equal(update.balance)
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          Account
            .findById(id)
            .then( (result) => {
              expect(result.name).to.equal(update.name)
              expect(result.type).to.equal(update.type)
              expect(result.initialBalance).to.equal(update.initialBalance)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })

  /*
   * DELETE /api/v1/accounts/:id
   */
  describe('DELETE /api/v1/accounts/:id', () => {
    it('Returns a 404 status if the account is not found', (done) => {
      let id = new ObjectID().toHexString()

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(404)
        .end(done)
    })

    it('Returns a 400 error if the account ID is invalid', (done) => {
      let id = 'invalid-account-id'

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(400)
        .end(done)
    })

    it('Removes an Account from the DB', (done) => {
      let id = accountsData[0]._id

      request(app)
        .delete(`/api/v1/accounts/${id}`)
        .expect(200)
        .expect( (res) => {
          expect(res.body.name).to.equal(accountsData[0].name)
          expect(res.body.userId).to.equal(accountsData[0].userId.toHexString())
        })
        .end( (err, res) => {
          if(err) { return done(err) }

          Account
            .findById(id)
            .then( (result) => {
              expect(result).to.equal(null)
              done()
            })
            .catch( (err) => done(err) )
        })
    })
  })
})
