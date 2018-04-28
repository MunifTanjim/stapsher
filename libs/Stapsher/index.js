const _ = require('lodash')
const yaml = require('js-yaml')
const uuidv1 = require('uuid/v1')

const GitHub = _require('libs/GitHub')
const { hash } = _require('libs/Crypto')
const { throwError } = _require('libs/Error')

const { loadConfig } = _require('configs/client')

const {
  formatDate,
  resolvePlaceholder,
  getFormatExtension,
  trimObjectStringEntries,
  getContentDump
} = require('./utils')

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

  addExtraInfo(infoObject) {
    this.extraInfo = { ...this.extraInfo, ...infoObject }
  }

  async getConfig(force = false) {
    try {
      if (this.config && !force) return this.config

      let data = await this.github.readFile(this.configPath)

      let config = this.entryType ? data[this.entryType] : data

      await this._validateConfig(config)

      if (config.branch !== this.info.branch)
        throwError(
          'BRANCH_MISMATCH',
          { api: this.info.branch, config: config.branch },
          422,
          true
        )

      return loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  async _validateConfig(config) {
    try {
      if (!config)
        throwError(
          'MISSING_CONFIG_BLOCK',
          { entryType: this.entryType },
          400,
          true
        )

      let requiredOptions = ['allowedFields', 'branch', 'format', 'path']

      let missingOptions = requiredOptions.filter(option =>
        _.isUndefined(config[option])
      )

      if (missingOptions.length)
        throwError(
          'MISSING_CONFIG_OPTIONS',
          { options: missingOptions },
          400,
          true
        )

      return true
    } catch (err) {
      throw err
    }
  }

  async _validateFields(fields) {
    try {
      let requiredFields = this.config.get('requiredFields')

      let missingRequiredFields = requiredFields.filter(
        field => _.isUndefined(fields[field]) || fields[field] === ''
      )

      if (missingRequiredFields.length)
        throwError(
          'MISSING_REQUIRED_FIELDS',
          { missingRequiredFields },
          400,
          true
        )

      let allowedFields = this.config.get('allowedFields')
      let notAllowedFields = Object.keys(fields).filter(
        field => !allowedFields.includes(field) && fields[field] !== ''
      )

      if (notAllowedFields.length)
        throwError('FIELDS_NOT_ALLOWED', { notAllowedFields }, 400, true)

      return true
    } catch (err) {
      throw err
    }
  }

  async _applyGeneratedFields() {
    try {
      let generatedFields = this.config.get('generatedFields')

      if (!generatedFields) return true

      for (let [name, field] of Object.entries(generatedFields)) {
        if (_.isObject(field) && !_.isArray(field)) {
          let { options = {}, type } = field

          switch (type) {
            case 'date':
              this.fields[name] = formatDate(this._date, options.format)
              break
          }
        } else {
          this.fields[name] = field
        }
      }

      return true
    } catch (err) {
      throw err
    }
  }

  async _applyTransforms() {
    try {
      let transformBlocks = this.config.get('transforms')

      if (!transformBlocks) return true

      for (let [field, transforms] of Object.entries(transformBlocks)) {
        if (!this.fields[field]) continue

        transforms = Array.isArray(transforms) ? transforms : [transforms]

        transforms.forEach(transform => {
          if (transform.includes('hash')) {
            let [action, algorithm] = transform.split('~')

            if (!algorithm)
              throwError(
                'MISSING_HASH_ALGORITHM',
                { field, transform },
                422,
                true
              )

            this.fields[field] = hash(this.fields[field], algorithm)
          }
        })
      }

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

  _getNewFileContent() {
    try {
      let format = this.config.get('format')

      return getContentDump(this.fields, format)
    } catch (err) {
      throw err
    }
  }

  _getNewFilePath() {
    try {
      let path = this._resolvePlaceholders(this.config.get('path'))
      if (path.slice(-1) === '/') path = path.slice(0, -1)

      let format = this.config.get('format')

      let customFilename = this.config.get('filename')
      let filename = customFilename.length
        ? this._resolvePlaceholders(customFilename)
        : this._id

      let customExtension = this.config.get('extension')
      let extension = customExtension.length
        ? customExtension
        : getFormatExtension(format)

      return `${path}/${filename}.${extension}`
    } catch (err) {
      throw err
    }
  }

  _resolvePlaceholders(string) {
    try {
      let dictionary = {
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

  async processNewEntry(fields, options) {
    try {
      this.rawFields = { ...fields }
      this.options = { ...options }

      this.config = await this.getConfig()

      await this._validateFields(fields)

      this.fields = trimObjectStringEntries(fields)

      await this._applyGeneratedFields()
      await this._applyTransforms()
      await this._applyInternalFields()

      let content = this._getNewFileContent()
      let path = this._getNewFilePath()
      let commitMessage = this._resolvePlaceholders(
        this.config.get('commitMessage')
      )

      await this.github.writeFile(path, content, commitMessage)

      let result = { fields: this.fields }
      if (this.options.redirect) result.redirect = this.options.redirect.success

      return result
    } catch (err) {
      if (this.options.redirect) err.redirect = this.options.redirect.failure

      throw err
    }
  }
}

module.exports = Stapsher
