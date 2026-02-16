export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    '__tests__/**/*.js',
    '!**/*.test.js'
  ]
};
