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

describe('Stapsher:routes:home', () => {
  let port = config.get('port')

  it.each(['/', '/v1'])('endpoint', async endpoint => {
    let res = await fetch(`http://localhost:${port}${endpoint}`)
    expect(res.status).toBe(200)
  })
})
