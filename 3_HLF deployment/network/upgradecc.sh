#!/bin/bash
# this script based on basic network on fabric-samples repository

CC_SRC_PATH=github.com/testchaincode
LANGUAGE="golang" # node if chaincode written by nodejs

# copy chaincode path to chaincode in fabric-samples
rm -Rf ../fabric-samples/chaincode/testchaincode
cp -Rf testchaincode ../fabric-samples/chaincode
ls ../fabric-samples/chaincode | grep testchaincode

# start fabric network with cli
cd ../fabric-samples/basic-network
./start.sh
docker-compose up -d cli
cd -

# install chaincode
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n testchaincode -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"

# instantiate chaincode
# -P is endorsement policy
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode upgrade -o orderer.example.com:7050 -C mychannel -n testchaincode -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10

echo "chaincode upgrade completed !!!"