const BASE_URL = "/ASBMobile/";

module.exports = {
   // Basic options
   baseUrl: BASE_URL,
   lintOnSave: true,
   outputDir: "docs",
   dll: false,

   // Turn this off to remove the *large* debug source maps at the cost of unreadable stack traces in production
   productionSourceMap: true,

   pwa: {
      // These values mirror the manifest and are inserted into index.html
      name: "ASB Mobile",
      themeColor: "#2e54a5",
      msTileColor: "#00aba9",

      workboxOptions: {
         // If a new service worker is found, install and take over immediately
         // This avoids the need to reload twice to get a new version
         clientsClaim: true,
         skipWaiting: true,

         // Where workbox is located: 'local' to copy workbox locally, or 'cdn' to use Google's nosey cdn
         importWorkboxFrom: 'cdn',

         exclude: [
            /js\/manifest\..*\.js$/, // remove this non-existent file from the pre-cache list (webpack/vue-cli bug?)
         ],
      },
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
