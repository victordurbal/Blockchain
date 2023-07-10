// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct AirlineProfile {
        bool isRegistered;
        bytes32 airline_name;
        bool hasGivenFund;
    }
    mapping(address => AirlineProfile) officialAirline;   // Mapping for storing registered Airline

    mapping(address => uint32) voteForAirline; // number of vote a wannabe registered airline received
    mapping(address => mapping(address => bool)) HasVotedForSaidAirline; // check if voter has already voted to include airline or not - cannot vote twice
    uint256 private numVoterMin = 1;
    uint256 private numAirlineReg = 1;
    uint256 private counter = 1;

    mapping(address => bool) authorizedApp;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor()
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // the address that want to register an airline must be a registered airline itself, to give fund to the contract you need to be a registered airline
    modifier requireRegisteredAirline()
    {
        require(officialAirline[msg.sender].isRegistered, "Caller is not a registered airline");
        _;
    }

    modifier reEntrancyGuard() 
    {
        counter = counter.add(1);
        uint256 guard = counter;
        _;
        require(guard == counter, "Not allowed");
    }

    modifier appIsAuthorized() 
    {
        require(authorizedApp[msg.sender] == true, "Caller is not allowed");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public view returns(bool) 
    {
        return operational;
    }

    function authorizeCaller(address app_flightSurety) requireContractOwner public returns(bool){
        authorizedApp[app_flightSurety] = true;
        return true;
    }

    function isRegisteredAirline() public view returns(bool) 
    {
        return officialAirline[msg.sender].isRegistered;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external requireContractOwner 
    {
        require(mode != operational, "New mode must be different from existing mode");
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    

    // modify number of voters needed to register an airline
    function setNumberOfVoters(uint256 numbOfAirline) private{
        if (SafeMath.mod(numbOfAirline,2) != 0){
            numVoterMin = SafeMath.add(SafeMath.div(numbOfAirline,2),1); // if odd number of airline, round up (if 5 airlines are rgistered, need 3 to vote an airline in)
        } else{
            numVoterMin = SafeMath.div(numbOfAirline,2); // if even number of airline, half of them is needed to allow extra airline
        }
    }

    // check if an airline is registered
    function isAirlineRegistered(address account) external view returns(bool){
            require(account != address(0), "'account' must be a valid address.");
            return officialAirline[account].isRegistered;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineWhoVoted,address airlineAdr, bytes32 airlineName) external requireIsOperational appIsAuthorized returns(bool success, uint256 votes)
    {
        require(!officialAirline[airlineAdr].isRegistered, "Airline is already registered."); // if the airline is already registered there is no point re-adding it
        require(!HasVotedForSaidAirline[airlineWhoVoted][airlineAdr], 'Voter already voted to include airline');
        // only need one vote at first
        voteForAirline[airlineAdr] = voteForAirline[airlineAdr] + 1;
        if(voteForAirline[airlineAdr] >= numVoterMin){
            officialAirline[airlineAdr] = AirlineProfile({isRegistered: true, airline_name: airlineName, hasGivenFund: false});
            HasVotedForSaidAirline[airlineWhoVoted][airlineAdr] = true;
            success = true;
        } else {
            success = false;
        }
        numAirlineReg += 1;
        if(numAirlineReg >= 4){
            setNumberOfVoters(numAirlineReg);
        }
        return (success, voteForAirline[airlineAdr]);
    }

    mapping(bytes32 => mapping(address => uint256)) insurees;
    mapping(bytes32 => uint256) insureeCorresNum;
    mapping(uint256 => address) corresTable;
   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(address airlineAdr, bytes32 flight) requireIsOperational external payable returns(bool success)
    {
        require(officialAirline[airlineAdr].isRegistered, "Airline is not registered as part of the insurance.");
        require(officialAirline[airlineAdr].hasGivenFund, "Airline has not yet completed application. You cannot get insured with it yet.");
        require(insurees[flight][msg.sender] > 0, 'You already purchased insurance for this flight.');
        require(msg.value < 1 ether, 'You cannot purchase insurance for more than 1 ether.');
        payable(airlineAdr).transfer(msg.value);
        insurees[flight][msg.sender] = msg.value;
        insureeCorresNum[flight] = insureeCorresNum[flight] + 1;
        corresTable[insureeCorresNum[flight]] = msg.sender;

        return true;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    mapping(address => uint) credit_insuree;
    function creditInsurees(bytes32 flight) external requireIsOperational requireRegisteredAirline returns(bool success)
    {
        uint256 iCred = 1;
        uint256 creditAmount;
        for (iCred = 1; insureeCorresNum[flight] > iCred ; iCred++) { // insureeCorresNum provides number of insured people for every flights
            creditAmount = insurees[flight][corresTable[iCred]]; // find address of insuree via the variable corresTable
            insurees[flight][corresTable[iCred]] = 0;
            credit_insuree[corresTable[iCred]] = SafeMath.mul(SafeMath.add(SafeMath.div(3,2),SafeMath.mod(3,2)),creditAmount); // credit 1.5 x the insurance price
        }
        
        return true;
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() requireIsOperational reEntrancyGuard external payable returns(bool success)
    {
        require(credit_insuree[msg.sender] > 0, 'There is no fund to withdraw.');
        uint256 fundPayout = credit_insuree[msg.sender];
        credit_insuree[msg.sender] = 0;
        payable(msg.sender).transfer(fundPayout);

        return true;
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable requireIsOperational requireRegisteredAirline returns(bool success)
    {
        require(msg.value >= 10 ether,'At least 10 ether are needed to fund the membership.');
        officialAirline[msg.sender].hasGivenFund = true;
        
        return true;
    }

    function getContractBalance() view public requireContractOwner returns (uint)
    {
        return address(this).balance;    
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable 
    {
        require(msg.data.length == 0);
        fund();
    }


}

