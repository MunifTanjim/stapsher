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

describe('Stapsher:routes:encrypt', () => {
  let baseUrl = helpers.getBaseUrl()

  it('endpoint /encrypt/{string}', async () => {
    let string = 'Ernest Thornhill'
    let res = await fetch(`${baseUrl}/encrypt/${string}`)
    expect(res.headers.get('content-type')).toMatch(/text\/plain/)
    expect(await res.text()).not.toBe(string)
  })
})
