const _ = require('lodash')
const yaml = require('js-yaml')
const dateFormat = require('dateformat')

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
        return JSON.stringify(dataObject)
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

module.exports = {
  formatDate,
  resolvePlaceholder,
  getFormatExtension,
  trimObjectStringEntries,
  getContentDump
}
