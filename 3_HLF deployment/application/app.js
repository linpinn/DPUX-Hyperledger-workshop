const express = require('express')
const bodyParser = require('body-parser')

require('dotenv').config({ path: './.env' })
const logger = require('./util/logger')
const app = express()
const port = process.env.PORT || '8099'

const { eventHub, register } = require('./service/index')

// for eventhub testing purpose
// eventHub()
register({ enrollmentID: 'usertest'})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.listen(port, () => {
  logger.debug(`port listened on ${port}`)
})