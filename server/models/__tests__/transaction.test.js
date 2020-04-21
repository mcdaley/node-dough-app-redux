//-----------------------------------------------------------------------------
// server/models/__tests__/transaction.test.js
//-----------------------------------------------------------------------------
const mongoose      = require('../../db/mongoose')
const expect        = require('chai').expect
const { ObjectID }  = require('mongodb')

const Transaction   = require('../transaction')
const Account       = require('../account')
const User          = require('../user')

/*
 * Transaction model tests
 */
describe('Transaction', () => {
  
  //
  // Transaction validation rules
  //
  describe('Validation rules', () => {
    // Create user and account models required for validation tests
    const user    = new User({
      _id:                new ObjectID(), 
      email:              'fergie@bills.com'
    })
    const account = new Account({
      _id:                new ObjectID(), 
      name:               'Validation Account',
      financialInstitute: 'Test Bank',
      type:               'Checking',
    })

    it('Requires a description', () => {
      let transaction = new Transaction({
        description:  '',
      })

      transaction.validate( (err) => {
        expect(err.errors.description).to.exist
        expect(err.errors.description.message).to.match(/description is required/i)
      })
    })

    it('Requires an account ID', () => {
      let transaction = new Transaction({ 
        description:  'Missing Account ID',
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err.errors.accountId).to.exist
        expect(err.errors.accountId.message).to.match(/Account is required/)
      })
    })

    it('Requires a user ID (i.e., account owner)', () => {
      let transaction = new Transaction({
        description:  'Missing User ID',
        accountId:    account._id,
      })

      transaction.validate( (err) => {
        expect(err.errors.userId).to.exist
        expect(err.errors.userId.message).to.match(/User is required/)
      })
    })

    it('Validates a transaction w/ minimum fields', () => {
      let transaction = new Transaction({
        description:  'Valid transaction',
        accountId:    account._id,
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err).to.not.exist
      })
    })

    it('Validates a transaction w/ all fields', () => {
      let transaction = new Transaction({
        description:  'Valid transaction',
        category:     'Groceries',
        amount:       50.00,
        accountId:    account._id,
        userId:       user._id,
      })

      transaction.validate( (err) => {
        expect(err).to.not.exist
      })
    })
  })

  //
  // CRUD DB Operations
  //
  describe('CRUD operations', () => {
    /*
     * Test Data for Transactions CRUD Operations
     */
    let usersData = [
      { 
        _id:    new ObjectID(), 
        email:  'fergie@bills.com', 
        phone:  '415-694-2910' 
      },
    ]

    let accountsData = [
      { 
        _id:                new ObjectID(), 
        name:               "Test Checking Account", 
        financialInstitute: 'USAA',
        balance:            500,
        userId:             usersData[0]._id,
      },
    ]

    let transactionsData = [
      {
        _id:            new ObjectID(),
        description:    'Target',
        date:           new Date('3/24/2020').toISOString(),
        amount:         -75.00,
        accountId:      accountsData[0]._id,
        userId:         accountsData[0].userId,
      },
      {
        _id:            new ObjectID(),
        description:    'Haystack Pizza',
        date:           new Date('3/17/2020').toISOString(),
        amount:         -45.00,
        accountId:      accountsData[0]._id,
        userId:         accountsData[0].userId,
      },
      {
        _id:            new ObjectID(),
        description:    'Opening Balance',
        date:           new Date('3/01/2020').toISOString(),
        category:       'Balance',
        amount:         500,
        accountId:      accountsData[0]._id,
        userId:         accountsData[0].userId,
      }
    ]

    beforeEach( async () => {
      await User.deleteMany({});        await User.insertMany(usersData)
      await Account.deleteMany({});     await Account.insertMany(accountsData)
      await Transaction.deleteMany({}); await Transaction.insertMany(transactionsData)
    })

    /*
     * Transaction.find()
     */
    describe('find', () => {
      describe('findByAccountId', () => {
        it('Returns all the transactions for an account', async () => {
          let query        = { accountId: accountsData[0]._id.toHexString() }
          let transactions = await Transaction.find(query)
          expect(transactions.length).to.equal(3)
        })

        it('Returns [] for account with zero transactions', async () => {
          let query        = { accountId: new ObjectID().toHexString() }
          let transactions = await Transaction.find(query)
          expect(transactions.length).to.equal(0)
        })

        it('Returns an error for an invalid accountId', async () => {
          try {
            let query        = { accountId: 'invalid-account-id' }
            let transactions = await Transaction.find(query)
          }
          catch(err) {
            expect(err).to.exist
            expect(err.name).to.equal('CastError')
            expect(err.path).to.equal('accountId')
            expect(err.value).to.equal('invalid-account-id')
            expect(err.message).to.match(/cast to objectid failed/i)
          }
        })
      })

      describe('findByUserId', () => {
        it('Returns all the transactions for an account', async () => {
          let query        = { accountId: accountsData[0]._id.toHexString() }
          let transactions = await Transaction.find(query)
          expect(transactions.length).to.equal(3)
        })

        it('Returns [] for an user with zero transacions', async () => {
          let query        = { accountId: new ObjectID().toHexString() }
          let transactions = await Transaction.find(query)
          expect(transactions.length).to.equal(0)
        })

        it('Returns an error for an invalid userId', async () => {
          try {
            let query        = { userId: 'invalid-user-id' }
            let transactions = await Transaction.find(query)
          }
          catch(err) {
            expect(err).to.exist
            expect(err.name).to.equal('CastError')
            expect(err.path).to.equal('userId')
            expect(err.value).to.equal('invalid-user-id')
            expect(err.message).to.match(/cast to objectid failed/i)
          }
        })
      })
    })

    /*
     * Transaction.save()
     */
    describe('save', () => {
      it('Returns an error when missing required fields', async () => {
        let badTransaction = Transaction()

        try {
          await badTransaction.save()
        }
        catch(err) {
          expect(err).to.exist
          
          expect(err.errors.description).to.exist
          expect(err.errors.description.message).to.match(/description is required/i)

          expect(err.errors.accountId).to.exist
          expect(err.errors.accountId.message).to.match(/account is required/i)

          expect(err.errors.userId).to.exist
          expect(err.errors.userId.message).to.match(/user is required/i)
        }
      })
    })

    /*
     * Transaction.findOneAndUpdate()
     */
    describe('findOneAndUpdate', () => {
      it('Returns null when transaction Id is NOT found', async () => {
        let query   = { _id:    new ObjectID().toHexString() }
        let update  = { amount: 500 }
        let options = { new:    true }
        
        let result  = await Transaction.findOneAndUpdate(query, update, options)
        expect(result).to.equal(null)
      })

      it('Returns null when account Id is NOT found', async () => {
        let query   = { 
          _id:        transactionsData[0]._id.toHexString(), 
          accountId:  new ObjectID().toHexString()
        }
        let update  = { amount: 500 }
        let options = { new:    true }
        
        let result  = await Transaction.findOneAndUpdate(query, update, options)
        expect(result).to.equal(null)
      })

      it('Returns null when user Id is NOT found', async () => {
        let query   = { 
          _id:        transactionsData[0]._id.toHexString(), 
          accountId:  transactionsData[0].accountId.toHexString(),
          userId:     new ObjectID().toHexString()
        }
        let update  = { amount: 500 }
        let options = { new:    true }
        
        let result  = await Transaction.findOneAndUpdate(query, update, options)
        expect(result).to.equal(null)
      })

      it('Returns an error for an invalid transaction id', async () => {
        let query   = { _id:    'invalid-id' }
        let update  = { amount: 500 }
        let options = { new:    true }
  
        try {
          let result  = await Account.findOneAndUpdate(query, update, options)
        }
        catch( err ) {
          expect(err).to.exist
          expect(err.name).to.equal('CastError')
          expect(err.path).to.equal('_id')
          expect(err.value).to.equal(query._id)
          expect(err.message).to.match(/Cast to ObjectID failed/i)
        }
      })

      it('Finds and updates the transaction', async () => {
        let query = { 
          _id:        transactionsData[0]._id.toHexString(),  
          accountId:  transactionsData[0].accountId.toHexString(),
        }
        let update = { 
          description:    'Updated description',
          date:           new Date('4/12/2020').toISOString(),
          amount:         200,
        }
        let options = { new: true }

        let result  = await Transaction.findOneAndUpdate(query, update, options)
        expect(result.date.toISOString()).to.equal(update.date)
        expect(result.description).to.equal(update.description)
        expect(result.amount).to.equal(update.amount)
      })
    })
  })
})