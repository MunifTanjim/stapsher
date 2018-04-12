const errorCatcher = (status, code, data) => (req, res, next) => {
  let err = new Error(code || 'ERROR')
  err.status = status
  err.code = code
  if (data) err.data = data
  next(err)
}

module.exports = {
  errorCatcher
}
