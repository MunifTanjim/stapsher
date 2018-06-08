const { addSnapshotSerializers } = require('../../../__tests__/helpers')

const {
  applyGeneratedFields,
  applyInternalFields,
  applyTransforms,
  generatePullRequestBody,
  getContentDump,
  getFormatExtension,
  getNewFilePath,
  GetPlatformConstructor,
  formatDate,
  resolvePlaceholders,
  trimObjectStringEntries,
  validateConfig,
  validateFields
} = require('../utils')

const dateFormat = require('dateformat')

const GitHub = require('../../GitHub')
const GitLab = require('../../GitLab')

addSnapshotSerializers()

describe('Stapsher:utils', () => {
  describe('applyGeneratedFields', () => {
    let initialFields = { name: 'Harold' }

    let data = { date: new Date(0) }
    let generatedFields = {
      role: 'admin',
      timestamp: {
        type: 'date',
        options: {
          format: 'unix'
        }
      }
    }

    let fields
    beforeEach(() => {
      fields = { ...initialFields }
    })

    it('returns fields as-is if generatedFields is missing', () => {
      let newFields = applyGeneratedFields(fields, null, data)
      expect(newFields).toEqual(fields)
    })

    it('generates new fields', () => {
      let newFields = applyGeneratedFields(fields, generatedFields, data)
      expect(newFields).toMatchSnapshot()
    })

    it('is pure function', () => {
      applyGeneratedFields(fields, generatedFields, data)
      expect(fields).toEqual(initialFields)
    })
  })

  describe('applyInternalFields', () => {
    let initialFields = { name: 'Harold' }

    let internalFields = { _id: '7w0.z3r0.7w0.53v3n' }

    let fields
    beforeEach(() => {
      fields = { ...initialFields }
    })

    it('adds internal fields', () => {
      let newFields = applyInternalFields(fields, internalFields)
      expect(newFields).toMatchObject(internalFields)
      expect(newFields).toMatchSnapshot()
    })

    it('is pure function', () => {
      applyInternalFields(fields, internalFields)
      expect(fields).toEqual(initialFields)
    })
  })

  describe('applyTransforms', () => {
    let initialFields = { name: 'Harold' }

    let transformBlocks = {
      name: 'hash~md5'
    }

    let fields
    beforeEach(() => {
      fields = { ...initialFields }
    })

    it('returns fields as-is if transformBlocks is missing', () => {
      let newFields = applyTransforms(fields, null)
      expect(newFields).toEqual(fields)
    })

    it('transforms fields', () => {
      let newFields = applyTransforms(fields, transformBlocks)
      expect(newFields).toMatchSnapshot()
    })

    it('is pure function', () => {
      applyTransforms(fields, transformBlocks)
      expect(fields).toEqual(initialFields)
    })

    it('throws error if hash algorithm is missing', () => {
      transformBlocks.name = 'hash'

      try {
        applyTransforms(fields, transformBlocks)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })
  })

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

    it('throws error if unsupported format', () => {
      try {
        getFormatExtension('snap')
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })
  })

  describe('getNewFilePath', () => {
    let path = '/test/path'
    let filename = 'data'
    let extension = 'comment.yml'
    let format = 'yml'

    it('strips trailing slash from path', () => {
      expect(getNewFilePath(`${path}/`, filename, extension, format)).toBe(
        getNewFilePath(path, filename, extension, format)
      )
    })

    it('uses extension', () => {
      expect(
        getNewFilePath(path, filename, extension, format)
      ).toMatchSnapshot()
    })

    it('uses format to get fallback extension', () => {
      expect(getNewFilePath(path, filename, '', format)).toMatchSnapshot()
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

    it('throws error if unsupported platform', () => {
      try {
        GetPlatformConstructor('facebook')
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
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

  describe('resolvePlaceholders', () => {
    let dictionary = {
      _id: '2.0.2.7',
      _date: new Date(0),
      fields: { name: 'John' },
      options: { alias: 'Wonder Boy' }
    }

    it('resolves _date, w and w/o format', () => {
      expect(resolvePlaceholders('{_date}', dictionary)).toBe(
        String(formatDate(dictionary._date, 'yyyy-mm-dd'))
      )

      expect(resolvePlaceholders('{_date~unix}', dictionary)).toBe(
        String(formatDate(dictionary._date, 'unix'))
      )
    })

    it('resolves placeholders in string', () => {
      let { _id, fields, options } = dictionary
      expect(
        resolvePlaceholders('{_id} {fields.name} {options.alias}', dictionary)
      ).toBe(`${_id} ${fields.name} ${options.alias}`)
    })

    it('resolves Object to empty string', () => {
      expect(resolvePlaceholders('{fields}', dictionary)).toBe('')
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
      expect(() => validateConfig(configData, entryType)).toThrow()
    })

    it('detects missing required options', () => {
      delete configData.allowedFields
      expect(() =>
        validateConfig(
          { comment: { branch: '', format: '', path: '' } },
          entryType
        )
      ).toThrow()
    })

    it('resolves with valid config', () => {
      expect(validateConfig(configData, entryType)).toEqual(
        configData[entryType]
      )
    })
  })

  describe('validateFields', () => {
    let allowedFields = ['author', 'content', 'email', 'url']
    let requiredFields = ['author', 'content', 'email']

    let fields
    beforeEach(() => {
      fields = {
        author: 'Author',
        content: 'Comment',
        email: 'author@example.com',
        url: 'https://author.example.com'
      }
    })

    it('throws if missing required fields', () => {
      delete fields.email

      try {
        validateFields(fields, allowedFields, requiredFields)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })

    it('throws if fields not allowed', () => {
      fields = { ...fields, rogue: true }

      try {
        validateFields(fields, allowedFields, requiredFields)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })

    it('resolves with valid fields', async () => {
      expect(
        await validateFields(fields, allowedFields, requiredFields)
      ).toEqual(fields)
    })
  })
})
