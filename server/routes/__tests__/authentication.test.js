//-----------------------------------------------------------------------------
// server/routes/__tests__/authentication.test.js
//-----------------------------------------------------------------------------
const expect        = require('chai').expect
const request       = require('supertest')
const { ObjectID }  = require('mongodb')

const { app }       = require('../../../index')
const User          = require('../../models/user')

describe('Authentication API', () => {
  /*
  * Create accounts test data
  */
  let usersData = [
    { 
      _id:      new ObjectID(), 
      email:    'fergie@bills.com', 
      phone:    '415-694-2910',
      password: 'password123',
    },
  ]

  beforeEach( async () => {
    try {
      await User.deleteMany({})
      let users = await User.insertMany(usersData)
    }
    catch(err) {
      console.log(`[ERROR] Failed to create authentication test data, err= `, err)
    }
  })

  afterEach( async () => {
    try {
      await User.deleteMany({})
    }
    catch(err) {
      console.log(`[ERROR] Failed to delete Users collection, err= `, err)
    }
  })

  /**
   * POST /api/v1/register
   */
  describe('POST /api/v1/register', () => {
    it('Requires an email address and a password', (done) => {
      request(app)
        .post('/api/v1/register')
        .send({email: '', password: ''})
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] POST register error= `, JSON.stringify(res.body, undefined, 2))
          expect(Object.keys(res.body.errors).length).to.equal(2)
          expect(res.body.errors.email.message).to.match(/email is required/i)
          expect(res.body.errors.password.message).to.match(/password is required/i)
        })
        .end(done)
    })

    it('Requires a valid email address', (done) => {
      request(app)
        .post('/api/v1/register')
        .send({email: 'marv.levy', password: 'password123'})
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] POST register error= `, JSON.stringify(res.body, undefined, 2))
          expect(Object.keys(res.body.errors).length).to.equal(1)
          expect(res.body.errors.email.message).to.match(/is not a valid email/i)
        })
        .end(done)
    })

    it('Requires a unique email address', (done) => {
      request(app)
        .post('/api/v1/register')
        .send({email: usersData[0].email, password: 'foobar123'})
        .expect(400)
        .expect( (res) => {
          //* console.log(`[debug] POST registered error= `, JSON.stringify(res.body, undefined, 2))
          expect(Object.keys(res.body.errors).length).to.equal(1)
          expect(res.body.errors.email.message).to.match(/email already in use/i)
        })
        .end(done)
    })

    it('Registers a user', (done) => {
      let user = {email: 'marv@bills.com', password: 'foobar123'}

      request(app)
        .post('/api/v1/register')
        .send(user)
        .expect(201)
        .expect( (res) => {
          //* console.log(`[debug] POST register user= `, JSON.stringify(res.body, undefined, 2))
          expect(res.body.user.email).to.equal(user.email)
          expect(res.body.user._id).to.be.a('string')
        })
        .end( (err, res) => {
          if(err) { return done(err) }
          
          User
          .findOne({email: res.body.user.email})
          .then( (result) => {
            expect(result._id.toHexString()).to.equal(res.body.user._id)
            expect(result.password).to.be.a('string')
          })
          .catch( (err) => done(err) )

          done()
        })
    })
  })
})



