const helpers = require('../../../__tests__/helpers')

const utils = require('../utils')
utils.applyTransforms = jest.fn(o => ({ ...o, email: 'transformedEmail' }))

const Stapsher = require('../../Stapsher')

let mockConfig = {}
let initialFields = { ...helpers.getFields() }

describe('libs/Stapsher:__applyTransforms', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    mockConfig = helpers.readConfigFile()[parameters.entryType]

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => mockConfig[key]
    }

    stapsher.fields = { ...initialFields }
  })

  it('calls necessary functions', () => {
    stapsher.__applyTransforms()

    expect(utils.applyTransforms).toHaveBeenCalledTimes(1)
    expect(utils.applyTransforms).toHaveBeenCalledWith(
      initialFields,
      mockConfig['transforms']
    )
  })

  it('mutates fields', () => {
    expect(stapsher.fields).toEqual(initialFields)

    stapsher.__applyTransforms()

    expect(stapsher.fields).not.toEqual(initialFields)
    expect(stapsher.fields).toEqual(utils.applyTransforms(initialFields))
  })
})
