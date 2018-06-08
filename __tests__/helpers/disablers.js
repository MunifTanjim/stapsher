const path = require('path')

module.exports.disableRequestLogger = () => {
  jest.mock(path.resolve('libs/Logger/request'), () => () => (req, res, next) =>
    next()
  )
}

module.exports.disableExpressBrute = () => {
  jest.mock(path.resolve('libs/ExpressBrute'), () => ({
    bruteMiddleware: () => (req, res, next) => next()
  }))
}
