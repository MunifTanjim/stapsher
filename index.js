const config = require('./configs/server')
const app = require('./app')
const logger = require('./libs/Logger')
const { gracefulShutdownHandler } = require('./libs/Error/handlers')

const port = config.get('port')

server = app.listen(port)

server.on('listening', () => {
  logger.info(`Server started! Listening to port: ${port}`)
})

process.on('SIGINT', () => gracefulShutdownHandler(server))
process.on('SIGTERM', () => gracefulShutdownHandler(server))
