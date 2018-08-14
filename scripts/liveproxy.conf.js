module.exports = {
   port: 8888,
   https: true,
   compress: true,
   rewrite: [
      { from: '/*', to: 'http://localhost:5000/$1' },
   ],
   stack: [
      'Compress', 'Rewrite',
   ],
   key: '.user-certs/private-key.pem',
   cert: '.user-certs/asbm-cert.pem',
};
