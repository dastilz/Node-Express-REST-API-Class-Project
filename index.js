// Author: David Stilz

const express = require('express')
const apiRoute = require('./src/api')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./src/services/config')
const app = express()

// Allow CORS
app.use(cors())

// Middleware to handle JSON parsing
app.use(bodyParser.json())

// Allow extended JSON objects (probably not applicable to this project anyway)
app.use(bodyParser.urlencoded({
    extended: true
}))

// Route /api to another file to handle
app.use('/api', apiRoute)

// Listen on configured port and console log an applicable message
app.listen(config.PORT, () => console.log(`CS405 Project by David Stilz listening on http://localhost:${config.PORT}`))