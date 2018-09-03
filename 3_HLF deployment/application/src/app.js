const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || '3003'

const startApp = () => {
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(routes)
  app.listen(port, () => {
    console.log(`app is listening on ${port}`)
  })
}

module.exports = startApp