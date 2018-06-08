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

describe('Stapsher:routes:error404', () => {
  let baseUrl = helpers.getBaseUrl()

  it('responds correctly for 404 error', async () => {
    let res = await fetch(`${baseUrl}/non-existent-path`)
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toMatch(/application\/json/)
    expect(await res.json()).toMatchSnapshot()
  })
})
