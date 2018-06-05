require('./helpers/init')

const { startServer, stopServer } = require('../helpers')

const fetch = require('node-fetch')

const config = require('../../configs/server')
const app = require('../../app')

let server

beforeAll(done => {
  server = startServer(done, app)
})

afterAll(done => {
  stopServer(done, server)
})

describe('Stapsher:routes:error404', () => {
  let port = config.get('port')

  it('responds correctly for 404 error', async () => {
    let res = await fetch(`http://localhost:${port}/non-existent-path`)
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toMatch(/application\/json/)
    expect(await res.json()).toMatchSnapshot()
  })
})
