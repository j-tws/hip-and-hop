const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3001

require('dotenv').config()

app.use( cors() )

// To get access to POSTed 'formdata' body content, we have to 
app.use( express.json() )
app.use( express.urlencoded({ extended: true}))

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT} ...`)
})

// Mongoose DB initialisation
const mongoose = require('mongoose');
const User = require('./models/User')





