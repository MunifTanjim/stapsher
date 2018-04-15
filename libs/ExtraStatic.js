const uuidv1 = require('uuid/v1')
const Github = _require('libs/GitHub')
const isUndefined = require('lodash.isundefined')

const { loadConfig } = _require('configs/client')
const { ResponseError } = _require('libs/Error')

class ExtraStatic {
  constructor({ username, repository, branch, entryType = '' }) {
    this.uid = uuidv1()

    this.info = {
      username,
      repository,
      branch
    }

    this.entryType = entryType

    this.github = new Github(this.info)

    this.configPath = 'extrastatic.json'
  }

  async authenticate() {
    try {
      return await this.github.authAsInstallation()
    } catch (err) {
      throw err
    }
  }

  async getClientConfig(force) {
    if (this.clientConfig && !force) return this.clientConfig

    try {
      let data = await this.github.readFile(this.configPath)

      let config = this._validateClientConfig(data[this.entryType])

      if (config.branch !== this.info.branch) {
        throw new ResponseError('BRANCH_MISMATCH', 400, {
          api: this.info.branch,
          config: config.branch
        })
      }

      this.clientConfig = loadConfig(config)
    } catch (err) {
      throw err
    }
  }

  _validateClientConfig(config) {
    if (!config)
      throw new ResponseError('MISSING_CONFIG_BLOCK', 400, {
        for: this.entryType
      })

    const requiredOptions = ['allowedFields', 'branch', 'format', 'path']

    let missingOptions = []

    requiredOptions.forEach(requiredOption => {
      if (isUndefined(config[requiredOption]))
        missingOptions.push(requiredOption)
    })

    if (missingOptions.length)
      throw new ResponseError('MISSING_CONFIG_OPTIONS', 400, {
        options: missingOptions
      })

    return config
  }
}

module.exports = ExtraStatic
