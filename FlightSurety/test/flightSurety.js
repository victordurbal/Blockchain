
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

var FlightSuretyData = artifacts.require("FlightSuretyData");

contract('Flight Surety Tests', async (accounts) => {

    let flightSuretyData;
    var config;
    beforeEach('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address, { from: accounts[0] });
        flightSuretyData = await FlightSuretyData.deployed();
        console.log("FlightSuretyData contract deployed at address:", flightSuretyData.address);
    });

    web3.eth.getBalance(accounts[0], (error, balance) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Account ${accounts[0]} has a balance of ${web3.utils.fromWei(balance, "ether")} Ether`);
        }
    });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/
    // it('Is ope : ', async () => {
    //     const config = await Test.Config(accounts);
    //     let status = await config.flightSuretyData.isOperational();
    //     console.log('Operational status is : ' + status);
    // });

    // it(`ok let's test`, async function () {
    //     console.log(config.testAddresses)
    // });

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });
//   it(`(multiparty) has correct initial isOperational() value`, async function () {
    // const insurData = await config.flightSuretyData.deployed()
    // Get operating status
    // let status = await insurData.isOperational({ from: accounts[0] });
    // assert.equal(status, true, "Incorrect initial operating status value");
//     assert.equal(true, true, "Incorrect initial operating status value");
//   });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSuretyApp.registerAirline(accounts[5], 'airline', { from: accounts[3] });
      }
      catch(e) {
        // console.log(e);
        reverted = true;
      }
      try 
      {
          await config.flightSuretyData.buy(accounts[3], 'airline', { from: accounts[10] });
      }
      catch(e) {
        // console.log(e);
        reverted = true;
      }
      try 
      {
          await config.flightSuretyData.creditInsurees('airline', { from: accounts[10] });
      }
      catch(e) {
        // console.log(e);
        reverted = true;
      }
      try 
      {
          await config.flightSuretyData.pay({ from: accounts[10] });
      }
      catch(e) {
        // console.log(e);
        reverted = true;
      }
      try 
      {
          await config.flightSuretyData.fund({ from: accounts[10], value: web3.utils.toWei('10', 'ether')});
      }
      catch(e) {
        // console.log(e);
        reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);
  });

  it('airline account 1 is registered as an Airline', async () => {
    let result = true;
    try{
        result = await config.flightSuretyApp.isAirlineRegistered(config.firstAirline, {from: config.firstAirline});
    }
    catch(e){
        result = false;
    }
    assert.equal(result, true, "Airline is not registered.");
});

  // If airline did not fund the contract, it cannot register an airline
  it('(airline) CANNOT register an Airline using registerAirline() if did not fund the contract', async () => {
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        let res = await config.flightSuretyApp.registerAirline(newAirline, 'airlineName',{from: config.firstAirline});
    }
    catch(e) {
      console.log('Registering Airline has been reverted');
    }

    await config.flightSuretyData.hasGivenFund(config.firstAirline).then(result => {
      console.log('Airline has given fund :', result);
    });
    
    let result = await config.flightSuretyApp.isAirlineRegistered(newAirline);
    
    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  // Test first airline CAN register an airline
  it('(airline) CAN register an Airline using registerAirline() if it has funded the contract', async () => {
    // ARRANGE
    let newAirline = accounts[2];

    // fund contract and confirm
    try {
        await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') })
        .then(result => {
            console.log('funding has worked :', result.receipt.status);
          });
    }
    catch(e) {
    }
    // check if funding has been successful
    await config.flightSuretyData.hasGivenFund(config.firstAirline).then(result => {
      console.log('Airline has given fund :', result);
    })
    .catch(error => {
      console.log('Error:', error);
    });
    // register new airline
    try {
        await config.flightSuretyApp.registerAirline(newAirline, 'airlineName',{from: config.firstAirline});
    }
    catch(e) {
      console.log('error reg airline last one : ', e);
    }

    let result = await config.flightSuretyApp.isAirlineRegistered(newAirline);
    // .then(result_Reg => {
    //   console.log('Is airline registered answer : ', result_Reg);
    // });

    // ASSERT
    assert.equal(result, true, "Airline should be able to register another airline if it has provided funding");

  });

  it('Unauthorize the app to register airline with unAuthorizeCaller()', async () => {
    result = true;
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];

    // fund contract with existing airline so it is allowed to register others
    await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') })
        .then(result => {
            console.log('funding has worked :', result.receipt.status);
    });

    // first airline should be able to be registered as app authorized
    await config.flightSuretyApp.registerAirline.call(newAirline1, 'airlineName',{from: config.firstAirline}).then(result => {
      console.log('Airline1 is registered :', result.success, ' , number of votes received for registration : ', result.votes.toString());
    });
    await config.flightSuretyApp.registerAirline(newAirline1, 'airlineName',{from: config.firstAirline});

    // unauthorize the app to work
    await config.flightSuretyData.unAuthorizeCaller(config.flightSuretyApp.address);

    // if the app is unauthorized the next airline should not be able to be registered
    try {
      await config.flightSuretyData.registerAirline(newAirline2, 'airlineName',{from: config.firstAirline});
    }
    catch(e) {
      result = false;
    }

    assert.equal(result, false, "App is still authorized.");
});

