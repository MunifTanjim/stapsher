const router = require('express').Router()

router.get('/', (req, res, next) => {
  res.type('txt').send('Welcome to Stapsher API!')
})

module.exports = router
