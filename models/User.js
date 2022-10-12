const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const UserSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  passwordDigest: {
    type: String,
    required: true
  },

  hipScore: {
    type: Number,
    default: 0
  },

  hopScore: {
    type: Number,
    default: 0
  }

})

// ERROR ABOUT DATA AND SALT REQUIRED IF THIS IS TURNED ON
// function for converting password into encrypted password upon signing up
// UserSchema.pre('save', async (next) => {
//   const user = this
//   const hash = await bcrypt.hash(this.passwordDigest, 10)
//   this.passwordDigest = hash
//   next()
// })


module.exports = mongoose.model('User', UserSchema)