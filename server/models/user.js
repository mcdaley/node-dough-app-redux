//-----------------------------------------------------------------------------
// server/models/user.js
//-----------------------------------------------------------------------------
const mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type:         String,
    index:        true,
    unique:       [true, 'Duplicate email'],
    //* dropDups:     true,
    validate:     {
      validator: function(email) {
        return /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/.test(email)
      },
      message: props => `${props.value} is not a valid email address`
    },
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
  },
  password: {
    type:         String,
    required:     [true, 'Password is required']
  }
})

// Create User model and export it
const User      = mongoose.model('User', userSchema)
module.exports  = User