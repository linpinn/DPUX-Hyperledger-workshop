#!/bin/bash

echo ">>>>>>>>>>>>>>>>>>>>>>>>> cloning repository ..."
rm -rf ../../blockchain-explorer
cd ../../
git clone https://github.com/hyperledger/blockchain-explorer blockchain-explorer
cd blockchain-explorer
git checkout d8381a58dda17f0a3b8efcce9783ef5b0e997214
cd ../instruction/osx
echo ">>>>>>>>>>>>>>>>>>>>>>>>> cloning repository success !"

echo ">>>>>>>>>>>>>>>>>>>>>>>>> installing postgres ..."
docker rm -f pg
docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:9
echo ">>>>>>>>>>>>>>>>>>>>>>>>> installing postgres success !"

cp -f ./config/appconfig.json ../../blockchain-explorer/.
cp -f ./config/config.json ../../blockchain-explorer/app/platform/fabric/.
cp -f ./config/package.json ../../blockchain-explorer/client/.
cp -f ./config/pgconfig.json ../../blockchain-explorer/app/persistence/postgreSQL/db

echo ">>>>>>>>>>>>>>>>>>>>>>>>> installing dependency modules ..."
cd ../../blockchain-explorer
npm i
npm rebuild
cd ./client
npm i
npm rebuild
echo ">>>>>>>>>>>>>>>>>>>>>>>>> installing dependency modules success !"

echo ">>>>>>>>>>>>>>>>>>>>>>>>> building front-end package ..."
npm run build
echo ">>>>>>>>>>>>>>>>>>>>>>>>> building front-end package success !"

echo ">>>>>>>>>>>>>>>>>>>>>>>>> set-up success !"