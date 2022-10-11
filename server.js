const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3000

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

app.post('/login', async (req, res) => {
  console.log('login form here')
  res.json({ login: 'form'})
}) // /login

app.post('/logout', async (req, res) => {
  console.log('logout initiated')
  res.json({ login: 'form'})
}) // /logout





