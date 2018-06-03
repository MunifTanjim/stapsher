const _ = require('lodash')
const yaml = require('js-yaml')
const uuidv1 = require('uuid/v1')

const { hash } = require('../Crypto')
const { throwError } = require('../Error')
const { akismetCheckSpam } = require('../Akismet')

const { loadConfig } = require('../../configs/client')

const {
  formatDate,
  getContentDump,
  resolvePlaceholder,
  getFormatExtension,
  trimObjectStringEntries,
  generatePullRequestBody,
  getPlatformConstructor
} = require('./utils')

class Stapsher {
  constructor({
    username,
    repository,
    branch,
    entryType,
    platform,
    platformBaseUrl
  }) {
    this._id = uuidv1()
    this._date = new Date()

    this.entryType = entryType
    this.info = {
      username,
      repository,
      branch
    }

    this.extraInfo = {}

    this.platform = new getPlatformConstructor(platform)(
      this.info,
      platformBaseUrl
    )

    this.configPath = 'stapsher.yaml'
    this.config = null

    this.rawFields = null
    this.fields = null
    this.options = null
  }

  async authenticate() {
    try {
      return this.platform.authenticate()
    } catch (err) {
      throw err
    }
  }

  addExtraInfo(infoObject) {
    this.extraInfo = { ...this.extraInfo, ...infoObject }
  }

  async getConfig(force = false) {
    try {
      if (this.config && !force) {
        return this.config
      }

      let blob = await this.platform.readFile(this.configPath)

      let data = yaml.safeLoad(blob, 'utf8')

      let config = data[this.entryType]

      await this._validateConfig(config)

      if (config.branch !== this.info.branch) {
        throwError(
          'BRANCH_MISMATCH',
          { api: this.info.branch, config: config.branch },
          422
        )
      }

      return loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  async _validateConfig(config) {
    try {
      if (!config) {
        throwError('MISSING_CONFIG_BLOCK', { entryType: this.entryType }, 400)
      }

      let requiredOptions = ['allowedFields', 'branch', 'format', 'path']

      let missingOptions = requiredOptions.filter(option =>
        _.isUndefined(config[option])
      )

      if (missingOptions.length) {
        throwError('MISSING_CONFIG_OPTIONS', { options: missingOptions }, 400)
      }

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

      if (missingRequiredFields.length) {
        throwError('MISSING_REQUIRED_FIELDS', { missingRequiredFields }, 400)
      }

      let allowedFields = this.config.get('allowedFields')
      let notAllowedFields = Object.keys(fields).filter(
        field => !allowedFields.includes(field) && fields[field] !== ''
      )

      if (notAllowedFields.length) {
        throwError('FIELDS_NOT_ALLOWED', { notAllowedFields }, 400)
      }

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

            if (!algorithm) {
              throwError('MISSING_HASH_ALGORITHM', { field, transform }, 422)
            }

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

  async _checkRecaptcha() {
    try {
      if (!this.config.get('recaptcha.enable')) return true

      await recaptcha(
        config.get('recaptcha.secretKey'),
        this.extraInfo.recaptchaResponse,
        this.extraInfo.clientIP
      )

      return true
    } catch (err) {
      throwError('RECAPTCHA_ERROR', err, 400)
    }
  }

  async _throwSpam() {
    try {
      if (!this.config.get('akismet.enable')) return true

      let entryObject = {
        user_ip: this.extraInfo.clientIP,
        user_agent: this.extraInfo.clientUserAgent,
        referrer: this.extraInfo.clientReferrer,
        permalink: '',
        comment_type: this.config.get('akismet.type'),
        comment_author: this.fields[this.config.get('akismet.fields.author')],
        comment_author_email: this.fields[
          this.config.get('akismet.fields.authorEmail')
        ],
        comment_author_url: this.fields[
          this.config.get('akismet.fields.authorUrl')
        ],
        comment_content: this.fields[this.config.get('akismet.fields.content')]
      }

      let spam = await akismetCheckSpam(
        config.get('akismet.apiKey'),
        config.get('akismet.siteUrl'),
        entryObject
      )

      if (spam) {
        throwError('AKISMET_IS_SPAM', { entryObject }, 400)
      }

      return true
    } catch (err) {
      throw err
    }
  }

  async processNewEntry(fields, options) {
    try {
      this.rawFields = { ...fields }
      this.options = { ...options }

      this.config = await this.getConfig()

      await this._checkRecaptcha()

      await this._throwSpam()

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

      if (this.config.get('moderation')) {
        let prBranch = `stapsher:${this.entryType}(${this._id})`

        let prBody = generatePullRequestBody(
          this.fields,
          this.config.get('pullRequestBody')
        )

        await this.platform.writeFileAndCreatePR(
          path,
          commitMessage,
          content,
          prBranch,
          prBody
        )
      } else {
        await this.platform.writeFile(path, commitMessage, content)
      }

      let result = { fields: this.fields }

      if (this.options.redirect) {
        result.redirect = this.options.redirect.success
      }

      return result
    } catch (err) {
      if (this.options.redirect) {
        err.redirect = this.options.redirect.failure
      }

      throw err
    }
  }
}

module.exports = Stapsher
