const express = require('express')
const bodyParser = require('body-parser')

require('dotenv').config({ path: './.env' })
const logger = require('./util/logger')
const app = express()
const port = process.env.PORT || '8099'

const { eventHub, register, enroll } = require('./service/index')

const Options = require('./util/helper')
const options = new Options()

// for eventhub testing purpose
// eventHub()
// register({ enrollmentID: 'usertest2'})

// enroll(options.enrollment)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.listen(port, () => {
  logger.debug(`app is listening on ${port}`)
})