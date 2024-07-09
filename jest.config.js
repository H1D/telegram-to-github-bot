export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],

    "^.+\\.js$": "babel-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  extensionsToTreatAsEsm: [".ts"],
  testPathIgnorePatterns: ["/node_modules/", "fixtures\\.ts$"],
};
