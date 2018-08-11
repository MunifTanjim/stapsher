const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

const serverConfig = require('../../../configs/server')

const GitHub = require('../GitHub')
const GitLab = require('../GitLab')

const getProviders = require('../get-providers')

describe('libs/SCM/get-providers', () => {
  it('returns object containing provider constructor functions', () => {
    serverConfig.set('scmProviders', ['github.bot', 'gitlab.bot'])

    let providers = getProviders()

    expect(providers).toHaveProperty('github')
    expect(providers).toHaveProperty('gitlab')
    expect(providers.github()).toBeInstanceOf(GitHub)
    expect(providers.gitlab()).toBeInstanceOf(GitLab)
  })

  it('throws error if invalid config', () => {
    serverConfig.set('scmProviders', ['github.bot'])
    serverConfig.set('github.bot.accessToken', '')

    try {
      getProviders()
    } catch (err) {
      expect(err).toMatchSnapshot()
    }
  })
})
