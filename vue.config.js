const BASE_URL = "/";

const plugins = [];
let firebasePublicKeys = null;

if (process.env.NODE_ENV === 'production') {
   // Include the bundle size visualiser
   plugins.push(new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../build-size.html',
   }));

   // plugins.push(new (require('webpack').IgnorePlugin)(/firebase/));
}
else {
   // Get the firebase web setup public keys from the Firebase CLI
   var exec = require('child_process').exec;
   exec('firebase setup:web', (error, stdout, stderr) => {
      if (error || stderr) console.error("Failed to fetch Firebase web setup: ", error || stderr);
      firebasePublicKeys = stdout;
   });
}


module.exports = {
   // Basic options
   baseUrl: BASE_URL,
   lintOnSave: true,
   outputDir: "docs",

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
            /\.js\.map$/, // remove .js.map files from the cache as it is insane to always require fetching them
         ],
      },
   },

   // Extensions to vue-cli's internal webpack build process go here
   chainWebpack: config => {
      config
         .plugin('define')
         .tap(args => {
            // Add the package version number into the DefinePlugin's expansions, or "DEV" if in development mode
            // @ts-ignore
            args[0]['process.env'].VERSION = args[0]['process.env']['NODE_ENV'] == '"development"' ? '"DEV"' : JSON.stringify(require("./package.json").version);
            return args;
         });
      config
         .plugin('fork-ts-checker')
         .tap(args => {
            // Change the linting output format so the line number is included with the filename (so VSCode can jump straight to it)
            args[0]['formatter'] = 'default';
            return args;
         });
   },

   configureWebpack: {
      plugins: plugins,

      performance: {
         // Turn off the bundle size warnings
         hints: false,
      },

      // Avoid bundling these as they're pulled from a CDN
      externals: [
         {
            // 'vue': 'var Vue',
            'firebase': 'var firebase',
            'firebase/app': 'var firebase',
            'firebase/auth': 'var firebase.auth',
            'firebase/firestore': 'var firebase.firestore',
            'firebaseui': 'var firebaseui',
         },
      ],

   },

   devServer: {
      // Send the current Firebase public keys on requests to: /__/firebase/init.js
      before(app) {
         app.get('/__/firebase/init.js', function (req, res) {
            res.set('Content-Type', 'application/javascript');
            res.send(firebasePublicKeys);
         });
      },
   },
}
