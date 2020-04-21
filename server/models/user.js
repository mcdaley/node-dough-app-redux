//-----------------------------------------------------------------------------
// server/models/user.js
//-----------------------------------------------------------------------------
const mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type:         String,
    required:     [true, 'User email is required'],
  },
  phone: {
    type:         String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v)
      },
      message: props => `${props.value} is not a valid phone number`
    }
  }
})

// Create User model and export it
const User      = mongoose.model('User', userSchema)
module.exports  = User