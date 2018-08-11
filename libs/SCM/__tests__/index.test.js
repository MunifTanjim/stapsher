const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

const { StapsherError } = require('../../Error')

const GitHub = require('../GitHub')

const SCM = require('../../SCM')

describe('libs/SCM', () => {
  let parameters = helpers.getParameters()

  it('returns instance of platform provider', () => {
    expect(SCM({ ...parameters, platform: 'github' })).toBeInstanceOf(GitHub)
  })

  it('throws error if platform not supported', () => {
    try {
      SCM({ ...parameters, platform: 'facebook' })
    } catch (err) {
      expect(err).toBeInstanceOf(StapsherError)
      expect(err).toMatchSnapshot()
    }
  })
})
