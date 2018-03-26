#!/bin/sh

# This script generates a new private development certificate so that `npm run livetest` can use HTTPS.

if [ -d .user-certs ]; then
   echo "Certificates already exist in '.user-certs'... Aborting"
   exit 0
fi

mkdir -p .user-certs
openssl genrsa -out .user-certs/private-key.pem 2048
openssl req -new -nodes -sha256 -key .user-certs/private-key.pem -out .user-certs/asbm-csr.pem -config scripts/openssl.cnf
openssl x509 -req -sha256 -days 3650 -in .user-certs/asbm-csr.pem -signkey .user-certs/private-key.pem -out .user-certs/asbm-cert.pem -extfile scripts/openssl.cnf -extensions v3_req

echo
echo "Your new private key and certificate has been generated in '.user-certs'. DO NOT SHARE IT."
echo
echo "The certificate '.user-certs/asbm-cert.pem' must be added as a trusted root certificate authority"
echo "in the browser/OS before it will have an effect."
echo
echo 'In Windows you can use "Manage computer certificates" in the control panel'
echo 'or in powershell:'
echo '   Import-Certificate -CertStoreLocation Cert:\CurrentUser\Root\ -FilePath .user-certs\asbm-cert.pem'
