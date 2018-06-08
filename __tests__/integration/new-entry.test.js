const fetch = require('node-fetch')
const qs = require('qs')

require('./helpers/init')
const helpers = require('../helpers')

jest.mock('../../libs/Stapsher')
const Stapsher = require('../../libs/Stapsher')

const app = require('../../app')

let server
beforeAll(done => {
  server = helpers.startServer(done, app)
})
afterAll(done => {
  helpers.stopServer(done, server)
})

beforeEach(() => {
  Stapsher.mockClear()
})

describe('Stapsher:integration:new-entry', () => {
  let baseUrl = helpers.getBaseUrl()
  let parameters = helpers.getParameters()

  let { platform, username, repository, branch, entryType } = parameters
  let url = `${baseUrl}/${platform}/${username}/${repository}/${branch}/${entryType}/new`

  let body = {
    'g-recaptcha-response': 'qwerty',
    fields: { name: 'Samantha Groves' },
    options: { alias: 'Root' }
  }

  let headers = {
    'content-type': 'application/x-www-form-urlencoded',
    referrer: 'r007',
    'user-agent': 'TheMachine/1.0',
    'x-forwarded-for': '127.0.0.1'
  }

  it('calls necessary functions', async () => {
    await fetch(url, {
      method: 'POST',
      body: qs.stringify(body),
      headers: { ...headers }
    })

    expect(Stapsher).toHaveBeenCalledTimes(1)
    expect(Stapsher.mock.calls[0][0]).toMatchSnapshot()
    expect(Stapsher.mock.instances[0].authenticate).toHaveBeenCalledTimes(1)
    expect(
      Stapsher.mock.instances[0].addExtraInfo.mock.calls[0][0]
    ).toMatchSnapshot()
    expect(Stapsher.mock.instances[0].processNewEntry).toHaveBeenCalledWith(
      qs.parse(qs.stringify(body.fields)),
      qs.parse(qs.stringify(body.options))
    )
  })
})
