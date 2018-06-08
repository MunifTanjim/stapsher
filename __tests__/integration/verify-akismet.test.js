const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

jest.mock('../../libs/Stapsher')
const Stapsher = require('../../libs/Stapsher')

const akismet = require('../../libs/Akismet')
akismet.akismetVerify = jest.fn()

const app = require('../../app')

beforeAll(done => helpers.startServer(done, app))
afterAll(done => helpers.stopServer(done, app))

beforeEach(() => {
  Stapsher.mockClear()
})

describe('Stapsher:integration:verify-akismet', () => {
  let parameters = helpers.getParameters()

  let { platform, username, repository, branch, entryType } = parameters
  let endpoint = `/${platform}/${username}/${repository}/${branch}/${entryType}/verify/akismet`

  let mockConfig = {
    'akismet.apiKey': 'qwerty',
    'akismet.siteUrl': 'http://example.com'
  }

  Stapsher.prototype.getConfig.mockImplementation(() => ({
    get: key => mockConfig[key]
  }))

  it('responses when disabled', async () => {
    mockConfig['akismet.enable'] = false

    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)

    expect(Stapsher).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].authenticate).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].getConfig).toHaveBeenCalledTimes(1)
    expect(await res.json()).toMatchSnapshot()
  })

  it('responses when valid', async () => {
    akismet.akismetVerify.mockResolvedValueOnce(true)

    mockConfig['akismet.enable'] = true

    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)

    expect(Stapsher).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].authenticate).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].getConfig).toHaveBeenCalledTimes(1)
    expect(akismet.akismetVerify).toHaveBeenCalledTimes(1)
    expect(akismet.akismetVerify).toHaveBeenLastCalledWith(
      mockConfig['akismet.apiKey'],
      mockConfig['akismet.siteUrl']
    )
    expect(await res.json()).toMatchSnapshot()
  })

  it('responses when invalid', async () => {
    akismet.akismetVerify.mockResolvedValueOnce(false)

    mockConfig['akismet.enable'] = true

    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)

    expect(Stapsher).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].authenticate).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.instances[0].getConfig).toHaveBeenCalledTimes(1)
    expect(akismet.akismetVerify).toHaveBeenCalledTimes(2)
    expect(akismet.akismetVerify).toHaveBeenLastCalledWith(
      mockConfig['akismet.apiKey'],
      mockConfig['akismet.siteUrl']
    )
    expect(await res.json()).toMatchSnapshot()
  })
})
