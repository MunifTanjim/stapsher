const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

jest.mock('recaptcha-validator')
const recaptcha = require('recaptcha-validator')

const Stapsher = require('../../Stapsher')

const extraInfo = {
  clientIP: '127.0.0.1',
  recaptchaResponse: 'qwerty'
}

let mockConfig = {}

describe('libs/Stapsher:__checkRecaptcha', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    recaptcha.mockClear()

    mockConfig = { 'recaptcha.enable': true, 'recaptcha.secretKey': 'zxcvb' }

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => mockConfig[key]
    }

    stapsher.addExtraInfo(extraInfo)
  })

  it('returns early if recaptcha disabled', () => {
    mockConfig['recaptcha.enable'] = false

    stapsher.__checkRecaptcha()

    expect(recaptcha).toHaveBeenCalledTimes(0)
  })

  it('calls necessary functions', () => {
    stapsher.__checkRecaptcha()

    expect(recaptcha).toHaveBeenCalledTimes(1)
  })

  it('returns nothing if recaptcha is valid', () => {
    recaptcha.mockResolvedValueOnce()

    expect(stapsher.__checkRecaptcha()).resolves.toBeUndefined()
  })

  it('throws error if recaptcha is invalid', () => {
    recaptcha.mockRejectedValueOnce('test')

    expect(stapsher.__checkRecaptcha()).rejects.toMatchSnapshot()
  })
})
