module.exports = {
   // Basic options
   "baseUrl": "/ASBMobile/",
   "lintOnSave": true,
   "outputDir": "docs",
   "dll": false,

   // These values mirror the manifest and are inserted into index.html
   "pwa": {
      "name": "ASB Mobile",
      "themeColor": "#2e54a5",
      "msTileColor": "#00aba9"
   },

   // Extensions to vue-cli's internal webpack build process go here
   chainWebpack: config => {
      config
         .plugin('define')
         .tap(args => {
            // Add the package version number into the DefinePlugin's expansions, or "DEV" if in development mode
            args[0]['process.env'].VERSION = args[0]['process.env']['NODE_ENV'] == '"development"' ? '"DEV"' : JSON.stringify(require("./package.json").version);
            return args;
         });
      config
         .plugin('fork-ts-checker')
         .tap(args => {
            // Change the linting output format so the line number is included with the filename (so VSCode can jump straight to it)
            args[0]['formatter'] = 'default';
            return args;
         })
   }
}
