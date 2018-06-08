const helpers = require('../../../__tests__/helpers')

const utils = require('../utils')
utils.validateFields = jest.fn(o => o)

const Stapsher = require('../../Stapsher')

let mockConfig = {}

describe('libs/Stapsher:__validateFields', () => {
  const parameters = helpers.getParameters()

  let fields
  let stapsher
  beforeEach(() => {
    mockConfig = helpers.readConfigFile()[parameters.entryType]
    fields = helpers.getFields()

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => mockConfig[key]
    }
  })

  it('calls necessary functions', () => {
    stapsher.__validateFields(fields)

    expect(utils.validateFields).toHaveBeenCalledTimes(1)
    expect(utils.validateFields).toHaveBeenCalledWith(
      fields,
      mockConfig['allowedFields'],
      mockConfig['requiredFields']
    )
  })

  it('returns validated fields', () => {
    expect(stapsher.__validateFields(fields)).toEqual(fields)
  })
})
