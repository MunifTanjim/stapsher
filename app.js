const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

const { bruteMiddleware } = require('./libs/ExpressBrute')
const requestLogger = require('./libs/Logger/request')
const {
  errorLogHandler,
  errorResponseHandler,
  notFoundErrorHandler
} = require('./libs/Error/handlers')

const { handlers, routes } = require('./routes')

const config = require('./configs/server')

const app = express()

app.use(helmet())
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(requestLogger())

app.use(bruteMiddleware())

if (!['development'].includes(config.get('env'))) {
  app.set('trust proxy', 1)
}

Object.keys(routes).forEach(route => {
  app.use(routes[route], handlers[route])
})

app.use(notFoundErrorHandler)
app.use(errorResponseHandler)
app.use(errorLogHandler)

module.exports = app
