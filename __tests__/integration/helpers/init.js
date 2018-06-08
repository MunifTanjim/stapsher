const helpers = require('../../helpers')

helpers.addSnapshotSerializers()

helpers.disableExpressBrute()
helpers.disableRequestLogger()

helpers.mockDate()
helpers.mockUUIDv1()

// increase the async timeout to 15sec
jest.setTimeout(15000)
