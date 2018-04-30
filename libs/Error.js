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

const notFoundErrorHandler = (req, res, next) =>
  throwError('API_ENDPOINT_NOT_FOUND', { path: req.url }, 404, true)

const errorHandler = (err, req, res, next) => {
  console.log(err)
  let { message, cause, statusCode = 500, redirect } = err

  if (redirect) res.redirect(redirect)
  else
    res.status(statusCode).send({
      code: err instanceof ResponseError ? message : 'SERVER_PROBLEM',
      info: cause instanceof Error ? cause.toString() : cause
    })

  logger.error(message, {
    ...(cause instanceof Error ? { info: cause.toString(), ...cause } : cause),
    path: req.url
  })
}

module.exports = {
  throwError,
  ResponseError,
  errorHandler,
  notFoundErrorHandler
}
