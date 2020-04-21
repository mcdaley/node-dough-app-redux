//-----------------------------------------------------------------------------
// server/models/__tests__/user.test.js
//-----------------------------------------------------------------------------
const mongoose  = require('../../db/mongoose')
const expect    = require('chai').expect

const User      = require('../user')

/**
 * User model tests
 */
describe('User', () => {
  describe('Validations', () => {
    it('Requires an email', () => {
      let user = new User()

      user.validate( (err) => {
        expect(err.errors.email).to.exist
        expect(err.errors.email.message).to.equal('User email is required')
      })
    })

    it('Requires a valid phone number', () => {
      let user = new User({email: 'marv@bills.com', phone: '911'})

      user.validate( (err) => {
        expect(err.errors.phone).to.exist
        expect(err.errors.phone.message).to.equal('911 is not a valid phone number')
      })
    })
  })

  describe('Saves to DB', () => {
    // Clear users from the DB    
    beforeEach( async function() {
      await User.deleteMany({})
    })

    it('Fails to save an invalid user to DB', (done) => {
      let badUser = new User()

      badUser.save( function(err) {
        expect(err.errors.email).to.exist
        expect(err.errors.email.message).to.match(/email is required/)
        done()
      })
    })

    it('Saves valid user to DB', (done) => {
      let user = new User({email: 'avp@bills.com'})

      user.save( function(err) {
        expect(err).to.not.exist
        done()
      })
    })

    it('Saves valid user w/ fields to DB', (done) => {
      let user = new User({email: 'marv@bills.com', phone: '716-649-1475'})

      user
        .save()
        .then( () => {
          User.findOne({email: 'marv@bills.com'})
            .then( (result) => {
              expect(result.email).to.equal(user.email)
              expect(result.phone).to.equal(user.phone)
              done()
            })
            .catch( (err) => done(err) )
        })
        .catch( (err) => done(err) )
    })

    it('Returns an error when saving an invalid User to DB', (done) => {
      let user = new User()
      user.save( function(err) {
        expect(err).to.exist
        done()
      })
    })
  })
})

// Close the connection
after( function(done) {
  mongoose.connection.close(done)
})