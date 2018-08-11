const serverConfig = require('../../configs/server')

const GitHub = require('./GitHub')
const GitLab = require('./GitLab')

const ProviderConstructor = {
  github: GitHub,
  gitlab: GitLab
}

const getProviders = () => {
  return serverConfig.get('scmProviders').reduce((providers, configKey) => {
    let [platform, type] = configKey.split('.')
    let config = serverConfig.get(configKey)

    if (Object.values(config).some(val => !val)) {
      throw new Error(`Invalid config for SCM provider: ${configKey}`)
    }

    providers[platform] = (info, baseUrl) => {
      return new ProviderConstructor[platform]({
        info,
        config: { ...config, baseUrl, type }
      })
    }

    return providers
  }, {})
}

module.exports = getProviders
