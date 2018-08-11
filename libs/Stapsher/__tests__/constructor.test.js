const helpers = require('../../../__tests__/helpers')

const mockId = helpers.mockUUIDv1()
const mockDate = helpers.mockDate()

jest.mock('../../SCM')
const SCM = require('../../SCM')
SCM.mockImplementation(() => true)

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

  it('sets entryType', () => {
    expect(stapsher.entryType).toBe(parameters.entryType)
  })

  it('has empty info', () => {
    expect(stapsher.info).toEqual({})
  })

  it('sets scmInfo', () => {
    expect(stapsher.scmInfo).toEqual({
      platform: parameters.platform,
      baseUrl: parameters.platformBaseUrl,
      username: parameters.username,
      repository: parameters.repository,
      branch: parameters.branch
    })
  })

  it('sets scm', () => {
    expect(SCM).toHaveBeenCalledWith(stapsher.scmInfo)
    expect(stapsher.scm).toBe(SCM.mock.results[0].value)
  })

  it(`sets configPath to ${configPath}`, () => {
    expect(stapsher.configPath).toBe(configPath)
  })
})
