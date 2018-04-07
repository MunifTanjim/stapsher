const convict = require('convict')

const schema = {
  allowedFields: {
    doc:
      'An array with the names of the allowed fields. If any of the fields sent is not part of this list, the entry will be discarded and an error will be thrown.',
    docExample: 'allowedFields: ["name", "email", "message"]',
    format: Array,
    default: []
  },
  branch: {
    doc: 'Name of the branch being used within the GitHub repository.',
    format: String,
    default: 'master'
  },
  commitMessage: {
    doc:
      'Text to be used as the commit message when pushing entries to the GitHub repository.',
    format: String,
    default: 'Add Staticman data'
  },
  extension: {
    doc:
      'The extension to be used in the generated data files (defaults to the extension associated with the `format` field)',
    format: String,
    default: ''
  },
  filename: {
    doc:
      "Name for the data files being uploaded to the repository. You can use placeholders (denoted by curly braces), which will be dynamically replaced with the content of a field (e.g. `{fields.name}`), the content of an option (e.g. `{options.slug}`) or other dynamic placeholders such as the entry's unique id (`{@id}`).",
    format: String,
    default: ''
  },
  format: {
    doc: 'Format of the data files being uploaded to the repository.',
    format: ['yaml', 'yml', 'json', 'frontmatter'],
    default: 'yml'
  },
  path: {
    doc:
      "Path to the directory where entry files are stored. You can use placeholders (denoted by curly braces), which will be dynamically replaced with the content of a field (e.g. `{fields.name}`), the content of an option (e.g. `{options.slug}`) or other dynamic placeholders such as the entry's unique id (`{@id}`).",
    format: String,
    default: '_data/results/{@timestamp}'
  },
  requiredFields: {
    doc:
      'An array with the names of the fields that must be supplies as part of an entry. If any of these is not present, the entry will be discarded and an error will be thrown.',
    format: Array,
    default: []
  }
}

module.exports = (data, rsa) => {
  convict.addFormat({
    name: 'EncryptedString',
    validate: val => true,
    coerce: val => {
      return rsa.decrypt(val, 'utf8')
    }
  })

  const config = convict(schema)

  try {
    config.load(data)
    config.validate()

    return config
  } catch (e) {
    throw e
  }
}

module.exports.schema = schema
