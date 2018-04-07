require('./configs/env')

const config = _require('configs/server')
const Server = _require('libs/Server')
const GitHubApp = _require('libs/GitHubApp')

const ExtraStaticServer = new Server(config)

ExtraStaticServer.start()
