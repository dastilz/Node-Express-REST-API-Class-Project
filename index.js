const express = require('express')
const apiRoute = require('./src/api')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use('/api', apiRoute)

app.listen(9990, () => console.log("CS405 Project by David Stilz listening on http://localhost:9990"))