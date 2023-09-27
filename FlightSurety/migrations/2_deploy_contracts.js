const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    deployer.deploy(FlightSuretyData).then(async (instance) => { // the async  (instance) can be removed and replaced by () ; it's there only to check the contract address
        console.log("Contract deployed at address:", instance.address);
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address);
    }).then(() => {
        let config = {
            localhost: {
                url: 'http://localhost:8545',
                // url: 'http://localhost:7545',
                dataAddress: FlightSuretyData.address,
                appAddress: FlightSuretyApp.address
            }
        };
        fs.writeFileSync(__dirname + '/../src/dapp/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
        fs.writeFileSync(__dirname + '/../src/server/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
    });
}