const router = require('express').Router()

const config = require('../../configs/server')

router.get('/', (req, res, next) => {
  res.send('Welcome to Stapsher API!')
})

module.exports = router
