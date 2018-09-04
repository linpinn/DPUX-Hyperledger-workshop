# Extras
For additional package or source code will provide in this folder.

------------------------------------------
## Hyperledger Explorer
Hyperledger Explorer is a tool for block monitoring real time. The repository can be found follow [blockchain-explorer](https://github.com/hyperledger/blockchain-explorer).

------------------------------------------
## Prerequisite
Things to prepare for hyperledger explorer before start using.

> Components for hyperledger explorer can deploy on docker or locally. For this tutorial will deploy all component of hyperledger explorer locally.

1. Clone hyperledger explorer repository from github by 
`git clone https://github.com/hyperledger/blockchain-explorer`
2. Install postgresql by command `sudo apt-get install postgresql postgresql-contrib`
3. Change directory to ` app/persistence/postgreSQL/db/
` and execute shell `./createdb.sh` it will automatic create postgresql user and database
4. Change directory to blockchain-explorer
5. Install node modules for folder `root path, ./client, ./app/test` by `npm install`
6. Start unit testing for `./client, ./app/test` by `npm test`
7. Change directory to `./client` and use command `npm run build` to build react application

------------------------------------------
## Configurations
This project provided configuration for demo network already inside config and here is step to replace **config** folder.

1. `config.json` replace on `./app/platform/fabric`
2. `appconfig.json` replace on root directory
3. `package.json` replace on `./client`

------------------------------------------
## How to start
The starting step after install required stuffs and execute multiple command follow prerequisite step. The next step is

1. Start hyperledger explorer `./start.sh`
2. Access The API on `http://localhost:3004` depends on configuration
3. After Start tool and need to stop need to execute shell `./stop.sh`