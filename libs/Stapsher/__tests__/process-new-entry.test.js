const _ = require('lodash')
const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()
helpers.disableNetConnect()

helpers.mockDate()
helpers.mockUUIDv1()

jest.mock('../../GitHub')
const GitHub = require('../../GitHub')

const utils = require('../utils')
utils.trimObjectStringEntries = jest.fn(o => o)
utils.generatePullRequestBody = jest.fn(() => 'pull_request_body')

jest.mock('deep-sort-object')
const deepsort = require('deep-sort-object')
deepsort.mockImplementation(o => o)

const Stapsher = require('../../Stapsher')

let mockConfig = {}

Stapsher.prototype.getConfig = jest.fn(async () => ({
  get: key => _.get(mockConfig, key)
}))
Stapsher.prototype.__checkRecaptcha = jest.fn()
Stapsher.prototype.__throwSpam = jest.fn()
Stapsher.prototype.__validateFields = jest.fn(o => o)
Stapsher.prototype.__applyGeneratedFields = jest.fn()
Stapsher.prototype.__applyTransforms = jest.fn()
Stapsher.prototype.__applyInternalFields = jest.fn()

const parameters = helpers.getParameters()

let fields, options
let stapsher
beforeEach(() => {
  GitHub.mockClear()

  mockConfig = helpers.readConfigFile()[parameters.entryType]
  stapsher = new Stapsher(parameters)

  fields = { ...helpers.getFields() }
  options = { ...helpers.getOptions() }
})

describe('libs/Stapsher:processNewEntry', () => {
  it('calls necessary functions', async () => {
    await stapsher.processNewEntry(fields, options)

    expect(stapsher.__checkRecaptcha).toHaveBeenCalledTimes(1)
    expect(stapsher.__throwSpam).toHaveBeenCalledTimes(1)

    expect(utils.trimObjectStringEntries).toHaveBeenCalledTimes(1)
    expect(stapsher.__validateFields).toHaveBeenCalledTimes(1)

    expect(stapsher.__applyGeneratedFields).toHaveBeenCalledTimes(1)
    expect(stapsher.__applyTransforms).toHaveBeenCalledTimes(1)
    expect(stapsher.__applyInternalFields).toHaveBeenCalledTimes(1)

    expect(deepsort).toHaveBeenCalledTimes(1)
  })

  it('writes file directly if moderation is off', async () => {
    mockConfig = { ...mockConfig, moderation: false }

    await stapsher.processNewEntry(fields, options)

    expect(GitHub.mock.instances[0].writeFile).toHaveBeenCalledTimes(1)
    expect(GitHub.mock.instances[0].writeFile.mock.calls[0]).toMatchSnapshot()

    expect(GitHub.mock.instances[0].writeFileAndCreatePR).toHaveBeenCalledTimes(
      0
    )
  })

  it('creates pull request if moderation is on', async () => {
    mockConfig = { ...mockConfig, moderation: true }

    await stapsher.processNewEntry(fields, options)

    expect(GitHub.mock.instances[0].writeFile).toHaveBeenCalledTimes(0)

    expect(utils.generatePullRequestBody).toHaveBeenCalledTimes(1)
    expect(GitHub.mock.instances[0].writeFileAndCreatePR).toHaveBeenCalledTimes(
      1
    )
    expect(
      GitHub.mock.instances[0].writeFileAndCreatePR.mock.calls[0]
    ).toMatchSnapshot()
  })

  it('returns only fields if redirect options missing', async () => {
    let result = await stapsher.processNewEntry(fields, options)

    expect(result).toEqual({ fields })
  })

  it('returns fields with redirect if redirect options present', async () => {
    let redirect = { success: 'https://example.com/success' }
    options = { ...options, redirect }

    let result = await stapsher.processNewEntry(fields, options)

    expect(result).toEqual({ fields, redirect: redirect.success })
  })

  it('throws only error if redirect options missing', async () => {
    Stapsher.prototype.__checkRecaptcha.mockImplementationOnce(() => {
      throw new Error()
    })

    await stapsher.processNewEntry(fields, options).catch(err => {
      expect(err.redirect).toBeUndefined()
    })
  })

  it('throws error with redirect if redirect options present', async () => {
    Stapsher.prototype.__checkRecaptcha.mockImplementationOnce(() => {
      throw new Error()
    })

    let redirect = { failure: 'https://example.com/failure' }
    options = { ...options, redirect }

    await stapsher.processNewEntry(fields, options).catch(err => {
      expect(err.redirect).toBe(redirect.failure)
    })
  })
})
