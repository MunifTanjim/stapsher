const { getUsersCache } = require('../lowdb')

expect.addSnapshotSerializer({
  print: o => JSON.stringify(o, null, 2),
  test: o => o && typeof o === 'object'
})

const {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache,
  fetchInstallationIdFromCache,
  addRepoToCache,
  incrementEntryCountCache
} = require('./actions')

let installation, repos, cache

/* the sequence of testing functions matters here */

describe('lowdb:actions', () => {
  describe('createInstallationOnCache', () => {
    it('works as expected', async () => {
      expect.assertions(2)

      installation = {
        id: 10,
        account: { id: 7, login: 'Harold', type: 'Admin' }
      }
      repos = [{ id: 1, name: 'TheMachine', full_name: 'Harold/TheMachine' }]
      await createInstallationOnCache(installation, repos)
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()

      installation = {
        id: 11,
        account: { id: 13, login: 'Arthur', type: 'Engineer' }
      }
      repos = [{ id: 666, name: 'Samaritan', full_name: 'Arthur/Samaritan' }]
      await createInstallationOnCache(installation, repos)
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()
    })
  })

  describe('addReposToCache', () => {
    it('works as expected', async () => {
      installation = {
        id: 10,
        account: { id: 7, login: 'Harold', type: 'Admin' }
      }
      repos = [
        { id: 0, name: 'GodMode', full_name: 'Harold/GodMode' },
        { id: 2027, name: 'If-Then-Else', full_name: 'Harold/If-Then-Else' }
      ]
      await addReposToCache(installation, repos)
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()
    })
  })

  describe('removeReposFromCache', () => {
    it('works as expected', async () => {
      installation = {
        id: 10,
        account: { id: 7, login: 'Harold', type: 'Admin' }
      }
      repos = [
        { id: 0, name: 'GodMode', full_name: 'Harold/GodMode' },
        { id: 2027, name: 'If-Then-Else', full_name: 'Harold/If-Then-Else' }
      ]
      await removeReposFromCache(installation, repos)
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()
    })
  })

  describe('deleteInstallationFromCache', () => {
    it('works as expected', async () => {
      installation = {
        id: 11,
        account: { id: 13, login: 'Arthur', type: 'Engineer' }
      }
      repos = []
      await deleteInstallationFromCache(installation, repos)
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()
    })
  })

  describe('fetchInstallationIdFromCache', () => {
    it('works as expected', async () => {
      expect(
        await fetchInstallationIdFromCache({
          username: 'Harold',
          repository: 'TheMachine'
        })
      ).toBe(10)

      expect(
        await fetchInstallationIdFromCache({
          username: 'Arthur',
          repository: 'Samaritan'
        })
      ).toBe(null)
    })
  })

  describe('addRepoToCache', () => {
    it('works as expected', async () => {
      await addRepoToCache({
        id: 666,
        name: 'Samaritan',
        full_name: 'Arthur/Samaritan',
        installation_id: 11,
        owner: 'Arthur',
        owner_id: 13
      })
      cache = await getUsersCache()
      expect(cache.getState()).toMatchSnapshot()
    })
  })

  describe('incrementEntryCountCache', () => {
    it('increments entry count', async () => {
      expect.assertions(3)
      expect(await incrementEntryCountCache()).toBe(1)
      expect(await incrementEntryCountCache()).toBe(2)
      expect(await incrementEntryCountCache()).toBe(3)
    })
  })
})
