const path = require('path')

const config = require('../../configs/server')

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

module.exports.startServer = (done, app) => {
  let server = app.listen(config.get('port'))
  server.on('listening', () => done())
  return server
}

module.exports.stopServer = (done, server) => {
  server.close(() => done())
}

const serializers = {
  errorSerializer: {
    print: o => JSON.stringify(o, null, 2),
    test: o => o && typeof o === 'object'
  },
  objectSerializer: {
    print: o => JSON.stringify(o.toJSON ? o.toJSON() : o, null, 2),
    test: o => o && o instanceof Error
  }
}

module.exports.addSnapshotSerializers = () => {
  Object.values(serializers).forEach(serializer =>
    expect.addSnapshotSerializer(serializer)
  )
}
