/* eslint-disable */
import type { Config } from 'jest';
export default <Config>{
  displayName: 'types.ts',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/types.ts',
  setupFiles: ['<rootDir>/test-setup.ts'],
};
