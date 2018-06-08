const getPort = require('get-port')

module.exports.startServer = (done, app) => {
  getPort().then(port => {
    app.set('baseUrl', `http://localhost:${port}`)
    app.stapsher = app.listen(port)
    app.stapsher.on('listening', done)
  })
}

module.exports.stopServer = (done, app) => {
  app.stapsher.close(done)
}
