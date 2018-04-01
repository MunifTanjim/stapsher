const router = require('express').Router()

const config = require('../../configs/server')

router.get('/', (req, res, next) => {
  let redirectUrl = config.get('homeRouteRedirect')

  if (redirectUrl) return res.redirect(301, redirectUrl)

  res.send('Welcome to Stapsher API!')
})

module.exports = router
