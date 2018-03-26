module.exports = {
   port: 8888,
   https: true,
   http2: true,
   compress: true,
   rewrite: [{ from: '/ASBMobile/*', to: '/$1' }],
   directory: 'docs',
   spa: 'index.html',
   logFormat: 'stats',
   staticMaxage: 60 * 60 * 24 * 30,
   key: '.user-certs/private-key.pem',
   cert: '.user-certs/asbm-cert.pem',
}
