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

const respondError = (errorCode, statusCode, cause) => (req, res, next) =>
  next(new ResponseError(errorCode, statusCode, cause))

const notFoundErrorHandler = respondError('API_ENDPOINT_NOT_FOUND', 404)

const errorHandler = (err, req, res, next) => {
  let { message: code, statusCode = 500, cause } = err

  let errorObject = {
    code,
    info: cause instanceof Error ? cause.message : cause,
    statusCode
  }

  res.status(statusCode)
  res.send(errorObject)
}

module.exports = {
  respondError,
  ResponseError,
  errorHandler,
  notFoundErrorHandler
}
