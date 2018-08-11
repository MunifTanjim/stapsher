const yaml = require('js-yaml')

const { throwError } = require('../Error')

const parseFile = (blob, extension) => {
  try {
    switch (extension.toLowerCase()) {
      case 'json':
        return JSON.parse(blob)
      case 'yaml':
      case 'yml':
        return yaml.safeLoad(blob, 'utf8')
      default:
        throwError('UNSUPPORTED_EXTENSION', { extension }, 422)
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      throwError('FILE_PARSE_FAILED', err, 422)
    } else {
      throw err
    }
  }
}

module.exports.parseFile = parseFile
