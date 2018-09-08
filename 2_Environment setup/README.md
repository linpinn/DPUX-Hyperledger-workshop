# Prerequisites

## Installing Curl

Download at [link][curl-url].

You can check the version by running the following command:

```
curl --version
```
---

## Docker and Docker Compose

MacOSX, *nix, or Windows 10: Docker Docker version 17.06.2-ce or greater is required.

Download at [link][docker-url].

> Installing Docker for Mac or Windows, or Docker Toolbox will also install Docker Compose. If you already had Docker installed, you should check that you have Docker Compose version 1.14.0 or greater installed. If not, we recommend that you install a more recent version of Docker.

Installing docker-ce on ubuntu

```
sudo apt-get update
apt-get install docker-ce

```

You can check the version by running the following command:

```
docker --version
docker-compose --version
```

> If docker-compose is unavailable on your machine, try installing directly by following [link][docker-compose-url]

Run this command to test docker on your machine:

```
docker run hello-world
```

---

## Go

Hyperledger Fabric uses the Go Programming Language for many of its components.

Go version 1.10.x is required.

Download at [link][go-url].

You can check the version by running the following command:

```
go version
```

Set up path:

```
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

---

## Node.js Runtime and NPM

Node.js - version 8.9.x or greater

> Node.js version 9.x is not supported at this time.

Download at [link][nodejs-url].

> Installing Node.js will also install NPM, however it is recommended that you confirm the version of NPM installed. You can upgrade the `npm` tool with the following command:

```
npm install npm@5.6.0 -g
```

---

## Install Samples, Binaries and Docker Images

The following command will perform the these steps:

1. If needed, clone the hyperledger/fabric-samples repository
2. Checkout the appropriate version tag
3. Install the Hyperledger Fabric platform-specific binaries and config files for the version specified into the root of the fabric-samples repository
4. Download the Hyperledger Fabric docker images for the version specified

```
curl -sSL http://bit.ly/2ysbOFE | bash -s 1.2.0
```

Set up path:

```
export PATH=$(pwd)/bin:$PATH
```

---

## Clone workshop project

The workshop project is available on github. You can download it by running the following command:

```
git clone https://github.com/linpinn/DPUX-Hyperledger-workshop
```
---

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [curl-url]: <https://curl.haxx.se/download.html>
   [docker-url]: <https://www.docker.com/get-started>
   [go-url]: <https://golang.org/dl/>
   [nodejs-url]: <https://nodejs.org/en/download/>
   [docker-compose-url]: <https://docs.docker.com/compose/install/#install-compose>
