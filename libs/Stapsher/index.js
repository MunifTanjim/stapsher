const uuidv1 = require('uuid/v1')
const isUndefined = require('lodash.isundefined')
const isString = require('lodash.isstring')
const isObject = require('lodash.isobject')
const dateFormat = require('dateformat')
const yaml = require('js-yaml')
const _ = require('lodash')

const GitHub = _require('libs/GitHub')

const { respondError, throwError } = _require('libs/Error')
const { hash } = _require('libs/Crypto')

const { loadConfig } = _require('configs/client')

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

const getExtensionForFormat = format => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return 'json'
      case 'yaml':
      case 'yml':
        return 'yaml'
      case 'frontmatter':
        return 'md'
    }
  } catch (err) {
    throw err
  }
}

class Stapsher {
  constructor({ username, repository, branch, entryType = '' }) {
    this._id = uuidv1()
    this._date = new Date()

    this.entryType = entryType
    this.info = {
      username,
      repository,
      branch
    }

    this.extraInfo = {}

    this.github = new GitHub(this.info)

    this.configPath = 'stapsher.json'
    this.config = null

    this.rawFields = null
    this.fields = null
    this.options = null
  }

  async authenticate() {
    try {
      return this.github.authAsInstallation()
    } catch (err) {
      throw err
    }
  }

  async getConfig(force = false) {
    try {
      if (this.config && !force) return this.config

      let data = await this.github.readFile(this.configPath)

      let config = await this._validateConfig(data[this.entryType])

      if (config.branch !== this.info.branch)
        respondError('BRANCH_MISMATCH', 400, {
          api: this.info.branch,
          config: config.branch
        })

      return loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  async _validateConfig(config) {
    try {
      if (!config)
        throwError('MISSING_CONFIG_BLOCK', { for: this.entryType }, 400, true)

      let requiredOptions = ['allowedFields', 'branch', 'format', 'path']

      let missingOptions = []

      requiredOptions.forEach(option => {
        if (isUndefined(config[option])) missingOptions.push(option)
      })

      if (missingOptions.length)
        throwError(
          'MISSING_CONFIG_OPTIONS',
          { options: missingOptions },
          400,
          true
        )

      return config
    } catch (err) {
      throw err
    }
  }

  async _validateFields(fields) {
    try {
      let requiredFields = this.config.get('requiredFields')
      let missingRequiredFields = []

      requiredFields.forEach(field => {
        if (isUndefined(fields[field]) || fields[field] === '') {
          missingRequiredFields.push(field)
        }
      })

      if (missingRequiredFields.length)
        respondError('MISSING_REQUIRED_FIELDS', 400, { missingRequiredFields })

      let allowedFields = this.config.get('allowedFields')
      let notAllowedFields = []

      Object.keys(fields).forEach(field => {
        if (!allowedFields.includes(field) && fields[field] !== '') {
          notAllowedFields.push(field)
        }

        if (isString(fields[field])) {
          fields[field] = fields[field].trim()
        }
      })

      if (notAllowedFields.length)
        respondError('FIELDS_NOT_ALLOWED', 400, { notAllowedFields })

      return fields
    } catch (err) {
      throw err
    }
  }

  async _applyGeneratedFields() {
    try {
      let generatedFields = this.config.get('generatedFields')

      if (!generatedFields) return

      Object.keys(generatedFields).forEach(field => {
        let generatedField = generatedFields[field]

        if (_.isObject(generatedField) && !_.isArray(generatedField)) {
          let options = generatedField.options || {}

          switch (generatedField.type) {
            case 'date':
              this.fields[field] = formatDate(this._date, options.format)
              break
          }
        } else {
          this.fields[field] = generatedField
        }
      })

      return true
    } catch (err) {
      throw err
    }
  }

  async _applyTransforms() {
    try {
      let transforms = this.config.get('transforms')

      if (!transforms) return true

      Object.keys(transforms).forEach(field => {
        if (!this.fields[field]) return

        transforms[field] = Array.isArray(transforms[field])
          ? transforms[field]
          : [transforms[field]]

        transforms[field].forEach(transform => {
          if (transform.includes('hash')) {
            let algorithm = transform.split('~')[1]

            if (!algorithm)
              respondError('MISSING_HASH_ALGORITHM', 422, {
                field,
                transform
              })

            this.fields[field] = hash(this.fields[field], algorithm)
          }
        })
      })

      return true
    } catch (err) {
      throw err
    }
  }

  async _applyInternalFields() {
    try {
      let internalFields = { _id: this._id }

      this.fields = { ...internalFields, ...this.fields }

      return true
    } catch (err) {
      throw err
    }
  }

  async _createNewFile() {
    try {
      let format = this.siteConfig.get('format')

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(this.fields)
        case 'yaml':
        case 'yml':
          return yaml.safeDump(this.fields)
        default:
          respondError('UNSUPPORTED_FORMAT', 422, { format })
      }
    } catch (err) {
      throw err
    }
  }

  async _resolvePlaceholders(string) {
    try {
      dictionary = {
        _id: this._id,
        _date: this._date,
        fields: this.fields,
        options: this.options
      }

      let resolvedString = string.replace(/{(.*?)}/g, (placeholder, property) =>
        resolvePlaceholder(property, dictionary)
      )

      return resolvedString
    } catch (err) {
      throw err
    }
  }

  async _getNewFilePath() {
    try {
      let path = this._resolvePlaceholders(this.config.get('path'))
      if (path.slice(-1) === '/') path = path.slice(0, -1)

      let rawFilename = this.config.get('filename')
      let filename = this._id
      if (rawFilename && rawFilename.length)
        filename = this._resolvePlaceholders(rawFilename)

      let extension = this.config.get('extension')
      extension = extension.length
        ? extension
        : getExtensionForFormat(this.config.get('format'))

      return `${path}/${filename}.${extension}`
    } catch (err) {
      throw err
    }
  }

  addExtraInfo(info) {
    this.extraInfo = { ...this.extraInfo, ...info }
  }

  async processEntry(fields, options) {
    try {
      this.rawFields = { ...fields }
      this.options = { ...options }

      this.config = await this.getConfig()

      this.fields = await this._validateFields(fields)

      await this._applyGeneratedFields()
      await this._applyTransforms()
      await this._applyInternalFields()

      let fileContent = await this._createNewFile()
      let filePath = await this._getNewFilePath()
      let commitMessage = await this._resolvePlaceholders(
        this.siteConfig.get('commitMessage')
      )

      let result = await this.github.writeFile(
        filePath,
        fileContent,
        commitMessage
      )

      return {
        fields: this.fields
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = Stapsher
