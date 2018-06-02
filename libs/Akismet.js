const akismet = require('akismet-api')

const { throwError } = require('../libs/Error')

const akismetCheckSpam = async (key, blog, entryObject) => {
  try {
    return akismet.client({ key, blog }).checkSpam(entryObject)
  } catch (err) {
    throwError('AKISMET_CHECK_SPAM_FAILED', err, 500)
  }
}

const akismetVerify = async (key, blog) => {
  try {
    return akismet.client({ key, blog }).verifyKey()
  } catch (err) {
    throwError('AKISMET_VERIFICATION_FAILED', err, 500)
  }
}

module.exports = {
  akismetCheckSpam,
  akismetVerify
}
