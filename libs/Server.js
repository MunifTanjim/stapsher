const app = _require('api/app')
const http = require('http')

class ExtraStaticServer {
  constructor(config) {
    this.config = config
    this.app = app
  }

  start() {
    let port = this.config.get('port')
    this.app.listen(port)
  }
}

module.exports = ExtraStaticServer
