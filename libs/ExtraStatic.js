const uuidv1 = require('uuid/v1')
const isUndefined = require('lodash.isundefined')
const isString = require('lodash.isstring')
const isObject = require('lodash.isobject')
const dateFormat = require('dateformat')

const GitHub = _require('libs/GitHub')

const { respondError } = _require('libs/Error')
const { hash } = _require('libs/Crypto')

const { loadConfig } = _require('configs/client')

const getFormattedDate = ({ format = 'isoUtcDateTime' }) => {
  const now = new Date()

  switch (format) {
    case 'unix':
    case 'unix-milliseconds':
      return now.getTime()
    case 'unix-seconds':
      return Math.floor(now.getTime() / 1000)
    default:
      return dateFormat(now, format)
  }
}

class ExtraStatic {
  constructor({ username, repository, branch, entryType = '' }) {
    this.uid = uuidv1()

    this.info = {
      username,
      repository,
      branch
    }

    this.entryType = entryType

    this.github = new GitHub(this.info)

    this.configPath = 'extrastatic.json'
  }

  async authenticate() {
    try {
      return await this.github.authAsInstallation()
    } catch (err) {
      throw err
    }
  }

  async getConfig(force = false) {
    if (this.config && !force) return this.config

    try {
      let data = await this.github.readFile(this.configPath)

      let config = await this._validateConfig(data[this.entryType])

      if (config.branch !== this.info.branch)
        respondError('BRANCH_MISMATCH', 400, {
          api: this.info.branch,
          config: config.branch
        })

      this.config = loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  async _validateConfig(config) {
    try {
      if (!config)
        respondError('MISSING_CONFIG_BLOCK', 400, {
          for: this.entryType
        })

      let requiredOptions = ['allowedFields', 'branch', 'format', 'path']

      let missingOptions = []

      requiredOptions.forEach(option => {
        if (isUndefined(config[option])) missingOptions.push(option)
      })

      if (missingOptions.length)
        respondError('MISSING_CONFIG_OPTIONS', 400, {
          options: missingOptions
        })

      return config
    } catch (err) {
      throw err
    }
  }

  async _validateFields(fields) {
    try {
      let missingRequiredFields = []

      this.config.get('requiredFields').forEach(field => {
        if (isUndefined(fields[field]) || fields[field] === '') {
          missingRequiredFields.push(field)
        }
      })

      if (missingRequiredFields.length)
        respondError('MISSING_REQUIRED_FIELDS', 400, { missingRequiredFields })

      let deniedFields = []

      Object.keys(fields).forEach(field => {
        if (
          !this.config.get('allowedFields').includes(field) &&
          fields[field] !== ''
        ) {
          deniedFields.push(field)
        }

        if (isString(fields[field])) {
          fields[field] = fields[field].trim()
        }
      })

      if (deniedFields.length)
        respondError('DENIED_FIELDS_EXIST', 400, { deniedFields })

      return true
    } catch (err) {
      throw err
    }
  }

  async _applyGeneratedFields(fields) {
    let generatedFields = this.config.get('generatedFields')

    if (!generatedFields) return fields

    Object.keys(generatedFields).forEach(field => {
      let generatedField = generatedFields[field]

      if (isObject(generatedField) && !Array.isArray(generatedField)) {
        let options = generatedField.options || {}

        switch (generatedField.type) {
          case 'date':
            fields[field] = getFormattedDate(options)
            break
        }
      } else {
        fields[field] = generatedField
      }
    })

    return fields
  }

  async _applyTransforms(fields) {
    try {
      let transforms = this.config.get('transforms')

      if (!transforms) return fields

      Object.keys(transforms).forEach(field => {
        if (!fields[field]) return

        transforms[field] = Array.isArray(transforms[field])
          ? transforms[field]
          : [transforms[field]]

        transforms[field].forEach(transform => {
          if (transform.includes('hash')) {
            let algorithm = transform.split('.')[1]

            if (!algorithm)
              respondError('MISSING_HASH_ALGORITHM', 422, {
                field,
                transform
              })

            fields[field] = hash(fields[field], algorithm)
          }
        })
      })

      return fields
    } catch (err) {
      throw err
    }
  }

  async _applyInternalFields(fields) {
    try {
      let internalFields = { _id: this.uid }

      if (this.options.parent) internalFields._parent = this.options.parent

      return { ...internalFields, ...fields }
    } catch (err) {
      throw err
    }
  }

  async _createFile(fields) {
    try {
      switch (this.siteConfig.get('format').toLowerCase()) {
        case 'json':
          return resolve(JSON.stringify(fields))

        case 'yaml':
        case 'yml':
          try {
            const output = yaml.safeDump(fields)

            return resolve(output)
          } catch (err) {
            return reject(err)
          }

        case 'frontmatter':
          const transforms = this.siteConfig.get('transforms')

          const contentField =
            transforms &&
            Object.keys(transforms).find(field => {
              return transforms[field] === 'frontmatterContent'
            })

          if (!contentField) {
            return reject(errorHandler('NO_FRONTMATTER_CONTENT_TRANSFORM'))
          }

          const content = fields[contentField]
          const attributeFields = Object.assign({}, fields)

          delete attributeFields[contentField]

          try {
            const output = `---\n${yaml.safeDump(
              attributeFields
            )}---\n${content}\n`

            return resolve(output)
          } catch (err) {
            return reject(err)
          }

        default:
          return reject(errorHandler('INVALID_FORMAT'))
      }
    } catch (err) {
      throw err
    }
  }

  async processEntry() {
    try {
    } catch (err) {
      throw err
    }
  }
}

module.exports = ExtraStatic
