const { default: GitLabAPI } = require('gitlab')

const { parseFile } = require('../helpers')

class GitLab {
  constructor({ info = {}, config }) {
    this.info = info
    this.config = config

    this.api = new GitLabAPI({
      url: this.config.baseUrl,
      token: this.config.accessToken
    })
  }

  async authenticate() {
    if (this.config.type === 'bot') return true
  }

  async readFile(path) {
    try {
      let projectID = `${this.info.username}/${this.info.repository}`

      let data = await this.api.RepositoryFiles.show(
        projectID,
        path,
        this.info.branch
      )

      let blob = Buffer.from(data.content, 'base64').toString()

      let extension = path.split('.').pop()

      return parseFile(blob, extension)
    } catch (err) {
      throw err
    }
  }

  async writeFile(path, commitMessage, content, branch = this.info.branch) {
    try {
      let projectID = `${this.info.username}/${this.info.repository}`

      let data = await this.api.RepositoryFiles.create(
        projectID,
        path,
        branch,
        {
          commit_message: commitMessage,
          content
        }
      )

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
