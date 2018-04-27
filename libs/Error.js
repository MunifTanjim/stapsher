const logger = require('../libs/Logger')

class stapsherError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class ResponseError extends stapsherError {
  constructor(errorCode, cause = null, statusCode) {
    super(errorCode)
    this.cause = cause
    this.statusCode = statusCode
  }
}

class ServerError extends stapsherError {
  constructor(errorCode, cause = null, statusCode = 500) {
    super(errorCode)
    this.cause = cause
    this.statusCode = statusCode
  }
}

const throwError = (errorCode, cause, statusCode, expose = false) => {
  throw expose
    ? new ResponseError(errorCode, cause, statusCode)
    : new ServerError(errorCode, cause, statusCode)
}

const respondError = (errorCode, statusCode, cause) => {
  throw new ResponseError(errorCode, statusCode, cause)
}

const notFoundErrorHandler = (req, res, next) =>
  throwError('API_ENDPOINT_NOT_FOUND', null, 404, true)

const errorHandler = (err, req, res, next) => {
  let { message, cause, statusCode = 500 } = err

  let code = err instanceof ResponseError ? message : 'SERVER_PROBLEM'
  let info = cause instanceof Error ? cause.toString() : cause

  let errorObject = { code, info }

  res.status(statusCode).send(errorObject)

  logger.error(message, {
    ...(cause instanceof Error ? { info: cause.toString(), ...cause } : cause),
    path: req.url
  })
}

module.exports = {
  respondError,
  ResponseError,
  errorHandler,
  notFoundErrorHandler
}
