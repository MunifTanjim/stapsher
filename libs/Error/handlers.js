const logger = require('../Logger')
const { throwError } = require('../Error')

const config = require('../../configs/server')

const bruteStoreErrorHandler = err =>
  throwError('BRUTE_STORE_ERROR', err, 500, true)

const errorLogHandler = (err, req, res, next) => {
  let { cause } = err

  let causeJSON =
    cause instanceof Error ? { info: cause.toString(), ...cause } : cause

  logger.error(err.toString(), {
    ...err.toJSON(),
    cause: causeJSON,
    path: req.url
  })
}

const errorResponseHandler = (err, req, res, next) => {
  let { message, cause, statusCode = 500, mask, redirect } = err

  if (redirect) res.redirect(redirect)
  else
    res.status(statusCode).send({
      code: mask ? 'SERVER_PROBLEM' : message,
      info: cause instanceof Error ? cause.toString() : cause
    })

  next(err)
}

const gracefulShutdownHandler = server => {
  logger.info('Received kill signal! Attempting to shutdown gracefully...')

  server.close(err => {
    if (!err) {
      logger.info('Graceful Shutdown: Successed!')
      process.exit(0)
    }
  })

  setTimeout(() => {
    logger.error('Graceful Shutdown: Failed!')
    process.exit(1)
  }, config.get('stapsher.killTimeout'))
}

const notFoundErrorHandler = (req, res, next) =>
  throwError('API_ENDPOINT_NOT_FOUND', { path: req.url }, 404)

module.exports = {
  bruteStoreErrorHandler,
  errorLogHandler,
  errorResponseHandler,
  gracefulShutdownHandler,
  notFoundErrorHandler
}
