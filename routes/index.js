const routes = {
  v1: '/v1',
  default: '/'
}

const handlers = {
  v1: require('./v1'),
  default: require('./v1')
}

module.exports = { routes, handlers }
