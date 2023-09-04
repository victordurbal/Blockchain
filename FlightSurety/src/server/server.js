const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
const Web3 = require('web3');
const express = require('express');
const path = require('path');

const config = Config['localhost'];
// let web3Provider = new Web3.providers.HttpProvider(config.url);
// let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
const options = {
  // Enable auto reconnection
  reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 50,
      onTimeout: false
  }
};
let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'), options) 
const web3 = new Web3(web3Provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// change here
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
const server = app.listen(3000, () => {
  const port = server.address().port;
  console.log(`Server is running on port ${port}`);
});

app.get('/api', (req, res) => {
  // res.send({
  //   message: 'An API for use with your Dapp!',
  // });
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});
// http://localhost:3000/api

module.exports = app;
