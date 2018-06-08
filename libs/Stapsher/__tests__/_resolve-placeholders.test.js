const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

helpers.mockDate()
helpers.mockUUIDv1()

const utils = require('../utils')
utils.resolvePlaceholders = jest.fn(() => 'resolved_string')

const Stapsher = require('../../Stapsher')

const string = 'string_with_{placeholders}'

describe('libs/Stapsher:__resolvePlaceholders', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    utils.resolvePlaceholders.mockClear()

    stapsher = new Stapsher(parameters)

    stapsher.fields = { ...helpers.getFields() }
    stapsher.options = { ...helpers.getOptions() }
  })

  it('sets the dictionary if it does not exist', () => {
    expect(stapsher.dictionary).toBeNull()

    stapsher.__resolvePlaceholders(string)

    expect(stapsher.dictionary).not.toBeNull()
    expect(stapsher.dictionary).toMatchSnapshot()
  })

  it('does not set the dictionary if it exists', () => {
    let dictionary = { exists: true }
    stapsher.dictionary = { ...dictionary }

    expect(stapsher.dictionary).not.toBeNull()

    stapsher.__resolvePlaceholders(string)

    expect(stapsher.dictionary).toEqual(dictionary)
  })

  it('calls necessary functions', () => {
    stapsher.__resolvePlaceholders(string)

    expect(utils.resolvePlaceholders).toHaveBeenCalledTimes(1)
    expect(utils.resolvePlaceholders).toHaveBeenCalledWith(
      string,
      stapsher.dictionary
    )
  })

  it('returns resolved string', () => {
    expect(stapsher.__resolvePlaceholders(string)).toBe(
      utils.resolvePlaceholders()
    )
  })
})
