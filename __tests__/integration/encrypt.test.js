const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

const { decrypt } = require('../../libs/Crypto')

const app = require('../../app')

beforeAll(done => helpers.startServer(done, app))
afterAll(done => helpers.stopServer(done, app))

describe('Stapsher:integration:encrypt', () => {
  let string = 'Ernest Thornhill'
  let endpoint = `/encrypt/${string}`

  it('encrypts string correctly', async () => {
    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)
    let encryptedString = await res.text()

    expect(res.headers.get('content-type')).toMatch(/text\/plain/)
    expect(encryptedString).not.toBe(string)
    expect(decrypt(encryptedString)).toBe(string)
  })
})
