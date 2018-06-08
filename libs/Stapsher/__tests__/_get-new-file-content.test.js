const helpers = require('../../../__tests__/helpers')

const utils = require('../utils')
utils.getContentDump = jest.fn(() => 'content_dump')

const Stapsher = require('../../Stapsher')

let mockConfig = {}
let initialFields = { ...helpers.getFields() }

describe('libs/Stapsher:__getNewFileContent', () => {
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
    stapsher.__getNewFileContent()

    expect(utils.getContentDump).toHaveBeenCalledTimes(1)
    expect(utils.getContentDump).toHaveBeenCalledWith(
      stapsher.fields,
      mockConfig['format']
    )
  })

  it('returns content dump', () => {
    expect(stapsher.__getNewFileContent()).toEqual(utils.getContentDump())
  })
})
