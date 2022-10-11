const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

require('dotenv').config()

app.use( cors() )

// To get access to POSTed 'formdata' body content, we have to 
app.use( express.json() )
app.use( express.urlencoded({ extended: true}))

// server listening to the provided port
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT} ...`)
})

// Mongoose DB initialisation
const mongoose = require('mongoose');
const User = require('./models/User')

mongoose.connect(process.env.MONGODB_CLOUD_URL)
const db = mongoose.connection

db.on('error', err => {
  console.log('Error connecting to DB server', err)
  process.exit(1)
})

// Authentication
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtAuthenticate = require('express-jwt')

const checkAuth = () => {

  return jwtAuthenticate.expressjwt({ 
    secret: process.env.SERVER_SECRET_KEY,
    algorithms: ['HS256'],
    requestProperty: 'auth' // gives us 'req.auth'
  })

}

app.get('/', (req, res) => {
  console.log('Roor route was requested')
  res.json({ hello: 'there' })
})


app.post('/submit-score', (req, res) => {
  console.log('score submit!')
  res.json({ score: 'submit'})
})

app.get('/scores', (req, res) => {
  res.json({ scores: 'are here'})
})

//login route is all below here ---------------------
app.post('/signup', async (req, res) => {
  
  const newSignup = {
    name: req.body.name,
    email: req.body.email,
    passwordDigest: req.body.passwordDigest
  }

  await User.create( newSignup )

  res.json( newSignup )
}) // /signup


// DOES NOT WORK FOR NEWLY CREATED USERS??
app.post('/login', async (req, res) => {

  console.log('login form here:', req.body)

  const { email, passwordDigest } = req.body

  try {

    const user = await User.findOne({ email })

    // comparing credentiaks
    if (user && bcrypt.compareSync(passwordDigest, user.passwordDigest)){

      const token = jwt.sign(
        // the data to encode in the 'payload'
        { _id: user._id },

        // the secret key to use to encrypt the token - this is what ensures that although
        // the token payload can be READ by anyone, only the server can MODIFY the payload
        // by using the secret key - ie users can't change their user ID
        process.env.SERVER_SECRET_KEY,

        // expiry date/other config
        {expiresIn: '72h'}
      )

      res.json({token})

    } else {
      // incorrect credentials: user not found (by email), or passwords dont match
      res.status(401).json({success: false})
    }

  }catch( err ){
    console.log('Error verifying login credentials:', err)
    res.sendStatus(500)
  }


}) // /login

app.post('/logout', async (req, res) => {
  console.log('logout initiated')
  res.json({ login: 'form'})
}) // /logout

// Routes below this line only work for authenticated users

// Custom middleware, defined inline:



