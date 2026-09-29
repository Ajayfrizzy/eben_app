const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig(
  { ignores: [".expo/**", ".expo-audit-output/**"] },
  expoConfig,
  {
    rules: {
      // TypeScript performs module resolution reliably in this Windows monorepo.
      "import/no-unresolved": "off",
    },
  },
);
