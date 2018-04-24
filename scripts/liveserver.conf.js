module.exports = {
   port: 8888,
   https: true,
   // http2: true,
   compress: true,
   rewrite: [{ from: '/ASBMobile/*', to: '/$1' }],
   directory: 'docs',
   logFormat: 'dev', // 'stats' for non-scrolling status view
   key: '.user-certs/private-key.pem',
   cert: '.user-certs/asbm-cert.pem',
}
