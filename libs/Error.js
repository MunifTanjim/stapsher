class ESError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class ResponseError extends ESError {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

const respondError = (message, statusCode) => (req, res, next) =>
  next(new ResponseError(message, statusCode))

const notFoundErrorHandler = respondError('API_ENDPOINT_NOT_FOUND', 404)

const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500)
  res.send({ error: err.message })
}

module.exports = {
  respondError,
  ResponseError,
  errorHandler,
  notFoundErrorHandler
}
