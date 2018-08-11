const helpers = require('../../../__tests__/helpers')

helpers.disableNetConnect()

jest.mock('../../SCM/GitHub')
const GitHub = require('../../SCM/GitHub')

const Stapsher = require('../../Stapsher')

describe('libs/Stapsher:authenticate', () => {
  const parameters = helpers.getParameters()

  let stapsher
  beforeEach(() => {
    GitHub.mockClear()

    stapsher = new Stapsher(parameters)
  })

  it('calls necessary functions', async () => {
    await stapsher.authenticate()

    expect(GitHub.mock.instances[0].authenticate).toHaveBeenCalledTimes(1)
  })
})
