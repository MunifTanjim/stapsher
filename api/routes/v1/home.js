const router = require('express').Router()

router.get('/', (req, res, next) => {
  res.send('Welcome to extraStatic API!')
})

module.exports = router
