const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const { encrypt } = require('../../libs/Crypto')

router.get(
  '/:text',
  asyncHandler(async (req, res, next) => {
    try {
      let { text } = req.params
      let encryptedText = encrypt(text)

      res.send(encryptedText)
    } catch (err) {
      throw err
    }
  })
)

module.exports = router
