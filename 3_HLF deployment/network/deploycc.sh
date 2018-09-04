#!/bin/bash
# this script based on basic network on fabric-samples repository

CC_SRC_PATH=github.com/chaincode
LANGUAGE="golang" # node if chaincode written by nodejs

# clear old chaincode images
docker rmi $(docker images | grep dev-peer | awk '{print $3}')

# copy chaincode path to chaincode in fabric-samples
rm -Rf ../fabric-samples/chaincode/chaincode
cp -Rf chaincode ../fabric-samples/chaincode
ls ../fabric-samples/chaincode | grep chaincode

# start fabric network with cli
cd ../fabric-samples/basic-network
./start.sh
docker-compose up -d cli
cd -

# install chaincode
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n chaincode -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"

# instantiate chaincode
# -P is endorsement policy
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n chaincode -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10

echo "chaincode deployment completed !!!"
