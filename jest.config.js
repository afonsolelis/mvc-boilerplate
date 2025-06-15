module.exports = {
  testEnvironment: "node",
  testTimeout: 10000,
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "services/**/*.js",
    "helpers/**/*.js",
    "repositories/**/*.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
