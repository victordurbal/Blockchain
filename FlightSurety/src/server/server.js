import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
// let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
// let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
// web3Provider.on('error', (error) => {
//     console.error('Web3 provider error:', error);
// });
// web3Provider.on('connect', () => {
//     console.log('Web3 provider connected');
// });
// let web3 = new Web3(web3Provider);
let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
// let web3Provider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545");
web3Provider.on('error', (error) => {
    console.error('Web3 provider error:', error);
});
web3Provider.on('connect', () => {
    console.log('Web3 provider connected');
});
web3Provider.on('end', () => {
    console.log('Web3 provider connection ended');
});
let web3 = new Web3(web3Provider);  
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// change here
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
