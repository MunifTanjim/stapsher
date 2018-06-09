const { encrypt, decrypt, hash } = require('../Crypto')

const string = 'stapsher'

describe('libs/Crypto', () => {
  describe('hash', () => {
    it.each([['md5', '4256a1307940cdee013efd5010f8bb27']])(
      'hashes string correctly for algorithm',
      (algorithm, hashedString) => {
        expect(hash(string, algorithm)).toBe(hashedString)
      }
    )
  })

  describe('encrypt/decrypt', () => {
    it('encrypts and decrypts string correctly', () => {
      expect(decrypt(encrypt(string))).toBe(string)
    })
  })
})
