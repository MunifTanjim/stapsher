const config = require('../../configs/server')

module.exports.startServer = (done, app) => {
  let server = app.listen(config.get('port'))
  server.on('listening', () => done())
  return server
}

module.exports.stopServer = (done, server) => {
  server.close(() => done())
}
