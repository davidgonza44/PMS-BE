module.exports = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    setupFiles: ["dotenv/config"],
    // setupFilesAfterEnv: [
    //     "<rootDir>/src/tests/common/test_setup.ts"
    // ],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true
            }
        ]
    }
}