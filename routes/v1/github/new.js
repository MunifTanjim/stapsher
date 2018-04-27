const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const Stapsher = _require('libs/Stapsher')
const logger = _require('libs/Logger')
const { throwError } = _require('libs/Error')

router.post(
  '/:username/:repository/:branch/:entryType?',
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

      let { redirect, ...result } = await stapsher.processNewEntry(
        fields,
        options
      )

      if (redirect) res.redirect(redirect)
      else res.send(result)
    } catch (err) {
      throw err
    }
  })
)

module.exports = router
