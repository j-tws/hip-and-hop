const mongoose = require('mongoose')

require('dotenv').config()

const bcrypt = require('bcrypt')

const User = require('./User')

mongoose.connect(process.env.MONGODB_CLOUD_URL)

const db = mongoose.connection;

db.on('error', err => {
  console.log('DB Connection error', err)
  process.exit(1)
})

db.once('open', async () => {
  console.log('Success! DB connected, model loaded')

  // 1. ActiveRecord: User.destroy_all
  await User.deleteMany()

  const createdUsers = await User.create([

    {
      name: 'textchimp',
      email: 'luke@ga.co',
      passwordDigest: bcrypt.hashSync('chicken', 10),
      hipScore: 100,
      hopScore: 200,

    },

    {
      name: 'Xx_kr1$$_xX',
      email: 'kris@ga.co',
      passwordDigest: bcrypt.hashSync('chicken', 10),
      hipScore: 150,
      hopScore: 250,

    },

  ])

  console.log('Users', createdUsers)

  process.exit(0)

})