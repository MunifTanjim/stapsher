const helpers = require('../../../__tests__/helpers')

const mockId = helpers.mockUUIDv1()
const mockDate = helpers.mockDate()

const Stapsher = require('../../Stapsher')

describe('libs/Stapsher:constructor', () => {
  const configPath = 'stapsher.yaml'
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    stapsher = new Stapsher(parameters)
  })

  it('can be instantiated', () => {
    expect(stapsher).toBeInstanceOf(Stapsher)
  })

  it('sets unique id', () => {
    expect(stapsher._id).toBe(mockId)
  })

  it('sets current date', () => {
    expect(stapsher._date).toBe(mockDate)
  })

  it('sets info', () => {
    expect(stapsher.info).toEqual({
      username: parameters.username,
      repository: parameters.repository,
      branch: parameters.branch
    })
  })

  it('sets entryType', () => {
    expect(stapsher.entryType).toBe(parameters.entryType)
  })

  it(`sets configPath to ${configPath}`, () => {
    expect(stapsher.configPath).toBe(configPath)
  })
})
