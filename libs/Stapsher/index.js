const deepsort = require('deep-sort-object')
const uuidv1 = require('uuid/v1')
const recaptcha = require('recaptcha-validator')

const SCM = require('../SCM')
const { throwError } = require('../Error')
const { akismetCheckSpam } = require('../Akismet')

const { loadConfig } = require('../../configs/client')

const {
  applyGeneratedFields,
  applyInternalFields,
  applyTransforms,
  getContentDump,
  resolvePlaceholders,
  getNewFilePath,
  trimObjectStringEntries,
  generatePullRequestBody,
  validateConfig,
  validateFields
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

    this.info = {}

    this.scmInfo = {
      platform,
      baseUrl: platformBaseUrl,
      username,
      repository,
      branch
    }

    this.scm = SCM(this.scmInfo)

    this.configPath = 'stapsher.yaml'
    this.config = null

    this.rawFields = null
    this.fields = null
    this.options = null

    this.dictionary = null
  }

  async authenticate() {
    return this.scm.authenticate()
  }

  addInfo(infoObject) {
    this.info = { ...this.info, ...infoObject }
  }

  async getConfig() {
    try {
      let configData = await this.scm.readFile(this.configPath)

      let config = validateConfig(configData, this.entryType)

      if (config.branch !== this.scmInfo.branch) {
        throwError(
          'BRANCH_MISMATCH',
          { branch: { url: this.scmInfo.branch, config: config.branch } },
          422
        )
      }

      return loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  __validateFields(fields) {
    let allowedFields = this.config.get('allowedFields')
    let requiredFields = this.config.get('requiredFields')

    return validateFields(fields, allowedFields, requiredFields)
  }

  __applyGeneratedFields() {
    let generatedFields = this.config.get('generatedFields')
    this.fields = applyGeneratedFields(this.fields, generatedFields, {
      date: this._date
    })
  }

  __applyTransforms() {
    let transformBlocks = this.config.get('transforms')
    this.fields = applyTransforms(this.fields, transformBlocks)
  }

  __applyInternalFields() {
    let internalFields = { _id: this._id }
    this.fields = applyInternalFields(this.fields, internalFields)
  }

  __getNewFileContent() {
    let dataObject = this.fields
    let format = this.config.get('format')
    return getContentDump(dataObject, format)
  }

  __getNewFilePath() {
    let path = this.__resolvePlaceholders(this.config.get('path'))
    let filename = this.__resolvePlaceholders(this.config.get('filename'))
    let extension = this.config.get('extension')
    let format = this.config.get('format')

    return getNewFilePath(path, filename, extension, format)
  }

  __resolvePlaceholders(string) {
    try {
      if (!this.dictionary) {
        this.dictionary = {
          _id: this._id,
          _date: this._date,
          fields: this.fields,
          options: this.options
        }
      }

      return resolvePlaceholders(string, this.dictionary)
    } catch (err) {
      throw err
    }
  }

  async __checkRecaptcha() {
    try {
      if (!this.config.get('recaptcha.enable')) return

      await recaptcha(
        this.config.get('recaptcha.secretKey'),
        this.info.recaptchaResponse,
        this.info.clientIP
      )
    } catch (err) {
      throwError('RECAPTCHA_ERROR', err, 400)
    }
  }

  async __throwSpam() {
    try {
      if (!this.config.get('akismet.enable')) return

      let fields = this.rawFields

      let entryObject = {
        user_ip: this.info.clientIP,
        user_agent: this.info.clientUserAgent,
        referrer: this.info.clientReferrer,
        permalink: '',
        comment_type: this.config.get('akismet.type'),
        comment_author: fields[this.config.get('akismet.fields.author')],
        comment_author_email:
          fields[this.config.get('akismet.fields.authorEmail')],
        comment_author_url: fields[this.config.get('akismet.fields.authorUrl')],
        comment_content: fields[this.config.get('akismet.fields.content')]
      }

      let spam = await akismetCheckSpam(
        this.config.get('akismet.apiKey'),
        this.config.get('akismet.siteUrl'),
        entryObject
      )

      if (spam) {
        throwError('AKISMET_IS_SPAM', { entryObject }, 400)
      }
    } catch (err) {
      throw err
    }
  }

  async processNewEntry(fields = {}, options = {}) {
    try {
      this.rawFields = { ...fields }
      this.options = { ...options }

      this.config = await this.getConfig()

      await this.__checkRecaptcha()
      await this.__throwSpam()

      fields = trimObjectStringEntries(fields)
      this.fields = this.__validateFields(fields)

      this.__applyGeneratedFields()
      this.__applyTransforms()
      this.__applyInternalFields()

      this.fields = deepsort(this.fields)

      let content = this.__getNewFileContent()
      let path = this.__getNewFilePath()
      let commitMessage = this.__resolvePlaceholders(
        this.config.get('commitMessage')
      )

      if (this.config.get('moderation')) {
        let prBranch = `stapsher.${this.entryType}(${this._id})`

        let prBody = generatePullRequestBody(
          this.fields,
          this.config.get('pullRequestBody')
        )

        await this.scm.writeFileAndCreatePR(
          path,
          commitMessage,
          content,
          prBranch,
          prBody
        )
      } else {
        await this.scm.writeFile(path, commitMessage, content)
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