it('Insurance can be bought for the flight of an airline', async () => {
    let result = true;

    // fund the contract so customer can purchase insurance
    await config.flightSuretyData.fund.call({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') }).then(result => {
      console.log('Airline has funded the contract : ', result);
    });
    await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') });

    await config.flightSuretyApp.registerFlight.call('flightName', 0, 1691094961,{from: config.firstAirline}).then(result => {
      console.log('Flight has been registered : ', result);
    });

    try{
      await config.flightSuretyApp.registerFlight('flightName', 0, 1691094961,{from: config.firstAirline});
    }catch(e){
      // console.log(e);
    }

    await config.flightSuretyData.buy.call(config.firstAirline, 'flightName', { from: accounts[8], value: web3.utils.toWei('0.1', 'ether') }).then(result => {
      console.log('Customer bought insurance : ', result);
    });
    try{
      await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[8], value: web3.utils.toWei('0.1', 'ether') });
    }catch(e){
      console.log(e);
      result = false;
    }
    assert.equal(result, true, "Insurance could not be bought for the flight.");
});

it('Insurance purchase is not allowed if price is over 1 ether', async () => {
  let result = true;
  let result2 = true;
  // fund the contract so customer can purchase insurance
  await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') });
  await config.flightSuretyApp.registerFlight('flightName', 0, 1691094961,{from: config.firstAirline});
  try{
    await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[8], value: web3.utils.toWei('1', 'ether') });
  }catch(e){
    result = false;
  }
  assert.equal(result, true, "Insurance should not be purchased if input higher than 1 ether.");

  try{
    await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[8], value: web3.utils.toWei('2', 'ether') });
  }catch(e){
    result2 = false;
  }
  assert.equal(result2, false, "Insurance should not be purchased if input higher than 1 ether.");
});

it('If flight is delayed and credit is paid, customer can receive his fund', async () => {
  let result = true;
  // fund the contract so customer can purchase insurance
  await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10', 'ether') });
  await config.flightSuretyApp.registerFlight('flightName', 0, 1691094961,{from: config.firstAirline});
  await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[8], value: web3.utils.toWei('1', 'ether') });
  // await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[9], value: web3.utils.toWei('1', 'ether') });
  // await config.flightSuretyData.buy(config.firstAirline, 'flightName', { from: accounts[7], value: web3.utils.toWei('1', 'ether') });
  await config.flightSuretyData.creditInsurees.call('flightName',{from: config.firstAirline}).then(result => {
          console.log('Insuree has been credited : ', result);
  });
  await config.flightSuretyData.creditInsurees('flightName',{from: config.firstAirline});

  await config.flightSuretyData.pay.call({ from: accounts[8]}).then(result => {
    console.log('Customer received the money : ', result.toString());
  });

  await config.flightSuretyData.getContractBalance.call().then(result => {
    console.log('Account PRIOR paying : ', (result/1000000000000000000).toString());
  });

  try{
    await config.flightSuretyData.pay({ from: accounts[8]});
    // await config.flightSuretyData.pay({ from: accounts[9]});
    // await config.flightSuretyData.pay({ from: accounts[7]});
  }catch(e){
    result = false;
  }

  await config.flightSuretyData.getContractBalance.call().then(result => {
    console.log('Account AFTER paying : ', (result/1000000000000000000).toString());
  });

  assert.equal(result, true, "Customer should have received his money.");
});

});
