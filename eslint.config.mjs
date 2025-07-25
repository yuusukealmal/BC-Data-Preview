import eslint from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules", "dist", "build"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs.recommended.rules,
    },
  },
];
