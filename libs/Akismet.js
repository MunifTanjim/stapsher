const akismet = require('akismet-api')

const { throwError } = require('../libs/Error')

const akismetCheckSpam = async (key, blog, entryObject) => {
  try {
    let spam = await akismet.client({ key, blog }).checkSpam(entryObject)
    return spam
  } catch (err) {
    throwError('AKISMET_CHECK_SPAM_FAILED', err, 500)
  }
}

const akismetVerify = async (key, blog) => {
  try {
    let valid = await akismet.client({ key, blog }).verifyKey()
    return valid
  } catch (err) {
    throwError('AKISMET_VERIFICATION_FAILED', err, 500)
  }
}

module.exports = {
  akismetCheckSpam,
  akismetVerify
}
