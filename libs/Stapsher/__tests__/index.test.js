const mockId = '7w0.z3r0.7w0.53v3n'
const mockDate = new Date()

jest.mock('uuid/v1', () => () => mockId)

/* eslint no-global-assign:off */
Date = class extends Date {
  constructor() {
    return mockDate
  }
}

const Stapsher = require('../../Stapsher')

const configPath = 'stapsher.yaml'

const params = {
  username: 'Harold',
  repository: 'TheMachine',
  branch: 'master',
  entryType: 'comment',
  platform: 'github',
  platformBaseUrl: 'https://stapsher.test'
}

let stapsher

beforeEach(() => {
  stapsher = new Stapsher(params)
})

describe('Stapsher', () => {
  describe('constructor', () => {
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
        username: params.username,
        repository: params.repository,
        branch: params.branch
      })
    })

    it('sets entryType', () => {
      expect(stapsher.entryType).toBe(params.entryType)
    })

    it(`sets configPath to ${configPath}`, () => {
      expect(stapsher.configPath).toBe(configPath)
    })
  })

  describe('addExtraInfo', () => {
    it('works', () => {
      let musicObject = { music: 'Welcome to the Machine' }
      let artistObject = { artist: 'Pink Floyd' }

      stapsher.addExtraInfo(musicObject)
      expect(stapsher.extraInfo).toEqual({ ...musicObject })

      stapsher.addExtraInfo(artistObject)
      expect(stapsher.extraInfo).toEqual({ ...musicObject, ...artistObject })
    })
  })
})
