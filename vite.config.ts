import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    {
      name: "convex-password-wasm",
      enforce: "pre",
      load(id) {
        if (!id.includes("password-hash-wasm/") || !id.endsWith(".wasm")) return null;
        // Convex imports WASM as a compiled module; test the same real Argon2 code.
        const bytes = readFileSync(id).toString("base64");
        return `export default new WebAssembly.Module(Uint8Array.from(atob("${bytes}"), c => c.charCodeAt(0)));`;
      },
    },
  ],
  lint: {
    plugins: ["import", "typescript", "react", "unicorn", "oxc"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
      pedantic: "off",
      style: "off",
      restriction: "off",
    },
    rules: {
      "no-console": "off",
      "import/no-cycle": "off",
      "import/no-default-export": "off",
      "typescript/no-explicit-any": "off",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/consistent-type-imports": "off",
      "unicorn/filename-case": "off",
      "no-unused-vars": "error",
      "no-underscore-dangle": [
        "error",
        {
          allow: ["_id", "_creationTime"],
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/no-unstable-nested-components": "off",
      "react/jsx-key": "error",
      "eslint/no-await-in-loop": "off",
      "typescript/consistent-type-definitions": "off",
      "oxc/no-barrel-file": "off",
      "oxc/no-optional-chaining": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/throw-new-error": "error",
      "import/no-named-as-default": "off",
      "import/no-unassigned-import": "off",
    },
    settings: {
      react: {
        version: "19.0",
        runtime: "automatic",
      },
    },
    ignorePatterns: [
      "node_modules",
      "dist",
      ".expo",
      ".agents",
      "convex/_generated",
      ".next",
      "playwright-report",
      "test-results",
      "agent",
      ".claude",
      ".codex",
      "skills-lock.json",
    ],
    env: {
      node: true,
      browser: true,
      es2024: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: [
      "node_modules",
      "dist",
      ".expo",
      ".agents",
      "convex/_generated",
      ".next",
      "playwright-report",
      "test-results",
      "agent",
      ".claude",
      ".codex",
      "skills-lock.json",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "backend",
          server: { deps: { inline: ["convex-test", "password-hash-wasm"] } },
          environment: "edge-runtime",
          include: ["convex/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: { name: "scripts", environment: "node", include: ["scripts/**/*.test.mjs"] },
      },
      {
        extends: true,
        test: { name: "ui", environment: "jsdom", include: ["test/**/*.test.tsx"] },
      },
    ],
  },
});
