# HLF Deployment
Hyperledger Faric Deployment is a one of important step to see results after develop API and Chaincode.

------------------------------------------
## Prerequisite
There is a repository that relate with this project and need to clone from repository first before deploy A Hyperledger Fabric network.

`git clone https://github.com/hyperledger/fabric-samples`

[fabric-samples](https://github.com/hyperledger/fabric-samples) - official hyperledger fabric network with API and Chaincode examples

------------------------------------------
## File Structure
This project provide file structure like this.

```
.
+-- application
|   +-- application
|   |   +-- postman
|   |   +-- src
|   |   |   +-- config
|   |   |   +-- controllers
|   |   |   +-- routes
|   |   |   +-- service
|   |   |   +-- app.js
+-- fabric-samples
|   +-- basic-network
|   |   +-- start.sh
|   |   +-- stop.sh
|   |   +-- generate.sh
|   +-- chaincode
+-- network
|   +-- deployNetwork.sh
|   +-- upgradecc.sh
|   +-- demo
|   |   +--demo.go
|   +-- README.MD
```
------------------------------------------
## How to start
After all of prerequisite has been installed for step to start whole hyperledger fabric system need to do step follow.

1. Hyperledger Fabric Network Deployment
2. Chaincode Deployment
3. API Deployment

------------------------------------------
## Application
Demo API developed for demo chaincode before start api should start hyperledger fabric network and deploy chaincode first.

------------------------------------------
## Network
The hyperledger fabric network contains with multiple components such as peer, orderer, chaincode container, certificate authority(CA) and command line interface(cli) for hyperledger.