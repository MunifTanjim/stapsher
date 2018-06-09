const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

const app = require('../../app')

beforeAll(done => helpers.startServer(done, app))
afterAll(done => helpers.stopServer(done, app))

describe('Stapsher:integration:home', () => {
  it.each(['/', '/v1'])('endpoint', async endpoint => {
    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)
    expect(res.status).toBe(200)
  })
})
