import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@metamask/snaps-sdk(.*)$": "<rootDir>/src/__mocks__/snaps-sdk$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          jsxImportSource: "@metamask/snaps-sdk",
        },
      },
    ],
  },
};

export default config;
