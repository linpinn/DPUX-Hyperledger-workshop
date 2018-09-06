# Chaincode Deployment
This part use for chaincode deployment and step should follow as list below.

1. Run bash script `./deployNetwork.sh` The Hyperledger Fabric Network will start with container follow by list below. 

```
+- fabric-peer
+- fabric-orderer
+- fabric-couchdb
+- fabric-ca
+- fabric-tools
```

2. In case of chaincode upgrade can run bash script `./upgradecc.sh`

-------------------------------------------------------------
# Test Chaincode without API
For chaincode developer and no need to start with API. Chaincode can tested by using command line.
- Invoke Chaincode
  ```
  docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n demo -c '{"function":"invoke","Args":[""]}'
  ```
- Query Chaincode
  ```
  docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C demo -n testchaincode -c '{"function":"query","Args":[""]}'
  ```
------------------------------------------------------
## Cannot deploy chaincode
In case of cannot deploy chaincode. the solution for fix this problem shown below.

1. Remove old docker images of chaincode named like `dev-peer0.org1.example.com-demo-1.0-{hash}`
2. Try to restart `./deployNetwork.sh` or retry step to install and instancetiate again.