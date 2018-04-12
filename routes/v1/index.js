const router = require('express').Router()

const routes = {
  home: '/',
  github: '/github.com'
}

const routers = {
  home: require('./home'),
  github: require('./github')
}

Object.keys(routes).forEach(route => {
  router.use(routes[route], routers[route])
})

module.exports = router
