const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

const app = require('../../app')

beforeAll(done => helpers.startServer(done, app))
afterAll(done => helpers.stopServer(done, app))

describe('Stapsher:integration:encrypt', () => {
  let string = 'Ernest Thornhill'
  let endpoint = `/encrypt/${string}`

  it('endpoint /encrypt/{string}', async () => {
    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)

    expect(res.headers.get('content-type')).toMatch(/text\/plain/)
    expect(await res.text()).not.toBe(string)
  })
})
