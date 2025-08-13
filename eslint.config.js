const { dirname } = require("path");
const { FlatCompat } = require("@eslint/eslintrc");

const __dirname = __dirname;

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

module.exports = eslintConfig;
