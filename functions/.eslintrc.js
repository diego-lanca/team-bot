module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // REMOVEMOS a opção "project" daqui de cima.
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // Estas são regras gerais que se aplicam a todos os arquivos.
    "indent": ["warn", 2],
    "quotes": 0,
    "semi": ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "import/no-unresolved": 0,
    "valid-jsdoc": "off",
    "require-jsdoc": "off",
  },
  // A MÁGICA ACONTECE AQUI!
  overrides: [
    {
      // Aplica as regras abaixo SOMENTE para arquivos TypeScript.
      files: ["*.ts"],
      extends: ["plugin:@typescript-eslint/recommended"],
      parserOptions: {
        project: [
          `${__dirname}/tsconfig.json`,
          `${__dirname}/tsconfig.dev.json`,
        ],
      },
      rules: {
        // Regras específicas de TypeScript.
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
      },
    },
  ],
};
