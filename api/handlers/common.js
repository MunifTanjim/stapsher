const versionChecker = versions => (req, res, next) => {
  let compatible = versions.some(
    version => version.toString() === req.params.version
  )

  if (!compatible) errorCatcher(500, 'Invalid Version')(req, res, next)

  next()
}

const requestDataChecker = keys => (req, res, next) => {
  let missingKeys = []

  keys.forEach(
    key =>
      req.body.hasOwnProperty(key) ||
      req.query.hasOwnProperty(key) ||
      missingKeys.push(key)
  )

  if (missingKeys.length)
    errorCatcher(500, 'MISSING_DATA', missingKeys)(req, res, next)

  next()
}

const errorCatcher = (status, code, data) => (req, res, next) => {
  let err = new Error(code || 'ERROR')
  err.status = status
  err.code = code
  if (data) err.data = data
  next(err)
}

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err)
}

module.exports = {
  errorCatcher,
  errorHandler,
  requestDataChecker,
  versionChecker
}
