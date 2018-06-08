const helpers = require('../../../__tests__/helpers')

helpers.mockDate()

const utils = require('../utils')
utils.applyGeneratedFields = jest.fn(o => ({ ...o, generatedField: true }))

const Stapsher = require('../../Stapsher')

let mockConfig = {}
let initialFields = { ...helpers.getFields() }

describe('libs/Stapsher:__applyGeneratedFields', () => {
  const parameters = helpers.getParameters()

  let data
  let stapsher
  beforeEach(() => {
    mockConfig = helpers.readConfigFile()[parameters.entryType]

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => mockConfig[key]
    }

    stapsher.fields = { ...initialFields }

    data = { date: stapsher._date }
  })

  it('calls necessary functions', () => {
    stapsher.__applyGeneratedFields()

    expect(utils.applyGeneratedFields).toHaveBeenCalledTimes(1)
    expect(utils.applyGeneratedFields).toHaveBeenCalledWith(
      initialFields,
      mockConfig['generatedFields'],
      data
    )
  })

  it('mutates fields', () => {
    expect(stapsher.fields).toEqual(initialFields)

    stapsher.__applyGeneratedFields()

    expect(stapsher.fields).not.toEqual(initialFields)
    expect(stapsher.fields).toEqual(utils.applyGeneratedFields(initialFields))
  })
})
