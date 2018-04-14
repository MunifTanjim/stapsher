const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')

const { routes, handlers } = require('./routes')

const { errorHandler, notFoundErrorHandler } = _require('libs/Error')
const requestLogger = _require('libs/Logger/request')

const app = express()

app.use(requestLogger())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

Object.keys(routes).forEach(route => {
  app.use(routes[route], handlers[route])
})

app.use(notFoundErrorHandler)

app.use(errorHandler)

module.exports = app
