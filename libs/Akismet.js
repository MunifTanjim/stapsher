const akismet = require('akismet-api')

const { throwError } = require('../libs/Error')

const getAkismetClient = (key, blog) => akismet.client({ key, blog })

const verifyAkismet = async (key, blog) => {
  try {
    return getAkismetClient(key, blog).verifyKey()
  } catch (err) {
    throwError('AKISMET_VERIFICATION_FAILED', err, 500, true)
  }
}

module.exports = {
  getAkismetClient,
  verifyAkismet
}
