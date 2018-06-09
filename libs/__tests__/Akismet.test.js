const nock = require('nock')

const helpers = require('../../__tests__/helpers')

helpers.disableNetConnect()
helpers.addSnapshotSerializers()

const { akismetCheckSpam, akismetVerify } = require('../Akismet')

const key = 'qwerty'
const blog = 'https://example.com'
const entryObject = {}

let scope

beforeEach(() => nock.cleanAll())

describe('libs/Akismet', () => {
  describe('akismetVerify', () => {
    it('handles valid response', async () => {
      scope = nock(/rest.akismet.com/)
        .post('/1.1/verify-key')
        .reply(200, 'valid')

      expect(await akismetVerify(key, blog)).toBe(true)
      expect(() => scope.done()).not.toThrow()
    })

    it('handles invalid response', async () => {
      scope = nock(/rest.akismet.com/)
        .post('/1.1/verify-key')
        .reply(200, 'invalid')

      expect(await akismetVerify(key, blog)).toBe(false)
      expect(() => scope.done()).not.toThrow()
    })

    it('handles errors', async () => {
      scope = nock(/rest.akismet.com/)
        .post('/1.1/verify-key')
        .reply(200, 'error')

      try {
        await akismetVerify(key, blog)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }

      expect(() => scope.done()).not.toThrow()
    })
  })

  describe('akismetCheckSpam', () => {
    it('handles spam true', async () => {
      scope = nock(RegExp(`${key}.rest.akismet.com`))
        .post('/1.1/comment-check')
        .reply(200, 'true')

      expect(await akismetCheckSpam(key, blog, entryObject)).toBe(true)
      expect(() => scope.done()).not.toThrow()
    })

    it('handles spam false', async () => {
      scope = nock(RegExp(`${key}.rest.akismet.com`))
        .post('/1.1/comment-check')
        .reply(200, 'false')

      expect(await akismetCheckSpam(key, blog, entryObject)).toBe(false)
      expect(scope.isDone()).toBe(true)
    })

    it('handles errors', async () => {
      scope = nock(RegExp(`${key}.rest.akismet.com`))
        .post('/1.1/comment-check')
        .reply(200, 'error')

      try {
        await akismetCheckSpam(key, blog, entryObject)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }

      expect(scope.isDone()).toBe(true)
    })
  })
})
