const _ = require('lodash')
const yaml = require('js-yaml')
const dateFormat = require('dateformat')
const markdownTable = require('markdown-table')

const GitHub = _require('libs/GitHub')
const GitLab = _require('libs/GitLab')

const getPlatformConstructor = platform => {
  switch (platform.toLowerCase()) {
    case 'github':
      return GitHub
    case 'gitlab':
      return GitLab
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

const getFormatExtension = format => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return 'json'
      case 'yaml':
      case 'yml':
        return 'yaml'
      default:
        throwError('UNSUPPORTED_FORMAT', { format }, 422, true)
    }
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

const getContentDump = (dataObject, format) => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(dataObject, null, 2)
      case 'yaml':
      case 'yml':
        return yaml.safeDump(dataObject)
      default:
        throwError('UNSUPPORTED_FORMAT', { format }, 422, true)
    }
  } catch (err) {
    throw err
  }
}

const generatePullRequestBody = (dataObject, introduction) => {
  let tableData = [['Field', 'Value']]

  for (let [field, value] of Object.entries(dataObject))
    tableData.push([field, value])

  let body = introduction + '\n' + markdownTable(tableData)

  return body
}

module.exports = {
  formatDate,
  getContentDump,
  resolvePlaceholder,
  getFormatExtension,
  trimObjectStringEntries,
  generatePullRequestBody,
  getPlatformConstructor
}
