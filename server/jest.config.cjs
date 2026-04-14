module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  collectCoverageFrom: ['services/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
