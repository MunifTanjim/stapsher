const {
  addSnapshotSerializers,
  disableExpressBrute,
  disableRequestLogger
} = require('../../helpers')

disableExpressBrute()
disableRequestLogger()

addSnapshotSerializers()

// increase the async timeout to 10sec
jest.setTimeout(10000)
