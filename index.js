const config = require('./configs/server')

const Server = _require('libs/Server')

// const github = _require('libs/GitHub')

const ExtraStaticServer = new Server(config)

ExtraStaticServer.start()
