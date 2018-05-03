const convict = require('convict')

const { decrypt } = require('../libs/Crypto')

const configSchema = {
  akismet: {
    enabled: {
      doc: 'If `true`, entries will be checked via Akismet for spam',
      format: Boolean,
      default: false
    },
    apiKey: {
      doc: 'Encrypted Akismet API Key',
      format: 'EncryptedString',
      default: null
    },
    siteURL: {
      doc: 'Site URL form the Akismet account',
      format: String,
      default: null
    },
    fields: {
      author: {
        doc: "Field name for the entry Author's Name",
        format: String,
        default: ''
      },
      authorEmail: {
        doc: "Field name for the entry Author's Email",
        format: String,
        default: ''
      },
      authorUrl: {
        doc: "Field name for the entry Author's URL",
        format: String,
        default: ''
      },
      content: {
        doc: 'Field name for the entry Content',
        format: String,
        default: ''
      }
    },
    type: {
      doc: "Type of the entry, e.g.: 'comment','contact-form',",
      format: String,
      default: 'comment'
    }
  },
  allowedFields: {
    doc:
      'An array with the names of the allowed fields. If any of the fields sent is not in this list, the entry will be discarded and an error will be thrown.',
    format: Array,
    default: []
  },
  branch: {
    doc: 'Name of the repository branch being used',
    format: String,
    default: 'master'
  },
  commitMessage: {
    doc: 'Commit message for entries pushed to the repository',
    format: String,
    default: 'add data <Stapsher>'
  },
  extension: {
    doc: 'Extension for the data files being pushed to the repository',
    format: String,
    default: ''
  },
  filename: {
    doc:
      'Name for the data files being pushed to the repository (Placeholders allowed)',
    format: String,
    default: ''
  },
  format: {
    doc: 'Format of the data files being pushed to the repository',
    format: ['json', 'yaml', 'yml'],
    default: 'json'
  },
  generatedFields: {
    doc: 'List of fields to be appended to entries automatically',
    format: Object,
    default: {}
  },
  moderation: {
    doc:
      'If `true`, a pull request with the data files will be created on the repository. Otherwise, data files will be pushed to `branch` directly.',
    format: Boolean,
    default: false
  },
  path: {
    doc:
      'Path to the directory where data files will be stored (Placeholders allowed)',
    format: String,
    default: 'data/stapsher/{_date~unix}'
  },
  pullRequestBody: {
    doc: 'Text to be used as the Pull Request Body when moderation is enabled',
    format: String,
    default:
      "Dear human,\n\nHere's a new entry for your approval. :tada:\n\nMerge the pull request to accept it, or close it to send it away.\n\n:heart: Your friend [Staticman](https://staticman.net) :muscle:\n\n---\n"
  },
  requiredFields: {
    doc:
      'An array with the names of the fields that are required for an entry. If any of these fields are absent, the entry will be discarded and an error will be thrown.',
    format: Array,
    default: []
  },
  recaptcha: {
    enabled: {
      doc: 'If `true`, force reCAPTCHA validation will be required',
      format: Boolean,
      default: false
    },
    secretKey: {
      doc: 'Encrypted Secret Key for reCAPTCHA',
      format: 'EncryptedString',
      default: null
    }
  },
  transforms: {
    doc: 'List of transformations to be applied to the fields',
    format: Object,
    default: {}
  }
}

convict.addFormat({
  name: 'EncryptedString',
  validate: Boolean,
  coerce: decrypt
})

const loadConfig = data => {
  try {
    let config = convict(configSchema)

    config.load(data)
    config.validate({ allowed: 'strict' })

    return config
  } catch (err) {
    throw err
  }
}

module.exports = {
  loadConfig
}
