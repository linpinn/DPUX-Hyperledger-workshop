#!/bin/bash
# this script based on basic network on fabric-samples repository

CC_SRC_PATH=github.com/demo
LANGUAGE="golang" # node if chaincode written by nodejs
VERSION=1.1

# copy chaincode path to chaincode in fabric-samples
echo "copy chaincode to docker mounted path - fabric-samples .."
rm -Rf ../fabric-samples/chaincode/demo
cp -Rf demo ../fabric-samples/chaincode
ls ../fabric-samples/chaincode | grep demo

# start fabric network with cli
echo "start hyperledger fabric network .."
cd ../fabric-samples/basic-network
docker-compose up -d cli
cd -

# install chaincode
echo "install chaincode .."
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n demo -v $VERSION -p "$CC_SRC_PATH" -l "$LANGUAGE"

# instantiate chaincode
# -P is endorsement policy
echo "upgrade chaincode .."
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode upgrade -o orderer.example.com:7050 -C mychannel -n demo -l "$LANGUAGE" -v $VERSION -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 3s

echo "chaincode upgrade completed !!!"