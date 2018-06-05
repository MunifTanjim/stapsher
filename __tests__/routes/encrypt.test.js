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

describe('Stapsher:routes:encrypt', () => {
  let port = config.get('port')

  it('endpoint /encrypt/{string}', async () => {
    let string = 'Ernest Thornhill'
    let res = await fetch(`http://localhost:${port}/encrypt/${string}`)
    expect(res.headers.get('content-type')).toMatch(/text\/plain/)
    expect(await res.text()).not.toBe(string)
  })
})
