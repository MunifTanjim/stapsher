const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

const app = require('../../app')

let server

beforeAll(done => {
  server = helpers.startServer(done, app)
})

afterAll(done => {
  helpers.stopServer(done, server)
})

describe('Stapsher:routes:home', () => {
  let baseUrl = helpers.getBaseUrl()

  it.each(['/', '/v1'])('endpoint', async endpoint => {
    let res = await fetch(`${baseUrl}${endpoint}`)
    expect(res.status).toBe(200)
  })
})
