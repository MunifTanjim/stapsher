const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { default: GitLabAPI } = require('gitlab')

const config = require('../../configs/server')

const { throwError } = require('../Error')

class GitLab {
  constructor(info = {}, apiBase) {
    this.info = info

    this.accessToken = config.get('gitlab.bot.accessToken')

    this.api = new GitLabAPI({
      url: apiBase,
      token: this.accessToken
    })
  }

  async authenticate() {
    try {
      return true
    } catch (err) {
      throw err
    }
  }

  async readFile(path) {
    try {
      let extension = path.split('.').pop()

      let projectID = `${this.info.username}/${this.info.repository}`

      let data = await this.api.RepositoryFiles.show(
        projectID,
        path,
        this.info.branch
      )

      let blob = Buffer.from(data.content, 'base64').toString()

      let content

      switch (extension.toLowerCase()) {
        case 'json':
          content = JSON.parse(blob)
          break
        case 'yaml':
        case 'yml':
          content = yaml.safeLoad(blob, 'utf8')
          break
        default:
          throwError('UNSUPPORTED_EXTENSION', { extension }, 422)
      }

      return content
    } catch (err) {
      if (err instanceof SyntaxError) {
        throwError('FILE_PARSE_FAILED', err, 422)
      } else {
        throw err
      }
    }
  }

  async writeFile(path, commit_message, content, branch = this.info.branch) {
    try {
      let projectID = `${this.info.username}/${this.info.repository}`

      let data = this.api.RepositoryFiles.create(projectID, path, branch, {
        commit_message,
        content
      })

      return data
    } catch (err) {
      throw err
    }
  }

  async writeFileAndCreatePR(
    path,
    commitMessage,
    content,
    branch,
    description = ''
  ) {
    try {
      let projectID = `${this.info.username}/${this.info.repository}`

      await this.api.Branches.create(projectID, branch, this.info.branch)

      await this.writeFile(path, commitMessage, content, branch)

      let data = await this.api.MergeRequests.create(
        projectID,
        branch,
        this.info.branch,
        commitMessage,
        {
          description,
          remove_source_branch: true
        }
      )

      return data
    } catch (err) {
      throw err
    }
  }
}

module.exports = GitLab
