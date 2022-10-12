const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

require('dotenv').config()

app.use(cors())

// To get access to POSTed 'formdata' body content, we have to 
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// server listening to the provided port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port} ...`)
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


//login route is all below here ---------------------
app.post('/signup', async (req, res) => {

  const newSignup = {
    name: req.body.name,
    email: req.body.email,
    passwordDigest: req.body.passwordDigest // pre-action in the model will encrypt this
  }

  await User.create(newSignup)

  res.json(newSignup)
}) // /signup

app.post('/login', async (req, res) => {

  console.log('login form here:', req.body)

  const { email, passwordDigest } = req.body

  try {
    const user = await User.findOne({ email })
    console.log(user)

    // comparing credentiaks
    if (user && bcrypt.compareSync(passwordDigest, user.passwordDigest)) {

      const token = jwt.sign(
        // the data to encode in the 'payload'
        { _id: user._id },

        // the secret key to use to encrypt the token - this is what ensures that although
        // the token payload can be READ by anyone, only the server can MODIFY the payload
        // by using the secret key - ie users can't change their user ID
        process.env.SERVER_SECRET_KEY,

        // expiry date/other config
        { expiresIn: '72h' }
      )

      res.json({ token, user })

    } else {
      // incorrect credentials: user not found (by email), or passwords dont match
      res.status(401).json({ success: false })
    }

  } catch (err) {
    console.log('Error verifying login credentials:', err)
    res.sendStatus(500)
  }


}) // /login

app.post('/logout', async (req, res) => {
  console.log('logout initiated')
  res.json({ login: 'form' })
}) // /logout

// Routes below this line only work for authenticated users

app.use(checkAuth())

// Custom middleware, defined inline:
// Use the req.auth ID from the middleware above and try to look up a user with it 
// if found, attached to req.current_user for all the requests that follow this
// if not found, return an error code
app.use(async (req, res, next) => {

  try {

    const user = await User.findOne({ _id: req.auth._id })

    if (user === null) {
      res.sendStatus(401) // invalid/stale token
      // Note that by running a response method here, this middleware will not
      // allow any further routes to be handled
    } else {
      req.current_user = user // add 'current_user'for the next route to access
      next() // move on to the next route handler/middleware in this server
    }


  } catch (err) {
    console.log('Error querying User in auth middleware', err)
    res.sendStatus(500)

  }

})

// get current_user data (not all only neccessary ones)
app.get('/current_user', (req, res) => {

  res.json({
    name: req.current_user.name,
    hipScore: req.current_user.hipScore,
    hopScore: req.current_user.hopScore
  })
})

app.post('/submit-hip-score', async (req, res) => {
  console.log('score submit!')

  const { name, score } = req.body
  console.log(name, score);
  await User.updateOne({ name }, { hipScore: score })

  res.status(200).json({ score: 'submit' })
})

app.post('/submit-hop-score', async (req, res) => {
  console.log('score submit!')


  const { name, score } = req.body
  const user = await User.updateOne({ name }, { hopScore: score })

  res.status(200).json(user)
})


// get the top 10 high scores
app.get('/hip-scores', async (req, res) => {
  const users = await User.find({}, 'name hipScore -_id').sort({ hipScore: -1 }).limit(5)

  res.status(200).json(users)
})

app.get('/hop-scores', async (req, res) => {

  const users = await User.find({}, 'name hopScore -_id').sort({ hopScore: -1 }).limit(5)

  res.status(200).json(users)
})

