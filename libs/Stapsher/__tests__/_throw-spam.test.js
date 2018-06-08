const _ = require('lodash')

const { loadConfig } = require('../../../configs/client')

const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

const akismet = require('../../Akismet')
akismet.akismetCheckSpam = jest.fn()

const Stapsher = require('../../Stapsher')

const extraInfo = {
  clientIP: '127.0.0.1',
  clientUserAgent: 'TheMachine/1.0',
  clientReferrer: 'r007'
}

let mockConfig = {}

describe('libs/Stapsher:__throwSpam', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    akismet.akismetCheckSpam.mockClear()

    mockConfig = helpers.readConfigFile()[parameters.entryType]
    mockConfig = loadConfig(mockConfig).getProperties()
    mockConfig.akismet = {
      ...mockConfig.akismet,
      enable: true,
      apiKey: 'zxcvb',
      siteUrl: 'https://example.com'
    }

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => _.get(mockConfig, key)
    }

    stapsher.rawFields = helpers.getFields()

    stapsher.addExtraInfo(extraInfo)
  })

  it('returns early if akismet disabled', () => {
    mockConfig.akismet.enable = false

    stapsher.__throwSpam()

    expect(akismet.akismetCheckSpam).toHaveBeenCalledTimes(0)
  })

  it('calls necessary functions', () => {
    stapsher.__throwSpam()

    expect(akismet.akismetCheckSpam).toHaveBeenCalledTimes(1)
    expect(akismet.akismetCheckSpam.mock.calls[0]).toMatchSnapshot()
  })

  it('returns nothig if spam is false', () => {
    akismet.akismetCheckSpam.mockResolvedValueOnce(false)

    expect(stapsher.__throwSpam()).resolves.toBeUndefined()
  })

  it('throws error if spam is true', () => {
    akismet.akismetCheckSpam.mockResolvedValueOnce(true)

    expect(stapsher.__throwSpam()).rejects.toMatchSnapshot()
  })
})
