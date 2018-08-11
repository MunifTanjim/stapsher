const helpers = require('../../../__tests__/helpers')

helpers.addSnapshotSerializers()

const { StapsherError } = require('../../Error')

const { parseFile } = require('../helpers')

describe('libs/SCM/helpers', () => {
  describe('parseFile', () => {
    let jsonBlob = JSON.stringify(helpers.readConfigFile())
    let yamlBlob = helpers.getSampleConfig()
    let parsedFile = helpers.readConfigFile()

    it('parses json blob', () => {
      expect(parseFile(jsonBlob, 'json')).toEqual(parsedFile)
    })

    it('parses yaml blob', () => {
      expect(parseFile(yamlBlob, 'yaml')).toEqual(parsedFile)
      expect(parseFile(yamlBlob, 'yml')).toEqual(parsedFile)
    })

    it('throws error if extension not supported', () => {
      try {
        parseFile(jsonBlob, 'snap')
      } catch (err) {
        expect(err).toBeInstanceOf(StapsherError)
        expect(err).toMatchSnapshot()
      }
    })

    it('throws error if parse fails', () => {
      try {
        parseFile(yamlBlob, 'json')
      } catch (err) {
        expect(err).toBeInstanceOf(StapsherError)
        expect(err).toMatchSnapshot()
      }
    })
  })
})
