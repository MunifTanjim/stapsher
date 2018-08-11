const logger = require('../Logger')
const { StapsherError, throwError } = require('../Error')

const config = require('../../configs/server')

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
  let error, exposeCause

  if (err instanceof StapsherError) {
    error = err
    exposeCause = true
  } else {
    error = new StapsherError('SERVER_PROBLEM', err, 500)
    exposeCause = false
  }

  let { message, cause, statusCode, redirect } = error

  if (redirect) {
    res.redirect(307, redirect)
  } else {
    let errorResponse = { code: message }

    if (exposeCause) {
      errorResponse.info = cause instanceof Error ? cause.toString() : cause
    }

    res.status(statusCode).send(errorResponse)
  }

  next(error)
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
  errorLogHandler,
  errorResponseHandler,
  gracefulShutdownHandler,
  notFoundErrorHandler
}
