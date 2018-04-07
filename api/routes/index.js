const routes = {
  v1: '/v1',
  default: '/'
}

const routers = {
  v1: require('./v1'),
  default: require('./v1')
}

module.exports = { routes, routers }
