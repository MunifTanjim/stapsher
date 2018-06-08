const helpers = require('../../../__tests__/helpers')

helpers.mockUUIDv1()

const utils = require('../utils')
utils.applyInternalFields = jest.fn(o => ({ ...o, internalField: true }))

const Stapsher = require('../../Stapsher')

let initialFields = { ...helpers.getFields() }

describe('libs/Stapsher:__applyInternalFields', () => {
  const parameters = helpers.getParameters()

  let internalFields
  let stapsher
  beforeEach(() => {
    stapsher = new Stapsher(parameters)

    stapsher.fields = { ...initialFields }

    internalFields = { _id: stapsher._id }
  })

  it('calls necessary functions', () => {
    stapsher.__applyInternalFields()

    expect(utils.applyInternalFields).toHaveBeenCalledTimes(1)
    expect(utils.applyInternalFields).toHaveBeenCalledWith(
      initialFields,
      internalFields
    )
  })

  it('mutates fields', () => {
    expect(stapsher.fields).toEqual(initialFields)

    stapsher.__applyInternalFields()

    expect(stapsher.fields).not.toEqual(initialFields)
    expect(stapsher.fields).toEqual(utils.applyInternalFields(initialFields))
  })
})
