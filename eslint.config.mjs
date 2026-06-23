import { dirname } from "path";
import { fileURLToPath } from "url";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**", "coverage/**", "scratch/**", "*.cjs"],
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];
