const _ = require('lodash')
const dateFormat = require('dateformat')
const markdownTable = require('markdown-table')
const yaml = require('js-yaml')

const GitHub = require('../GitHub')
const GitLab = require('../GitLab')

const { throwError } = require('../Error')

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

const resolvePlaceholder = (property, dictionary) => {
  try {
    if (property.includes('_date')) {
      let [key, format] = property.split('~')
      let date = _.get(dictionary, key)
      return formatDate(date, format || 'yyyy-mm-dd')
    }

    let value = _.get(dictionary, property, '')

    return _.isObject(value) ? '' : value
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

const validateConfig = async (configData, { entryType }) => {
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

const validateFields = async (fields, { config }) => {
  try {
    let requiredFields = config.get('requiredFields')

    let missingRequiredFields = requiredFields.filter(
      field => _.isUndefined(fields[field]) || fields[field] === ''
    )

    if (missingRequiredFields.length) {
      throwError('MISSING_REQUIRED_FIELDS', { missingRequiredFields }, 400)
    }

    let allowedFields = config.get('allowedFields')

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
  generatePullRequestBody,
  getContentDump,
  getFormatExtension,
  GetPlatformConstructor,
  formatDate,
  resolvePlaceholder,
  trimObjectStringEntries,
  validateConfig,
  validateFields
}
