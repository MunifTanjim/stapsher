const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

helpers.mockDate()
helpers.mockUUIDv1()

const utils = require('../utils')
utils.getNewFilePath = jest.fn(() => 'new/file/path')

const Stapsher = require('../../Stapsher')

let mockConfig = {}

describe('libs/Stapsher:__getNewFilePath', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    mockConfig = helpers.readConfigFile()[parameters.entryType]

    stapsher = new Stapsher(parameters)

    stapsher.config = {
      get: key => mockConfig[key]
    }
  })

  it('calls necessary functions', () => {
    stapsher.__getNewFilePath()

    expect(utils.getNewFilePath).toHaveBeenCalledTimes(1)
    expect(utils.getNewFilePath.mock.calls[0]).toMatchSnapshot()
  })

  it('returns file path', () => {
    expect(stapsher.__getNewFilePath()).toEqual(utils.getNewFilePath())
  })
})
