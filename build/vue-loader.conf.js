var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
   loaders: utils.cssLoaders({
      sourceMap: isProduction
         ? config.build.productionSourceMap
         : config.dev.cssSourceMap,
      extract: isProduction
   }),
   esModule: true,
   transformToRequire: {
      video: 'src',
      source: 'src',
      img: 'src',
      image: 'xlink:href',
      'b-img': 'src',
      'b-img-lazy': ['src', 'blank-src'],
      'b-card': 'img-src',
      'b-card-img': 'img-src',
      'b-carousel-slide': 'img-src',
      'b-embed': 'src',
   }
}
