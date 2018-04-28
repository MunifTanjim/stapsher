const router = require('express').Router()

const routes = {
  home: '/',
  encrypt: '/encrypt',
  github: '/github.com'
}

const routers = {
  home: require('./home'),
  encrypt: require('./encrypt'),
  github: require('./github')
}

Object.keys(routes).forEach(route => {
  router.use(routes[route], routers[route])
})

module.exports = router
