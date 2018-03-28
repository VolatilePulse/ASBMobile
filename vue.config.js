module.exports = {
   "baseUrl": "/ASBMobile/",
   "lintOnSave": true,
   "outputDir": "docs",
   "dll": false,
   "pwa": {
      "name": "ASB Mobile",
      "themeColor": "#2e54a5",
      "msTileColor": "#00aba9"
   },
   chainWebpack: config => {
      config
         .plugin('define')
         .tap(args => {
            // Add the package version number into the DefinePlugin's expansions, or "DEV" if in development mode
            args[0]['process.env'].VERSION = args[0]['process.env']['NODE_ENV'] == '"development"' ? '"DEV"' : JSON.stringify(require("./package.json").version);
            return args;
         });
   }
}
