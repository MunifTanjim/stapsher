const logger = require('../libs/Logger')

class extraStaticError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class ResponseError extends extraStaticError {
  constructor(errorCode, statusCode, cause = null) {
    super(errorCode)
    this.statusCode = statusCode
    this.cause = cause
  }
}

const respondError = (errorCode, statusCode, cause) => {
  throw new ResponseError(errorCode, statusCode, cause)
}

const notFoundErrorHandler = (req, res, next) =>
  respondError('API_ENDPOINT_NOT_FOUND', 404)

const errorHandler = (err, req, res, next) => {
  let { message, statusCode = 500, cause } = err

  let code = err instanceof ResponseError ? message : 'SERVER_PROBLEM'
  let info = cause instanceof Error ? cause.message : cause

  let errorObject = { code, info, statusCode }

  res.status(statusCode).send(errorObject)

  logger.error(message, {
    ...(cause instanceof Error ? { info: cause.message, ...cause } : cause),
    path: req.url
  })
}

module.exports = {
  respondError,
  ResponseError,
  errorHandler,
  notFoundErrorHandler
}
