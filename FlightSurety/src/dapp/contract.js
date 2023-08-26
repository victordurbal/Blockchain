import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

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
        this.getBalance();
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

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
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

            this.flightSuretyData.methods.authorizeCaller(this.appAdress).send({ from: this.owner});
            try{
                // this.flightSuretyData.methods.registerAirline(this.owner, this.airlines[0], this.airlinesNames[this.airlines[0]]).send({ from: this.owner});
                this.flightSuretyApp.methods.registerAirline(this.airlines[0], this.airlinesNames[this.airlines[0]]).send({ from: this.owner});
            }catch(e){
                console.log('error message is : ' + e);
            }
            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}