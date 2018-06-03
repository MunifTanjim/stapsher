class StapsherError extends Error {
  constructor(errorCode, cause, statusCode, mask) {
    super(errorCode)

    this.name = this.constructor.name
    this.cause = cause
    this.statusCode = statusCode

    this.mask = mask
  }

  toJSON() {
    return {
      name: this.name,
      code: this.message,
      cause: this.cause,
      statusCode: this.statusCode
    }
  }
}

const throwError = (
  errorCode,
  cause = null,
  statusCode = 500,
  mask = false
) => {
  throw new StapsherError(errorCode, cause, statusCode, mask)
}

module.exports = {
  throwError
}
