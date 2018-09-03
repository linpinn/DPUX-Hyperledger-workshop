const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')
const { port } = require('./config')

const app = express()

const startApp = () => {
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(routes)
  app.listen(port, () => {
    console.log(`app is listening on ${port}`)
    console.log(`please open the browser with the url http://localhost:${port}`)
  })
}

module.exports = startApp