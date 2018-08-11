class StapsherError extends Error {
  constructor(errorCode, cause, statusCode) {
    super(errorCode)

    this.name = this.constructor.name
    this.cause = cause
    this.statusCode = statusCode
  }

  toJSON() {
    return {
      code: this.message,
      statusCode: this.statusCode,
      cause: this.cause instanceof Error ? this.cause.toString() : this.cause
    }
  }
}

const throwError = (errorCode, cause = null, statusCode = 500) => {
  throw new StapsherError(errorCode, cause, statusCode)
}

module.exports.StapsherError = StapsherError
module.exports.throwError = throwError
