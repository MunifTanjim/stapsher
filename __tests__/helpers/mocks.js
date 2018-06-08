const mockId = '7w0.z3r0.7w0.53v3n'
module.exports.mockUUIDv1 = () => {
  jest.mock('uuid/v1', () => () => mockId)

  return mockId
}

const mockDate = new Date(0)
module.exports.mockDate = () => {
  /* eslint no-global-assign:off */
  Date = class extends Date {
    constructor() {
      return mockDate
    }
  }

  return mockDate
}
