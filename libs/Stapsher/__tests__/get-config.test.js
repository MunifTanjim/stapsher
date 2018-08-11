const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()
helpers.disableNetConnect()

jest.mock('../../SCM/GitHub')
const GitHub = require('../../SCM/GitHub')

const utils = require('../utils')
utils.validateConfig = jest.fn()

const clientConfig = require('../../../configs/client')
clientConfig.loadConfig = jest.fn()

const Stapsher = require('../../Stapsher')

describe('libs/Stapsher:getConfig', () => {
  let mockConfig = { branch: 'master' }

  utils.validateConfig.mockImplementation(() => mockConfig)
  clientConfig.loadConfig.mockImplementation(() => mockConfig)

  GitHub.prototype.readFile.mockImplementation(() => helpers.readConfigFile())

  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    utils.validateConfig.mockClear()
    clientConfig.loadConfig.mockClear()
    GitHub.mockClear()

    stapsher = new Stapsher(parameters)
  })

  it('calls necesssary functions', async () => {
    await stapsher.getConfig()

    expect(GitHub.mock.instances[0].readFile).toHaveBeenCalledTimes(1)
    expect(utils.validateConfig).toHaveBeenCalledTimes(1)
    expect(clientConfig.loadConfig).toHaveBeenCalledTimes(1)
  })

  it('returns if branch matches', async () => {
    let config = await stapsher.getConfig()

    expect(config).toEqual(mockConfig)
  })

  it('throws error if branch mismatches', async () => {
    utils.validateConfig.mockImplementation(() => ({ branch: 'dev' }))

    await stapsher.getConfig().catch(err => {
      expect(err).toMatchSnapshot()
    })
  })
})
