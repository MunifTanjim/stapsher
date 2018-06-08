const config = require('../../configs/server')

module.exports.baseUrl = `http://localhost:${config.get('port')}`

module.exports.parameters = {
  version: 'v1',
  platform: 'github',
  username: 'Harold',
  repository: 'TheMachine',
  branch: 'master',
  entryType: 'comment'
}

module.exports.fields = {
  author: 'Samantha Groves',
  email: 'samantha@example.com',
  url: 'https://samantha.example.com',
  content: 'We might as well be a symphony'
}

module.exports.options = {
  alias: 'Root'
}
