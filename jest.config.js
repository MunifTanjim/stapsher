module.exports = {
  collectCoverageFrom: ['routes/**/*.js', 'libs/**/*.js', 'app.js', 'index.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/__tests__(.*)helpers/']
}
