module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
}
