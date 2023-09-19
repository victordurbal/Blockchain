import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
// import { toWei } from 'web3-utils';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress, { data: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'});
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress, { data: config.dataAddress });
        this.appAdress = config.appAddress;
        this.initialize(callback);

        this.owner = null;
        this.airlines = [];
        this.airlinesNames = [];
        this.flights = [];
        this.AirlineFlights = {};
        this.passengers = [];
        // this.getBalance();
        // this.getLength();
        // console.log('NUMBER OF ACCOUNT ' + this.web3.eth.accounts.length);
        // console.log(this.web3.personal.newAccount());
        // console.log(this.web3.eth.accounts.length);
    }
    
    getLength(){
        console.log('NUMBER OF ACCOUNT ' + this.web3.eth.accounts.length);
    }

    getBalance(){
        this.web3.eth.getBalance('0x627306090abaB3A6e1400e9345bC60c78a8BEf57', (error, balance) => {
            if (error) {
                console.error(error);
            } else {
                console.log(`Account ${'0x627306090abaB3A6e1400e9345bC60c78a8BEf57'} has a balance of ${this.web3.utils.fromWei(balance, "ether")} Ether`);
            }
        });
    }

    async initialize(callback) {
        // this.web3.eth.getAccounts((error, accts) => {
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
            
            try {
                const accts = await getAccounts();
            
            this.owner = accts[0];
            console.log(this.owner);
            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }
            this.airlinesNames[this.airlines[0]] = "Ryanair";
            this.airlinesNames[this.airlines[1]] = "Easyjet";
            this.airlinesNames[this.airlines[2]] = "Lufthansa";

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            let numFlight = 10;
            while(this.flights.length < 3) {
                numFlight++;
                this.flights.push("R" + numFlight.toString() + "AIR")
            }
            this.AirlineFlights[this.airlinesNames[this.airlines[0]]] = [this.flights[0], this.flights[1], this.flights[2]];
            numFlight = 23;
            while(this.flights.length < 6) {
                numFlight++;
                this.flights.push("E" + numFlight.toString() + "FLY")
            }
            this.AirlineFlights[this.airlinesNames[this.airlines[1]]] = [this.flights[3], this.flights[4], this.flights[5]];
            numFlight = 36;
            while(this.flights.length < 9) {
                numFlight++;
                this.flights.push("L" + numFlight.toString() + "SKY")
            }
            this.AirlineFlights[this.airlinesNames[this.airlines[2]]] = [this.flights[6], this.flights[7], this.flights[8]];

            // console.log('App address is ' + this.appAdress)

            await this.flightSuretyData.methods.authorizeCaller(this.appAdress).send({ from: this.owner})
                .on('transactionHash', function(hash){
                    console.log('Transaction hash:', hash);
                })
                .on('receipt', function(receipt){
                    console.log('Transaction receipt auth caller :', receipt);
                })
                .on('error', function(error){
                    console.log('Error:', error);
                });
            
            try{
                await this.initializeAirline(1);
            }catch(e){
            }

            for(let iAirline = 0 ; iAirline < 3 ; iAirline++){
                // let iAirline = 2;
                let ifRegistered = await this.flightSuretyData.methods.isAirlineRegistered(this.airlines[iAirline]).call();
                if (!ifRegistered){
                    await this.initializeAirline(iAirline);
                }else{
                    console.log('Airline ' + this.airlinesNames[this.airlines[iAirline]] + ' is already registered.')
                }
                let ifFunded = await this.flightSuretyData.methods.hasGivenFund(this.airlines[iAirline]).call();
                if (!ifFunded){
                    this.fundContract(iAirline);
                }else{
                    console.log('Airline ' + this.airlinesNames[this.airlines[iAirline]] + ' already funded the contract.')
                }
            }
            for(let iAirline = 0 ; iAirline < 3 ; iAirline++){
                for(let iFlight = 0 ; iFlight < 3 ; iFlight++){
                    await this.registerFlight(iAirline,iFlight);
                }
            }
            //http://localhost:8000/#

            await this.flightSuretyApp.methods.isFlightRegistered(this.AirlineFlights[this.airlinesNames[this.airlines[0]]][0]).call(function(error, result) {
                console.log('2) Flight is registered : ', result);
            });
            await this.flightSuretyApp.methods.registerFlight('A', 20, 10).call({ from: this.airlines[2]});
            await this.flightSuretyApp.methods.isFlightRegistered('A').call(function(error, result) {
                console.log('IS FLIGHT A registered : ', result);
            });
            await this.flightSuretyApp.methods.getFlightStatus('A').call(function(error, result) {
                console.log('Flight STATUS is : ', result);
            });
            await this.flightSuretyApp.methods.getFlightAirline('A').call(function(error, result) {
                console.log('address airline for flight is : ', result.toString());
            });

            callback();
        // });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    isAuth(){
        this.flightSuretyData.methods.isAppAuthorized(this.appAdress).call(function(error, result) {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Output appIsAuthorised : ', result);
            }
            })
    }

    async initializeAirline(airlineNumber){
        await this.flightSuretyApp.methods.registerAirline(this.airlines[airlineNumber], this.airlinesNames[this.airlines[airlineNumber]]).send({ 
            "from": this.owner,  
            "gas": 4712388,
            "gasPrice": 100000000000
        }) //.on('transactionHash', function(hash){console.log('Transaction hash:', hash);})
        .on('receipt', function(receipt){
            console.log('Transaction receipt reg airl:', receipt);
        })
        .on('error', function(error){
            console.log('Error :', error);
        });
        this.flightSuretyData.methods.isAirlineRegistered(this.airlines[airlineNumber]).call(function(error, result) {
            if (error) {console.log('Error check :', error);} else {console.log('Airline ' + airlineNumber.toString() + ' is registered :', result);}});
    }

    async fundContract(airlineNumber){
        // fund the contract
        await this.flightSuretyData.methods.fund().send({from: this.airlines[airlineNumber], value: Web3.utils.toWei('10', 'ether')}).on('receipt', function(receipt){
            console.log('Transaction receipt funding :', receipt);})
        .on('error', function(error){
            console.log('Error :', error);
        });
        this.flightSuretyData.methods.hasGivenFund(this.airlines[airlineNumber]).call(function(error, result) {
            if (error) {console.log('Error check :', error);} else {
            console.log('Airline ' + airlineNumber.toString() + ' has funded contract : ', result);
            }
        });
    }

    async registerFlight(airlineNumber,flightNumber){
        let timestamp = Math.floor(Date.now() / 1000);
        // this.AirlineFlights[this.airlinesNames[this.airlines[airlineNumber]]][flightNumber]
        await this.flightSuretyApp.methods.registerFlight('A', 20, timestamp).call({ from: this.airlines[airlineNumber]},function(error, result) {
        if (error) {
            console.log('Error check :', error);
        } else {
            console.log('flight ' + flightNumber.toString() + ' registered :', result);
        }});

        await this.flightSuretyApp.methods.isFlightRegistered('A').call(function(error, result) {
            console.log('1) Flight is registered : ', result);
        });
    }

    pay(msgSender){
        let self = this;
        self.flightSuretyData.methods.pay().call({ from: msgSender});
    }

    hasGivenFund(addrAirline){
        this.flightSuretyData.methods.hasGivenFund(addrAirline).call(function(error, result) {
            if (error) {
              console.log('Error check :', error);
            } else {
              console.log('Airline has funded contract :', result);
            }
        });
    }

    displayCreditAmount(msgSender){
        let self = this;
        self.flightSuretyData.methods.displayInsureeCreditAmount().call({ from: msgSender});
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    insureFlight(airlineAdr, flight, msgSender, callback) {
        let self = this;
        self.flightSuretyData.methods
             .buy(airlineAdr, flight)
             .send({ from: msgSender}, callback);
     }

    fetchFlightStatus(flight,timestampFlight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: timestampFlight
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }


}