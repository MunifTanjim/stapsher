const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const { routes, routers } = require('./routes')

const { errorCatcher, errorHandler } = require('./handlers/common')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

Object.keys(routes).forEach(route => {
  app.use(routes[route], routers[route])
})

app.use(errorCatcher(404, 'API_ENDPOINT_NOT_FOUND'))
app.use(errorHandler)

module.exports = app
