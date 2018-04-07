const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')
const config = require('../../configs/server')

class GitHubApp {
  constructor(options = {}) {
    this.options = options

    this.id = config.get('githubApp.id')
    this.privateKey = fs.readFileSync(
      path.resolve(config.get('githubApp.privateKey'))
    )

    this.octokit = OctokitREST({
      timeout: 5000,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'extraStatic App agent'
      },
      baseUrl: 'https://api.github.com'
    })

    this.authenticateAsApp()
  }

  authenticateAsApp() {
    this.octokit.authenticate({
      type: 'integration',
      token: jwt.sign(
        {
          iat: Math.floor(new Date() / 1000), // Issued at time
          exp: Math.floor(new Date() / 1000) + 60, // JWT expiration time
          iss: this.id // Integration's GitHub id
        }, // Sign with RSA SHA256
        this.privateKey,
        {
          algorithm: 'RS256'
        }
      )
    })
  }

  async getInstallations() {
    try {
      let response = await this.octokit.apps.getInstallations()
      return response.data
    } catch (err) {
      console.log(err)
    }
  }

  async authenticateAsInstallation({ installation_id }) {
    try {
      console.log(installation_id)
      let data = await octokit.apps.createInstallationToken({
        installation_id
      })
      console.log(data)
    } catch (err) {}
  }

  readFile(path, getFullResponse) {
    const extension = path.split('.').pop()

    return this.api.repos
      .getContent({
        user: this.options.username,
        repo: this.options.repository,
        path,
        ref: this.options.branch
      })
      .then(res => {
        let content = Buffer.from(res.content, 'base64').toString()

        try {
          switch (extension) {
            case 'yml':
            case 'yaml':
              content = yaml.safeLoad(content, 'utf8')

              break

            case 'json':
              content = JSON.parse(content)

              break
          }

          return getFullResponse
            ? {
                content: content,
                file: {
                  content: res.content
                }
              }
            : content
        } catch (err) {
          let errorData = {
            err
          }

          if (err.message) {
            errorData.data = err.message
          }

          return Promise.reject(errorHandler('PARSING_ERROR', errorData))
        }
      })
      .catch(err => {
        return Promise.reject(errorHandler('GITHUB_READING_FILE', { err }))
      })
  }

  writeFile(filePath, data, branch, commitTitle) {
    branch = branch || this.options.branch
    commitTitle = commitTitle || 'Add Staticman file'

    return this.api.repos
      .createFile({
        user: this.options.username,
        repo: this.options.repository,
        path: filePath,
        content: Buffer.from(data).toString('base64'),
        message: commitTitle,
        branch: branch
      })
      .catch(err => {
        try {
          const message = err && err.message

          if (message) {
            const parsedError = JSON.parse(message)

            if (
              parsedError &&
              parsedError.message &&
              parsedError.message.includes('"sha" wasn\'t supplied')
            ) {
              return Promise.reject(
                errorHandler('GITHUB_FILE_ALREADY_EXISTS', { err })
              )
            }
          }
        } catch (err) {} // eslint-disable-line no-empty

        return Promise.reject(errorHandler('GITHUB_WRITING_FILE', { err }))
      })
  }

  writeFileAndSendPR(filePath, data, branch, commitTitle, commitBody) {
    commitTitle = commitTitle || 'Add Staticman file'
    commitBody = commitBody || ''

    return this.api.repos
      .getBranch({
        user: this.options.username,
        repo: this.options.repository,
        branch: this.options.branch
      })
      .then(res => {
        return this.api.gitdata.createReference({
          user: this.options.username,
          repo: this.options.repository,
          ref: 'refs/heads/' + branch,
          sha: res.commit.sha
        })
      })
      .then(res => {
        return this.writeFile(filePath, data, branch, commitTitle)
      })
      .then(res => {
        return this.api.pullRequests.create({
          user: this.options.username,
          repo: this.options.repository,
          title: commitTitle,
          head: branch,
          base: this.options.branch,
          body: commitBody
        })
      })
      .catch(err => {
        return Promise.reject(errorHandler('GITHUB_CREATING_PR', { err }))
      })
  }
}

module.exports = GitHubApp
