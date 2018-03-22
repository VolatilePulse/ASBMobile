var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
   scoped: true,
   hmr: config.dev.hotModuleReload,
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
      'b-embed': 'src'
   }
}
