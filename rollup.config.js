import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

export default {
  name: "prosemirror-image-plugin",
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    { file: pkg.module, format: "es" },
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [typescript(), terser()],
  sourcemap: true,
};
