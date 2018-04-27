const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const Stapsher = _require('libs/Stapsher')
const logger = _require('libs/Logger')
const { respondError, throwError } = _require('libs/Error')

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      let stapsher = new Stapsher(req.params)

      await stapsher.authenticate()

      stapsher.addExtraInfo({
        clientIP: req.ip,
        clientUserAgent: req.get('user-agent')
      })

      let fields = req.body.fields
      let options = req.body.options || {}
    } catch (err) {
      throw err
    }
  })
)

module.exports = router
