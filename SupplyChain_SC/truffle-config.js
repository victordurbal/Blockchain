const HDwalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "< Metamask seed phrase >";
const EndPt = "< Infura Rinkeby Endpoint>";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDwalletProvider(mnemonic, EndPt),
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000
    },
  },
  compilers: {
    solc: {
      version: "0.5.16",
    }
  }
};