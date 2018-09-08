#!/bin/bash

# clone repository
rm -R ../blockchain-explorer
git clone https://github.com/hyperledger/blockchain-explorer ../blockchain-explorer
cd ../blockchain-explorer
git checkout release-3.5
cd -

# copy file
cp appconfig.json ../blockchain-explorer/.
cp config.json ../blockchain-explorer/app/platform/fabric/.
cp package.json ../blockchain-explorer/client/.
echo "copy configuration completed !!"

# npm install
cd ../blockchain-explorer
npm i
cd ./app/test
npm i
sleep 5s
npm test
cd -
cd ./client
npm i
sleep 5s
npm run build
cd -

# install postgresql
sudo apt-get install postgresql postgresql-contrib
cd ./app/persistence/postgreSQL/db
./createdb.sh 

echo "prerequisite completed !!"
