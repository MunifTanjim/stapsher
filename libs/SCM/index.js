const getProviders = require('./get-providers')

const { throwError } = require('../Error')

const providers = getProviders()

const SCM = ({ platform, baseUrl, username, repository, branch }) => {
  let provider = providers[platform.toLowerCase()]

  if (!provider) {
    throwError('UNSUPPORTED_SCM_PLATFORM', { platform }, 400)
  }

  return provider({ username, repository, branch }, baseUrl)
}

module.exports = SCM
