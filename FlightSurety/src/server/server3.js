// const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
// const Config = require('./config.json');
// const Web3 = require('web3');
// const express = require('express');
// const path = require('path');

import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

// const config = Config['localhost'];
// // let web3Provider = new Web3.providers.HttpProvider(config.url);
// // let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
// const options = {
//   // Enable auto reconnection
//   reconnect: {
//       auto: true,
//       delay: 50000, // ms
//       maxAttempts: 10,
//       onTimeout: false
//   }
// };
// let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'), options)
// const web3 = new Web3(web3Provider);
// // const flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress, { data: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'});
// const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress, { data: config.dataAddress });
// console.log(web3.eth.getAccounts().then(function(results){return results}))
export default class Server {
  constructor(network, callback) {

    let config = Config[network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress, { data: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'});
    this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress, { data: config.dataAddress });
    this.appAdress = config.appAddress;
    this.startServer(callback);
  }

    async startServer(callback) {
      const getAccounts = () => {
                return new Promise((resolve, reject) => {
                  this.web3.eth.getAccounts((error, accts) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(accts);
                    }
                  });
                });
              };

      const accounts = await getAccounts();

      console.log(accounts[0])
    // Your code that depends on the accounts goes here
    // let fee = flightSuretyApp.methods.REGISTRATION_FEE.call();
    // for(let numOracle=10; numOracle<32; numOracle++) { // 0 to 9 accounts are for the airlines and passengers
    //   console.log('account ' + numOracle + ' = ' + web3.eth.accounts[numOracle])
    //   // flightSuretyApp.methods.registerOracle().send({ from: accounts[numOracle], value: Number(fee.toString()) });
    // }

    // flightSuretyApp.events.OracleRequest({
    //     fromBlock: 0
    //   }, function (error, event) {
    //     if (error){console.log(error)
    //     }else{
    //       console.log(event);
    //       for(let numOracle=10; numOracle<32; numOracle++) {
    //         try {
    //           let oracleIndexes = flightSuretyApp.methods.getMyIndexes.call({ from: accounts[numOracle]});
    //           let STATUS_CODE = Math.round((Math.random() * 10)/2)*10; // random number between 0, 10, 20 ,30 40 and 50
    //           for(let idx=0;idx<3;idx++) {
    //             flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx],config.firstAirline, flight, timestamp, STATUS_CODE).send({ from: accounts[numOracle] });
    //           }
    //         }catch(e) {
    //         // Enable this when debugging
    //         // console.log(e);
    //         // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
    //         }
    //       }
    //     }
    // });
  // } catch (error) {
  //   console.error(error);
  // }




// const accounts = await getAccounts();
// let fee = flightSuretyApp.methods.REGISTRATION_FEE.call();
// for(let numOracle=10; numOracle<32; numOracle++) { // 0 to 9 accounts are for the airlines and passengers
//   console.log('account ' + numOracle + ' = ' + web3.eth.accounts[numOracle])
//   // flightSuretyApp.methods.registerOracle().send({ from: accounts[numOracle], value: Number(fee.toString()) });
// }

// flightSuretyApp.events.OracleRequest({
//     fromBlock: 0
//   }, function (error, event) {
//     if (error){console.log(error)
//     }else{
//       console.log(event);
//       for(let numOracle=10; numOracle<32; numOracle++) {
//         try {
//           let oracleIndexes = flightSuretyApp.methods.getMyIndexes.call({ from: accounts[numOracle]});
//           let STATUS_CODE = Math.round((Math.random() * 10)/2)*10; // random number between 0, 10, 20 ,30 40 and 50
//           for(let idx=0;idx<3;idx++) {
//             flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx],config.firstAirline, flight, timestamp, STATUS_CODE).send({ from: accounts[numOracle] });
//           }
//         }catch(e) {
//         // Enable this when debugging
//         // console.log(e);
//         // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
//         }
//       }
//     }
// });
callback();
    };
  }

// const app = express();
// const server = app.listen(3000, () => {
//   const port = server.address().port;
//   console.log(`Server is running on port ${port}`);
// });

// app.get('/api', (req, res) => {
//   // res.send({
//   //   message: 'An API for use with your Dapp!',
//   // });
//   const filePath = path.join(__dirname, 'index.html');
//   res.sendFile(filePath);
// });
// // http://localhost:3000/api

// module.exports = app;
