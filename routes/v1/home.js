const router = require('express').Router()

router.get('/', (req, res, next) => {
  res.send('Welcome to Stapsher API!')
})

module.exports = router
