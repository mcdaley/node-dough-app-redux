//-----------------------------------------------------------------------------
// server/models/__tests__/account.test.js
//-----------------------------------------------------------------------------
const mongoose      = require('../../db/mongoose')
const expect        = require('chai').expect
const { ObjectID }  = require('mongodb')

const Account       = require('../account')
const User          = require('../user')

/*
 * Create accounts test data
 */
let usersData = [
  { _id: new ObjectID(), email: 'fergie@bills.com', phone: '415-694-2910' },
]

let accountsData = [
  { 
    _id:                new ObjectID(), 
    name:               "Fergie Checking Account",
    financialInstitute: "Bank of America",
    balance:            500,
    userId:             usersData[0]._id,
  },
  { 
    _id:                new ObjectID(), 
    name:               "Joe's Savings Account",
    financialInstitute: "USAA",
    type:               'Savings',
    userId:             usersData[0]._id,
  }
]

/**
 * Account Model Unit Tests
 */
describe('Account', () => {

  // Test account validation rules
  describe('Validation rules', () => {
    const user = new User({_id: new ObjectID(), email: 'fergie@bills.com'})

    it('Requires a name', () => {
      let account = new Account()

      account.validate( (err) => {
        expect(err.errors.name).to.exist
        expect(err.errors.name.message).to.match(/name is required/)
      })
    })

    it('Requires a correct account type', () => {
      let account = new Account({name: 'My Checking', type: 'Bad'})

      account.validate( (err) => {
        expect(err.errors.type).to.exist
        expect(err.errors.type).to.match(/not a valid enum value/)
      })
    })

    it('Requires a financial institute', () => {
      let account = new Account({
        name:   'Missing FI', 
        userId: user._id.toHexString()
      })

      account.validate( (err) => {
        expect(err.errors.financialInstitute).to.exist
        expect(err.errors.financialInstitute.message).to.match(/Financial Institute is required/)
      })
    })

    it('Requires a number for the initial balance', () => {
      let account = new Account({name: 'My Checking', balance: 'Bad'})

      account.validate( (err) => {
        expect(err.errors.balance).to.exist
        expect(err.errors.balance).to.match(/Cast to Number failed/)
      })
    })

    it('Requires an account owner (i.e., userId)', () => {
      let account = new Account({
        name:     'My Checking', 
        balance:  '100'
      })

      account.validate( (err) => {
        expect(err.errors.userId).to.exist
        expect(err.errors.userId.message).to.match(/\`userId\` is required/)
      })
    }) 

    it('Validates a correct account', () => {
      let account = new Account({
        name:               'My Checking',
        financialInstitute: 'NFCU',
        type:               'Checking', 
        balance:            500.00,
        userId:             user._id,
      })

      account.validate( (err) => {
        expect(err).to.not.exist
      })
    })
  })

  //
  // SELECT Account(s) Tests
  //
  describe('Query Accounts', () => {
    beforeEach( async () => {
      await User.deleteMany({})
      await User.insertMany(usersData)
      await Account.deleteMany({})
      await Account.insertMany(accountsData)
    })

    describe('Select single account', () => {
      it('Returns the account', async () => {
        let account = await Account.findById(accountsData[0]._id)
        expect(account.name).to.equal(accountsData[0].name)
        expect(account.balance).to.equal(500)
        expect(account.userId.toHexString()).to.equal(usersData[0]._id.toHexString())
      })

      it('Returns an error for an invalid account id', async () => {
        try {
          let account = await Account.findById('abcd')
        }
        catch(err) {
          expect(err).to.exist
        }
      })

      it('Returns null for an id that is not found', async () => {
        let account = await Account.findById(new ObjectID().toHexString())
        expect(account).to.equal(null)
      })
    })
  })

  //
  // SAVE Account Tests
  //
  describe('Save account to DB', () => {
    
    // Clear out the DB and seed the database w/ a user
    const users = [new User({_id: new ObjectID(), email: 'fergie@bills.com'})]
    
    beforeEach( async function() {
      await User.deleteMany({})
      await User.insertMany(users)
      await Account.deleteMany({})
    })

    it('Fails to save an invalid account to the DB', (done) => {
      let badAccount = new Account()

      badAccount.save( (err) => {
        expect(err).to.exist
        expect(err.errors.name).to.exist
        expect(err.errors.name.message).to.match(/[Nn]ame is required/)
        done()
      })
    })
    
    it('Saves valid account to the DB', (done) => {
      let account = new Account({ 
        name:               'My Checkiing', 
        financialInstitute: 'NFCU',
        type:               'Checking', 
        balance:            500.00,
        userId:             users[0]._id,
      })

      account.save( function(err) {
        expect(err).to.not.exist
        done()
      })
    })

    it('Saves valid account and sets the default values', (done) => {
      let account = new Account({
        name:               'Test Checking',
        financialInstitute: 'Wells Fargo',
        userId:             users[0]._id,
      })

      account
        .save()
        .then( () => {
          Account.findOne({name: 'Test Checking'})
            .then( (result) => {
              expect(result.name).to.equal('Test Checking')
              expect(result.financialInstitute).to.equal('Wells Fargo')
              expect(result.type).to.equal('Checking')
              expect(result.balance).to.equal(0)
              expect(result.userId.toHexString()).to.equal(users[0]._id.toHexString())
              done()
            })
            .catch( (err) => done(err))
        })
        .catch( (err) => done(err) )
    })

    it('Saves valid account w/ parameters', (done) => {
      let account = new Account({
        name:               'Test Savings',
        financialInstitute: '5/3 Bank',
        type:               'Savings',
        balance:            1000,
        userId:             users[0]._id,
      })

      account
        .save()
        .then( () => {
          Account.findOne({name: 'Test Savings'})
            .then( (result) => {
              expect(result.name).to.equal('Test Savings')
              expect(result.type).to.equal('Savings')
              expect(result.financialInstitute).to.equal('5/3 Bank')
              expect(result.balance).to.equal(1000)
              done()
            })
            .catch( (err) => done(err))
        })
        .catch( (err) => done(err))
    })
  })

  //
  // UPDATE Account Tests
  //
  describe('Update account', () => {
    
    beforeEach( async () => {
      await User.deleteMany({})
      await User.insertMany(usersData)
      await Account.deleteMany({})
      await Account.insertMany(accountsData)
    })

    it('Finds account by id and updates it', async () => {
      let query   = { _id: accountsData[0]._id }
      let update  = { name: 'Update Account Test', balance: 25.0 }
      let options = { new: true }

      let result  = await Account.findOneAndUpdate(query, update, options)

      expect(result.name).to.equal(update.name)
      expect(result.balance).to.equal(update.balance)
    })

    it('Returns null for account id that is not found', async () => {
      let query   = { _id: new ObjectID().toHexString() }
      let update  = { name: 'Update Test Account' }
      let options = { new: true }

      let result  = await Account.findOneAndUpdate(query, update, options)
      expect(result).to.equal(null)
    })

    it('Returns an error for an invalid account id', async () => {
      let query   = { _id: 'invalid-id' }
      let update  = { name: 'Update Test Account' }
      let options = { new: true }

      try {
        let result  = await Account.findOneAndUpdate(query, update, options)
      }
      catch( err ) {
        expect(err).to.exist
      }
    })

    it('Returns an error for an invalid account type', async () => {
      let query   = { _id: accountsData[0]._id }
      let update  = { type: 'INVALID ACCOUNT TYPE' }
      let options = { new: true, runValidators: true }

      try {
        let result  = await Account.findOneAndUpdate(query, update, options)
      }
      catch( err ) {
        expect(err).to.exist
      }
    })
  })

  //
  // DELETE Account Tests
  //
  describe('Delete Account', () => {
    beforeEach( async () => {
      await User.deleteMany({})
      await User.insertMany(usersData)
      await Account.deleteMany({})
      await Account.insertMany(accountsData)
    })

    it('Deletes an account', async () => {
      let id  = accountsData[0]._id

      let result  = await Account.findByIdAndRemove(id)
      let query   = await Account.findById(id)

      expect(query).to.equal(null)
      expect(result.name).to.equal(accountsData[0].name)
      expect(result.initialBalance).to.equal(accountsData[0].initialBalance)
    })

    it('Returns null if the ID is not found', async () => {
      let id     = new ObjectID().toHexString()
      let result = await Account.findByIdAndRemove(id)

      expect(result).to.equal(null)
    })

    it('Returns an arror for an invalid id', async () => {
      try {
        let id      = 'invalid-account-id'
        let result  = await Account.findByIdAndRemove(id)
      }
      catch(err) {
        expect(err).to.exist
      }
    })
  })
})

// Close the connection
after( function(done) {
  mongoose.connection.close(done)
})