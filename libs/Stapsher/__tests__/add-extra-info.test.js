const helpers = require('../../../__tests__/helpers')

const Stapsher = require('../../Stapsher')

describe('libs/Stapsher:addExtraInfo', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    stapsher = new Stapsher(parameters)
  })

  it('works', () => {
    let musicObject = { music: 'Welcome to the Machine' }
    let artistObject = { artist: 'Pink Floyd' }

    stapsher.addExtraInfo(musicObject)
    expect(stapsher.extraInfo).toEqual({ ...musicObject })

    stapsher.addExtraInfo(artistObject)
    expect(stapsher.extraInfo).toEqual({ ...musicObject, ...artistObject })
  })
})
