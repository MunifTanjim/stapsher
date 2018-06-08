const _ = require('lodash')
const dateFormat = require('dateformat')
const markdownTable = require('markdown-table')
const yaml = require('js-yaml')

const GitHub = require('../GitHub')
const GitLab = require('../GitLab')

const { hash } = require('../Crypto')
const { throwError } = require('../Error')

/**
 * Returns fields merged with generatedFields
 * @param {Object} fields contains existing fields
 * @param {Object} generatedFields contains fields to be generated
 * @param {Object} data data needed for field generation
 */
const applyGeneratedFields = (fields, generatedFields, { date }) => {
  try {
    if (!generatedFields) {
      return fields
    }

    let newFields = { ...fields }

    for (let [name, field] of Object.entries(generatedFields)) {
      if (_.isObject(field) && !_.isArray(field)) {
        let { options = {}, type } = field

        switch (type) {
          case 'date':
            newFields[name] = formatDate(date, options.format)
            break
        }
      } else {
        newFields[name] = field
      }
    }

    return newFields
  } catch (err) {
    throw err
  }
}

/**
 * Returns fields merged with internalFields
 * @param {Object} fields contains existing fields
 * @param {Object} internalFields contains internal fields
 */
const applyInternalFields = (fields, internalFields) => {
  try {
    let newFields = { ...fields, ...internalFields }

    return newFields
  } catch (err) {
    throw err
  }
}

/**
 * Returns transformed fields
 * @param {Object} fields contains existing fields
 * @param {Object} transformBlocks contains transformations
 */
const applyTransforms = (fields, transformBlocks) => {
  try {
    if (!transformBlocks) {
      return fields
    }

    let newFields = { ...fields }

    for (let [field, transforms] of Object.entries(transformBlocks)) {
      if (!newFields[field]) continue

      transforms = Array.isArray(transforms) ? transforms : [transforms]

      transforms.forEach(transform => {
        if (transform.includes('hash')) {
          let algorithm = transform.split('~')[1] // 0: action

          if (!algorithm) {
            throwError('MISSING_HASH_ALGORITHM', { field, transform }, 422)
          }

          newFields[field] = hash(newFields[field], algorithm)
        }
      })
    }

    return newFields
  } catch (err) {
    throw err
  }
}

const generatePullRequestBody = (dataObject, introduction) => {
  let tableData = [['Field', 'Value']]

  for (let [field, value] of Object.entries(dataObject)) {
    tableData.push([field, value])
  }

  let body = `${introduction}\n${markdownTable(tableData)}`

  return body
}

const getContentDump = (dataObject, format = '') => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(dataObject, null, 2)
      case 'yaml':
      case 'yml':
        return yaml.safeDump(dataObject)
      default:
        throwError('UNSUPPORTED_FORMAT', { format }, 422)
    }
  } catch (err) {
    throw err
  }
}

const getFormatExtension = format => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return 'json'
      case 'yaml':
      case 'yml':
        return 'yaml'
      default:
        throwError('UNSUPPORTED_FORMAT', { format }, 422)
    }
  } catch (err) {
    throw err
  }
}

/**
 * Returns path for new file
 * @param {String} path
 * @param {String} filename
 * @param {String} extension
 * @param {String} format
 */
const getNewFilePath = (path, filename, extension, format) => {
  try {
    let resolvedPath = path.slice(-1) === '/' ? path.slice(0, -1) : path

    let resolvedExtension = extension || getFormatExtension(format)

    return `${resolvedPath}/${filename}.${resolvedExtension}`
  } catch (err) {
    throw err
  }
}

const GetPlatformConstructor = platform => {
  switch (platform.toLowerCase()) {
    case 'github':
      return GitHub
    case 'gitlab':
      return GitLab
    default:
      throwError('UNSUPPORTED_PLATFORM', { platform }, 400)
  }
}

const formatDate = (date, format = 'isoUtcDateTime') => {
  switch (format) {
    case 'unix':
    case 'unix-milliseconds':
      return date.getTime()
    case 'unix-seconds':
      return Math.floor(date.getTime() / 1000)
    default:
      return dateFormat(date, format)
  }
}

const resolvePlaceholders = (string, dictionary) => {
  try {
    let resolvedString = string.replace(
      /{(.*?)}/g,
      (_placeholder, property) => {
        if (property.includes('_date')) {
          let [key, format] = property.split('~')
          let date = _.get(dictionary, key)
          return formatDate(date, format || 'yyyy-mm-dd')
        }

        let value = _.get(dictionary, property, '')
        return _.isObject(value) ? '' : value
      }
    )

    return resolvedString
  } catch (err) {
    throw err
  }
}

const trimObjectStringEntries = object => {
  let newObject = {}

  for (let [key, value] of Object.entries(object)) {
    newObject[key] = _.isString(value) ? value.trim() : value
  }

  return newObject
}

const validateConfig = (configData, entryType) => {
  try {
    let config = configData[entryType]

    if (!config) {
      throwError('MISSING_CONFIG_BLOCK', { entryType }, 400)
    }

    let requiredOptions = ['allowedFields', 'branch', 'format', 'path']

    let missingOptions = requiredOptions.filter(option =>
      _.isUndefined(config[option])
    )

    if (missingOptions.length) {
      throwError('MISSING_CONFIG_OPTIONS', { options: missingOptions }, 400)
    }

    return config
  } catch (err) {
    throw err
  }
}

const validateFields = (fields, allowedFields, requiredFields) => {
  try {
    let missingRequiredFields = requiredFields.filter(
      field => _.isUndefined(fields[field]) || fields[field] === ''
    )

    if (missingRequiredFields.length) {
      throwError('MISSING_REQUIRED_FIELDS', { missingRequiredFields }, 400)
    }

    let notAllowedFields = Object.keys(fields).filter(
      field => !allowedFields.includes(field) && fields[field] !== ''
    )

    if (notAllowedFields.length) {
      throwError('FIELDS_NOT_ALLOWED', { notAllowedFields }, 400)
    }

    return fields
  } catch (err) {
    throw err
  }
}

module.exports = {
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
}
