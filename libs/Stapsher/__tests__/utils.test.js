const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

let mockDate = helpers.mockDate()
let mockId = helpers.mockUUIDv1()

const {
  applyGeneratedFields,
  applyInternalFields,
  applyTransforms,
  generatePullRequestBody,
  getContentDump,
  getFormatExtension,
  getNewFilePath,
  formatDate,
  resolvePlaceholders,
  trimObjectStringEntries,
  validateConfig,
  validateFields
} = require('../utils')

const dateFormat = require('dateformat')

const GitHub = require('../../SCM/GitHub')
const GitLab = require('../../SCM/GitLab')

describe('libs/Stapsher/utils', () => {
  describe('applyGeneratedFields', () => {
    let initialFields = helpers.getFields()

    let data = { date: mockDate }
    let generatedFields = {
      role: 'Analog Interface',
      ...helpers.readConfigFile()['comment']['generatedFields']
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
    let initialFields = helpers.getFields()

    let internalFields = { _id: mockId }

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
    let initialFields = helpers.getFields()

    let transformBlocks = helpers.readConfigFile()['comment']['transforms']

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
      transformBlocks.email = 'hash'

      try {
        applyTransforms(fields, transformBlocks)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })
  })

  describe('generatePullRequestBody', () => {
    let dataObject = helpers.getFields()

    it('works as expected', () => {
      expect(
        generatePullRequestBody(dataObject, 'pull_request_introduction')
      ).toMatchSnapshot()
    })
  })

  describe('getContentDump', () => {
    let dataObject = helpers.getFields()

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

  describe('formatDate', () => {
    helpers.unmockDate()
    let date = new Date()
    let unixMilliSeconds = date.getTime()
    let unixSeconds = Math.floor(date.getTime() / 1000)
    helpers.mockDate()

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
      _id: mockId,
      _date: mockDate,
      fields: helpers.getFields(),
      options: helpers.getOptions()
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
        resolvePlaceholders('{_id} {fields.author} {options.alias}', dictionary)
      ).toBe(`${_id} ${fields.author} ${options.alias}`)
    })

    it('resolves Object to empty string', () => {
      expect(resolvePlaceholders('{fields}', dictionary)).toBe('')
    })
  })

  describe('trimObjectStringEntries', () => {
    let object = {
      name: ' John Reese ',
      alias: '\n Primary Asset \n'
    }

    let trimmedObject = {
      name: 'John Reese',
      alias: 'Primary Asset'
    }

    it('trims string properties', () => {
      expect(trimObjectStringEntries(object)).toEqual(trimmedObject)
    })

    it("doesn't touch non-string properties", () => {
      let aliases = ['Wonder Boy ', ' Angel of Death']

      expect(
        trimObjectStringEntries({ ...object, aliases: [...aliases] })
      ).toEqual({ ...trimmedObject, aliases: [...aliases] })
    })
  })

  describe('validateConfig', () => {
    let configData, entryType
    beforeEach(() => {
      configData = helpers.readConfigFile()
      entryType = helpers.getParameters().entryType
    })

    it('detects missing config block', () => {
      entryType = 'dummy'

      expect(() => validateConfig(configData, entryType)).toThrow()
    })

    it('detects missing required options', () => {
      delete configData[entryType].allowedFields

      expect(() => validateConfig(configData, entryType)).toThrow()
    })

    it('resolves with valid config', () => {
      expect(validateConfig(configData, entryType)).toEqual(
        configData[entryType]
      )
    })
  })

  describe('validateFields', () => {
    let allowedFields = helpers.readConfigFile().comment.allowedFields
    let requiredFields = helpers.readConfigFile().comment.requiredFields

    let fields
    beforeEach(() => {
      fields = { ...helpers.getFields() }
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
