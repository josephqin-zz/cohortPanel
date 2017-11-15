import commonjs from "rollup-plugin-commonjs";
import node from "rollup-plugin-node-resolve";
import babel from 'rollup-plugin-babel';


export default {
  input: "src/indexD3Rollup",
  extend: true,
  output: {
    file: "build/cohortPanel.js",
    format: "umd",
    name: "cohortPanel"
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    node(),
    commonjs({
      include: 'node_modules/**'
    })
  ]
  
};
