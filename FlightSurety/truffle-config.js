var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  contracts_directory: './contracts',
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      gas: 9999999
    }
  },
  testnet: {
    networkCheckTimeout: 10000,
    timeoutBlocks: 200
  },
  compilers: {
    solc: {
      version: "^0.8.19"
    }
  }
};