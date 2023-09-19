var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
// ganache-cli --port 8545 --gasLimit 12000000 --accounts 50 --mnemonic 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

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
  "development": {
    accounts: 30,
    defaultEtherBalance: 1000,
  },
  compilers: {
    solc: {
      version: "^0.8.19"
      // version: "^0.8.13"
    }
  }
};

// module.exports = {
//   networks: {
//     development: {
//       provider: function() {
//         return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545");
//       },
//       // host: "127.0.0.1",     // Localhost (default: none)
//       // port: 7545,            // Standard Ethereum port (default: none)
//       network_id: "5777",        // Any network (default: none)
//       gas: 9999999
//     }
//   },
//   testnet: {
//     networkCheckTimeout: 10000,
//     timeoutBlocks: 200
//   },
//   compilers: {
//     solc: {
//       // version: "^0.8.19"
//       version: "^0.8.13"
//     }
//   }
// }