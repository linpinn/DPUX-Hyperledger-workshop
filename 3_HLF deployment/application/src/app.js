const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || '3003'

const { eventHub, register, enroll } = require('./service/index')

const Options = require('./util/helper')
const routes = require('./routes');

const options = new Options()

const startApp = () => {
  // for eventhub testing purpose
  // eventHub()
  // register({ enrollmentID: 'usertest2'})

  // enroll(options.enrollment)

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(routes)

  app.listen(port, () => {
    console.log(`app is listening on ${port}`)
  })
}

module.exports = startApp