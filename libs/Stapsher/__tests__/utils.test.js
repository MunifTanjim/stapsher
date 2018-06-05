const { addSnapshotSerializers } = require('../../../__tests__/helpers')

const {
  generatePullRequestBody,
  getContentDump,
  getFormatExtension,
  GetPlatformConstructor,
  formatDate,
  resolvePlaceholder,
  trimObjectStringEntries,
  validateConfig,
  validateFields
} = require('../utils')

const dateFormat = require('dateformat')

const GitHub = require('../../GitHub')
const GitLab = require('../../GitLab')

addSnapshotSerializers()

describe('Stapsher:utils', () => {
  describe('generatePullRequestBody', () => {
    it('works as expected', () => {
      expect(
        generatePullRequestBody({ name: 'John' }, 'PullRequest')
      ).toMatchSnapshot()
    })
  })

  describe('getContentDump', () => {
    let dataObject = { name: 'John' }

    it.each(['json', 'yaml'])('returns dump for format', format => {
      expect(getContentDump(dataObject, format)).toMatchSnapshot()
    })

    it('treats yml as yaml', () => {
      expect(getContentDump(dataObject, 'yml')).toBe(
        getContentDump(dataObject, 'yaml')
      )
    })

    it('supports case-insensitive format', () => {
      expect(getContentDump(dataObject, 'JSON')).toBe(
        getContentDump(dataObject, 'json')
      )
    })

    it('throws error if format unsupported', () => {
      expect(() => getContentDump(dataObject, 'dummy')).toThrowError(
        /^UNSUPPORTED_FORMAT$/
      )
    })
  })

  describe('getFormatExtension', () => {
    it.each([['json', 'json'], ['yaml', 'yaml'], ['yml', 'yaml']])(
      'returns correct extension for',
      (format, extension) => {
        expect(getFormatExtension(format)).toBe(extension)
      }
    )

    it('supports case-insensitive format', () => {
      expect(getFormatExtension('JSON')).toBe(getFormatExtension('json'))
    })
  })

  describe('GetPlatformConstructor', () => {
    it.each([['github', GitHub], ['gitlab', GitLab]])(
      'returns correct Constructor for',
      (platform, constructor) => {
        expect(GetPlatformConstructor(platform)).toBe(constructor)
      }
    )

    it('supports case-insensitive platform', () => {
      expect(GetPlatformConstructor('GITHUB')).toBe(
        GetPlatformConstructor('github')
      )
    })
  })

  describe('formatDate', () => {
    let date = new Date()
    let unixMilliSeconds = date.getTime()
    let unixSeconds = Math.floor(date.getTime() / 1000)

    it.each([
      ['unix-milliseconds', unixMilliSeconds],
      ['unix-seconds', unixSeconds]
    ])('supports unix formats', (format, formattedDate) => {
      expect(formatDate(date, format)).toBe(formattedDate)
    })

    it('treats format unix as unix-milliseconds', () => {
      expect(formatDate(date, 'unix')).toBe(
        formatDate(date, 'unix-milliseconds')
      )
    })

    it("supports dateformat package's formats", () => {
      let format = 'yyyy-mm-dd'
      expect(formatDate(date, format)).toBe(dateFormat(date, format))
    })
  })

  describe('resolvePlaceholder', () => {
    let dictionary = {
      _id: '2.0.2.7',
      _date: new Date(),
      fields: { name: 'John' },
      options: { alias: 'Wonder Boy' }
    }

    it('resolves _date, w and w/o format', () => {
      expect(resolvePlaceholder('_date', dictionary)).toBe(
        formatDate(dictionary._date, 'yyyy-mm-dd')
      )

      expect(resolvePlaceholder('_date~unix', dictionary)).toBe(
        formatDate(dictionary._date, 'unix')
      )
    })

    it.each([
      ['_id', dictionary._id],
      ['fields.name', dictionary.fields.name],
      ['options.alias', dictionary.options.alias]
    ])('resolves , ', (property, resolvedValue) => {
      expect(resolvePlaceholder(property, dictionary)).toBe(resolvedValue)
    })

    it('resolves Object to empty string', () => {
      expect(resolvePlaceholder('fields', dictionary)).toBe('')
    })
  })

  describe('trimObjectStringEntries', () => {
    let object = {
      name: ' John Reese ',
      alias: '\nWonder Boy\n'
    }

    let trimmedObject = {
      name: 'John Reese',
      alias: 'Wonder Boy'
    }

    it('trims string properties', () => {
      expect(trimObjectStringEntries(object)).toEqual(trimmedObject)
    })

    it("doesn't touch non-string properties", () => {
      expect(
        trimObjectStringEntries({ ...object, status: [' Primary Asset '] })
      ).toEqual({ ...trimmedObject, status: [' Primary Asset '] })
    })
  })

  describe('validateConfig', () => {
    let configData, entryType

    beforeEach(() => {
      configData = {
        comment: { allowedFields: [], branch: '', format: '', path: '' }
      }
      entryType = 'comment'
    })

    it('detects missing config block', () => {
      entryType = 'message'
      return expect(validateConfig(configData, { entryType })).rejects.toThrow()
    })

    it('detects missing required options', () => {
      delete configData.allowedFields
      return expect(
        validateConfig(
          { comment: { branch: '', format: '', path: '' } },
          { entryType }
        )
      ).rejects.toThrow()
    })

    it('resolves with valid config', () => {
      return expect(validateConfig(configData, { entryType })).resolves.toEqual(
        configData[entryType]
      )
    })
  })

  describe('validateFields', () => {
    let mockConfigMap = {
      requiredFields: ['author', 'comment', 'email'],
      allowedFields: ['author', 'comment', 'email', 'site']
    }

    let config = {
      get: key => mockConfigMap[key]
    }

    let fields

    beforeEach(() => {
      fields = {
        author: 'Author',
        comment: 'Comment',
        email: 'author@example.com',
        site: 'https://author.example.com'
      }
    })

    it('throws if missing required fields', async () => {
      delete fields.email

      await validateFields(fields, { config }).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })

    it('throws if fields not allowed', async () => {
      fields = { ...fields, rogue: true }

      await validateFields(fields, { config }).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })

    it('resolves with valid fields', async () => {
      expect(await validateFields(fields, { config })).toEqual(fields)
    })
  })
})
