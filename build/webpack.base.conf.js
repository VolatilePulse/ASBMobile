var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var vueTemplateLoaderConfig = require('./vue-template-loader.conf')
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function resolve(dir) {
   return path.join(__dirname, '..', dir)
}

module.exports = {
   entry: {
      app: './src/app.ts'
   },
   output: {
      path: config.build.assetsRoot,
      filename: '[name].js',
      publicPath: process.env.NODE_ENV === 'production'
         ? config.build.assetsPublicPath
         : config.dev.assetsPublicPath
   },

   plugins: [
      //new ForkTsCheckerWebpackPlugin(),
   ],

   resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
         'vue$': 'vue/dist/vue.runtime.esm.js',
         '@': resolve('src'),
      },
      modules: [
         resolve('src'),
         "node_modules"
      ]
   },
   module: {
      rules: [
         {
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            include: [resolve('src'), resolve('test')],
            options: {
               formatter: require('eslint-friendly-formatter')
            }
         },
         {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderConfig
         },
         {
            test: /\.html$/,
            loader: 'vue-template-loader',
            exclude: resolve('index.html'),
            options: vueTemplateLoaderConfig
         },
         {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src'), resolve('test')]
         },
         {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            include: /src/,
            //exclude: /node_modules/,
            options: {
               appendTsSuffixTo: [/\.vue$/],
               //transpileOnly: true // fork-ts-checker-webpack-plugin does the type checking in another process
            }
         },
         {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
               limit: 10000,
               name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
         },
         {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: 'url-loader',
            options: {
               limit: 10000,
               name: utils.assetsPath('media/[name].[hash:7].[ext]')
            }
         },
         {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
               limit: 10000,
               name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
            }
         }
      ]
   }
}
