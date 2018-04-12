const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')

const { routes, handlers } = require('./routes')

const { errorCatcher } = _require('libs/Logger/utils')
const serverLogger = _require('libs/Logger/server')

const app = express()

app.use(serverLogger())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

Object.keys(routes).forEach(route => {
  app.use(routes[route], handlers[route])
})

app.use(errorCatcher(404, 'API_ENDPOINT_NOT_FOUND'))
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err)
})

module.exports = app
