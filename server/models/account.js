//-----------------------------------------------------------------------------
// server/models/account.js
//-----------------------------------------------------------------------------
const mongoose = require('mongoose')

// Account schema
const accountSchema = new mongoose.Schema({
  name: {
    type:       String,
    required:   [true, 'Account name is required'],
    minLength:  1,
    trim:       true,
  },
  financialInstitute: {
    type:       String,
    required:   [true, 'Financial Institute is required'],
    minLength:  1,
    trim:       true,
  },
  type: {
    type:       String,
    enum:       ['Checking', 'Savings', 'Credit Card'],
    default:    'Checking',
  },
  balance: {
    type:       Number,
    default:    0,
  },
  asOfDate: {
    type:       Date,
    default:    new Date(),
  },
  userId: {
    type:       mongoose.Schema.Types.ObjectId,
    required:   true,
  },
})

// Export Account model
const Account   = mongoose.model('Account', accountSchema)
module.exports  = Account
