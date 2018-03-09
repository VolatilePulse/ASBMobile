// http://eslint.org/docs/user-guide/configuring

module.exports = {
   root: true,
   parser: 'babel-eslint',
   parserOptions: {
      sourceType: 'module'
   },
   env: {
      browser: true,
      es6: true,
   },
   // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
   //extends: 'standard',
   plugins: [
      'html'  // required to lint *.vue files
   ],
   'rules': {
      "no-shadow": 2,
      "no-shadow-restricted-names": 2,
      "camelcase": "warn",
      "indent": ["warn", 3],
      "semi": ["warn", "always"],
      "comma-dangle": "off",
      "space-before-function-paren": ["warn", {
         "anonymous": "always",
         "named": "never",
         "asyncArrow": "never"
      }],
      "use-isnan": 2,
      "quotes": "off",
      "curly": "off",
      "comma-style": [2, "last"],
      "comma-spacing": [2, { "before": false, "after": true }],
      "brace-style": [1, "stroustrup", { "allowSingleLine": true }],
      "eol-last": 1,
      "no-use-before-define": ["error", "nofunc"],
      "no-unused-expressions": 2,
      "no-unneeded-ternary": 1,
      "no-unused-vars": [2, { "argsIgnorePattern": '_', }],
      "no-undef": 2,

      // allow paren-less arrow functions
      'arrow-parens': 0,
      // allow async-await
      'generator-star-spacing': 0,
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
   }
}
