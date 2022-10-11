const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

  name: String,
  email: String,
  passwordDigest: String,
  score: Number

})

module.exports = mongoose.model('User', UserSchema)