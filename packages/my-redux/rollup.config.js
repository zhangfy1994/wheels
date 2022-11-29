import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

const extensions = [".ts"];
const noDeclarationFiles = { compilerOptions: { declaration: false } };

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
].map((name) => RegExp(`^${name}($|/)`));

export default defineConfig([
  // CommonJS
  {
    input: "src/index.ts",
    output: {
      file: "lib/redux.js",
      format: "cjs",
      indent: false,
    },
    external,
    plugins: [
      resolve(extensions),
      typescript({ useTsconfigDeclarationDir: true }),
      commonjs(),
      babel({
        extensions,
        babelHelpers: "runtime",
      }),
    ],
  },

  // ES
  {
    input: "src/index.ts",
    output: {
      file: "es/redux.js",
      format: "es",
      indent: false,
    },
    external,
    plugins: [
      resolve(extensions),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      babel({
        extensions,
        babelHelpers: "runtime",
      }),
    ],
  },

  // UMD Production
  {
    input: "src/index.ts",
    output: {
      file: "dist/redux.js",
      format: "umd",
      name: "Redux",
      indent: false,
    },
    external,
    plugins: [
      resolve({
        extensions,
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      babel({
        extensions,
        exclude: "node_modules/**",
        skipPreflightCheck: true,
        babelHelpers: "bundled",
      }),
    ],
  },
]);
