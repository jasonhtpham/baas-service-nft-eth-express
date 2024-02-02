# Baas-service-sepoliaCompany

This is a Node Express application that serves as a company service. This service provides a route to deploy a company given certain parameters to the Sepolia TestNet.

## Other BaaS services we offer.

There are also other baas services that we have developed. These include:

- [Mint NFT](https://github.com/deakin-launchpad/baas-service-mintNFT)

- [Local Counter](https://github.com/deakin-launchpad/baas-service-localCounter)

- [Voting](https://github.com/deakin-launchpad/baas-service-createVoting)

- [Company](https://github.com/deakin-launchpad/baas-service-createcompany)

- [Sepolia Counter](https://github.com/deakin-launchpad/baas-service-sepoliaCounter)

There will be many more to come!

## Pre-requisite

- [Nodejs](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)

## Setup Node.js

In order to setup NodeJS you need to fellow the current steps:

### Mac OS X

- Step1: Install Home brew

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

$ brew -v
```

- Step2: Install Node using Brew

```
$ brew install node

$ node -v

$ npm -v
```

### Linux Systems

- Step1: Install Node using apt-get

```
$ sudo apt-get install curl python-software-properties

$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

$ sudo apt-get install nodejs

$ node -v

$ npm -v
```

## Setup Service

This is the Sepolia Counter service. There are two routes available through this service. These are:

```
1. /api/demo/increase_counter

2. /api/demo/decrease_counter
```

To run the service, simply follow these steps:

- Step1: Clone this repository

```
$ git clone https://github.com/deakin-launchpad/baas-service-sepoliaCounter

$ cd baas-service-sepoliaCounter
```

- Step2: Install node modules

```
$ npm i

or

$ npm install
```

- Step3: Copy .env.example to .env

```
$ cp .env.example .env
```

- Step4: Start the application

```
$ npm run start
```

or to start in dev mode

```
$ npm run startWithNodemon
```

The current version of your application would be running on **http://localhost:8080** or **http://IP_OF_SERVER:8080** (in case you are running on the server)

## Setup Node User Onboarding Application

This is another application that is required to interact with services like this

- Step1: Git clone the application

```
$ git clone https://github.com/deakin-launchpad/baas_backend

$ cd baas_backend
```

- Step2: Install node modules

```
$ npm i

or

$ npm install
```

- Step3: Copy .env.example to .env

```
$ cp .env.example .env
```

- Step4: Start the application

```
$ npm run start
```

or to start in dev mode

```
$ npm run startWithNodemon
```

The current version of your application would be running on **http://localhost:8080** or **http://IP_OF_SERVER:8080** (in case you are running on the server)

## Further Documentation

This service uses the **Sepolia testnet**.

We are currently using **web3** and **Infura** to interact with the contract. You need to have an account with Infura if you are using the same.

In the .env file, insert your Infura API key at the end of the **SEPOLIA_RPC** value. Example: **wss://sepolia.infura.io/ws/v3/INFURA_API_KEY**

We are using the **websocket secure (wss)** protocol to connect instead of https due to some connection issues that arise when using https.

Since the service needs an account to interact with the contract, create an Ethereum account and retrieve the private key for that account. You will need to input this key in the .env file for **PRIVATE_KEY**.

We developed and tested this service's contract using the **Remix IDE** which is a no-setup tool with a GUI for developing smart contracts. You can access this IDE online at: https://remix.ethereum.org/

We used **MetaMask** as our wallet to interact with the contract. More details about MetaMask can be accessed through their website at: https://metamask.io/. They have support for most major browsers through extensions, and have apps for Android and iOS. You can import the Ethereum account you created earlier into MetaMask or you can create a new account.

Once MetaMask is setup, you can change the environment on the Remix IDE to injected provider and use MetaMask.

We used solidity compiler version **0.8.17** and pragma solidity **^0.8.0** for our development of the contract.

Within the source code of this service, there are files called Company.sol, Share.sol, and Coin.sol within src/contracts folder which contain the solidity code for the contracts. The ABIs and ByteCodes for these contracts which are required to deploy and interact with the methods on the contract are within the ABI and ByteCode folders respectively within the src/contracts folder.

The setup bit at the start of the controller is the most important part of the service. If this fails, the service will not work as expected.

```javascript
// Setup
const provider = new Web3.providers.WebsocketProvider(process.env.SEPOLIA_RPC); // Set provider for sepolia node
const web3 = new Web3(provider); // Create web3 instance
const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY); // Set signer from private key
web3.eth.accounts.wallet.add(signer); // Add signer to wallet
```

First, the provider is initiated as a web3 websocketprovider using the Sepolia Infura RPC wss URL.

Next, the signer is initiated using the private key for the account we created earlier. This is how the contract method call transactions are signed.

The createCompany method within the createCompanyController is what does the actual company, coins, and shares creation and distribution.

The payload object must contain the following fields:

```
{
	companyName: String,
	sharesName: String,
	sharesSymbol: String,
	sharesQuantity: Number,
	sharesDecimals: Number,
	coinsName: String,
	coinsSymbol: String,
	coinsQuantity: Number,
	coinsDecimals: Number,
	founders: Array[String]
}
```

This service will return the following fields post completion:

```
{
	companyContractAddress: String,
	sharesContractAddress: String,
	coinsContractAddress: String
}
```

### Example

#### Input

```
{
  "jobID": "string",
  "datashopServerAddress": "string",
  "dataFileURL": {
    "url": "string",
    "json": {
      "companyName": "TestCompany",
      "sharesName": "TestShares",
      "sharesSymbol": "TSH",
      "sharesQuantity": 100,
      "sharesDecimals": 18,
      "coinsName": "TestCoins",
      "coinsSymbol": "TCO",
      "coinsQuantity": 100,
      "coinsDecimals": 18,
      "founders": [
        {
          "addr": "0x5b637ccCf5A0c3B79f1347993f0f489a7fD40AF1",
          "shares": 50
        },
        {
          "addr": "0x7f7734A5CF085896a7682ff8F65E397ECD1b2B59",
          "shares": 20
        }
      ]
    }
  }
}
```

#### Output

```
{
	companyContractAddress: "0xD27C481EC1532Be11Fa9Ebd70C2Cdd18377a4d4a",
	sharesContractAddress: "0xCea4e77fE9174688dFc9cbB619325e3cC8eA9Bdd",
	coinsContractAddress: "0x6b85B91C7C9A4836AB60799043c5D1A721D98b43"
}
```

#### Remix test founders tuple

```
[["0x5b637ccCf5A0c3B79f1347993f0f489a7fD40AF1",50],["0x7f7734A5CF085896a7682ff8F65E397ECD1b2B59",30]]
```

**Refer to the source code of this repository for further reference on how to create a service to be used with the BAAS platform.**
