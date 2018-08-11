const helpers = require('../../../__tests__/helpers')

const Stapsher = require('../../Stapsher')

describe('libs/Stapsher:addInfo', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    stapsher = new Stapsher(parameters)
  })

  it('works as expected', () => {
    let musicObject = { music: 'Welcome to the Machine' }
    let artistObject = { artist: 'Pink Floyd' }

    expect(stapsher.info).toEqual({})

    stapsher.addInfo(musicObject)
    expect(stapsher.info).toEqual({ ...musicObject })

    stapsher.addInfo(artistObject)
    expect(stapsher.info).toEqual({ ...musicObject, ...artistObject })
  })
})
