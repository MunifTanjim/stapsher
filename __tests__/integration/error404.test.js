const fetch = require('node-fetch')

require('./helpers/init')
const helpers = require('../helpers')

const app = require('../../app')

beforeAll(done => helpers.startServer(done, app))
afterAll(done => helpers.stopServer(done, app))

describe('Stapsher:integration:error404', () => {
  let endpoint = '/non-existent-path'

  it('responds correctly for 404 error', async () => {
    let res = await fetch(`${app.get('baseUrl')}${endpoint}`)
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toMatch(/application\/json/)
    expect(await res.json()).toMatchSnapshot()
  })
})
