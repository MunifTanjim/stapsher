const yaml = require('js-yaml')

const sampleConfig = `
comment:
  allowedFields: ["author","content","email","url"]
  branch: master
  commitMessage: "add new comment by {fields.author} <Stapsher>"
  filename: "{_date~unix}.{_id}"
  format: yaml
  generatedFields:
    timestamp:
      type: date
      options:
        format: unix
  moderation: false
  path: "data/comments"
  requiredFields: ["author","content","email"]
  transforms:
    email: "hash~md5"
`

module.exports.sampleConfig = sampleConfig

module.exports.readConfigFile = () => yaml.safeLoad(sampleConfig, 'utf8')
