// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// contract address rinkeby 0x7B0b2aDa7c4d99d2ce483Bc65Ae305E81383E364
// contract ABI 0x7B0b2aDa7c4d99d2ce483Bc65Ae305E81383E364
// transaction hash 0x708067b93465ecf1ce8282e707723154cf018f7ccd16b4b2b2a900bf95aabc82

// Import library
import "../wineaccesscontrol/FarmerRole.sol";
import "../wineaccesscontrol/RetailerRole.sol";
import "../wineaccesscontrol/DistributorRole.sol";
import "../wineaccesscontrol/ConsumerRole.sol";
import "../winecore/Ownable.sol";

// Define a contract 'Supplychain'
contract SupplyChain is FarmerRole, RetailerRole, DistributorRole, ConsumerRole, Ownable{

  // Define 'owner'
  // address owner; // owner is define in ownable

  // Define a variable called 'upc' for Universal Product Code (UPC)
  uint  upc;

  // Define a variable called 'sku' for Stock Keeping Unit (SKU)
  uint  sku;

  // Define a public mapping 'items' that maps the UPC to an Item.
  mapping (uint => Item) items;

  // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash, 
  // that track its journey through the supply chain -- to be sent from DApp.
  mapping (uint => string[]) itemsHistory;
  
  // Define enum 'State' with the following values:
  enum State 
  { 
    Harvested,  // 0
    Processed,  // 1
    Packed,     // 2
    ForSale,    // 3
    Sold,       // 4
    Shipped,    // 5
    Received,   // 6
    Purchased   // 7
    }

  State constant defaultState = State.Harvested;

  // Define a struct 'Item' with the following fields:
  struct Item {
    uint    sku;  // Stock Keeping Unit (SKU)
    uint    upc; // Universal Product Code (UPC), generated by the Farmer, goes on the package, can be verified by the Consumer
    address ownerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages
    address originFarmerID; // Metamask-Ethereum address of the Farmer
    string  originFarmName; // Farmer Name
    string  originFarmInformation;  // Farmer Information
    string  originFarmLatitude; // Farm Latitude
    string  originFarmLongitude;  // Farm Longitude
    uint    productID;  // Product ID potentially a combination of upc + sku
    string  productNotes; // Product Notes
    uint    productPrice; // Product Price
    State   itemState;  // Product State as represented in the enum above
    address distributorID;  // Metamask-Ethereum address of the Distributor
    address retailerID; // Metamask-Ethereum address of the Retailer
    address consumerID; // Metamask-Ethereum address of the Consumer
  }

  // Define 8 events with the same 8 state values and accept 'upc' as input argument
  event Harvested(uint upc);
  event Processed(uint upc);
  event Packed(uint upc);
  event ForSale(uint upc);
  event Sold(uint upc);
  event Shipped(uint upc);
  event Received(uint upc);
  event Purchased(uint upc);

  // Define a modifer that checks to see if msg.sender == owner of the contract
  // modifier onlyOwner() override{ // already defined in Ownable
  //  require(msg.sender == owner);
  //  _;
  // }

  // Define a modifer that verifies the Caller
  modifier verifyCaller(address _address) {
    require(msg.sender == _address); 
    _;
  }

  // Define a modifier that checks if the paid amount is sufficient to cover the price
  modifier paidEnough(uint _price) { 
    require(msg.value >= _price); 
    _;
  }
  
  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValue(uint _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    address payable pdistributorID = payable(items[_upc].distributorID);
    pdistributorID.transfer(amountToReturn);
  }

  // Define a modifier that checks if an item.state of a upc is Harvested
  modifier harvested(uint _upc) {
    require(items[_upc].itemState == State.Harvested);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Processed
  modifier processed(uint _upc) {
    require(items[_upc].itemState == State.Processed);
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Packed
  modifier packed(uint _upc) {
    require(items[_upc].itemState == State.Packed);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is ForSale
  modifier forSale(uint _upc) {
    require(items[_upc].itemState == State.ForSale);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Sold
  modifier sold(uint _upc) {
    require(items[_upc].itemState == State.Sold);
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Shipped
  modifier shipped(uint _upc) {
    require(items[_upc].itemState == State.Shipped);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Received
  modifier received(uint _upc) {
    require(items[_upc].itemState == State.Received);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Purchased
  modifier purchased(uint _upc) {
    require(items[_upc].itemState == State.Purchased);
    _;
  }

  // In the constructor set 'owner' to the address that instantiated the contract
  // set 'sku' to 1
  // set 'upc' to 1
  constructor() payable {
    owner = msg.sender;
    sku = 1;
    upc = 1;
  }

  // Define a function 'kill' if required
  function kill() public {
    if (msg.sender == owner) {
      selfdestruct(payable(owner));
    }
  }

  // Define a function 'harvestItem' that allows a farmer to mark an item 'Harvested'
  function harvestItem(uint _upc, address _originFarmerID, string memory _originFarmName, string memory _originFarmInformation, string memory _originFarmLatitude, string memory _originFarmLongitude, string memory _productNotes) onlyFarmer() public 
  {
    // Add the new item as part of Harvest
    items[_upc] = Item({upc: _upc, sku: 0, ownerID: address(0x0), originFarmerID: _originFarmerID, originFarmName: _originFarmName, originFarmInformation: _originFarmInformation, originFarmLatitude: _originFarmLatitude, originFarmLongitude: _originFarmLongitude, productID: 0, productNotes: _productNotes, productPrice: 0, itemState: State.Harvested, distributorID: address(0x0), retailerID: address(0x0), consumerID: address(0x0)});

    // Increment sku
    sku = sku + 1;
    items[_upc].sku = sku;
    
    items[_upc].productID = _upc*10000 + sku;
    items[_upc].ownerID = owner;
    // Emit Harvested event
    emit Harvested(_upc);
  }

  // Define a function 'processItem' that allows a farmer to mark an item 'Processed'
  function processItem(uint _upc) harvested(_upc) verifyCaller(items[_upc].originFarmerID) public 
  {
    items[_upc].itemState = State.Processed;
    // Emit Processed event
    emit Processed(_upc);
  }

  // Define a function 'packItem' that allows a farmer to mark an item 'Packed'
  function packItem(uint _upc) processed(_upc) verifyCaller(items[_upc].originFarmerID) public
  {
    items[_upc].itemState = State.Packed;
    // Emit Packed event
    emit Packed(_upc);
  }

  // Define a function 'sellItem' that allows a farmer to mark an item 'ForSale'
  function sellItem(uint _upc, uint _price) verifyCaller(items[_upc].originFarmerID) packed(_upc) public 
  {
    items[_upc].itemState = State.ForSale;
    items[_upc].productPrice = _price;
    // Emit ForSale event
    emit ForSale(_upc);
  }

  // Define a function 'buyItem' that allows the disributor to mark an item 'Sold'
  function buyItem(uint _upc) forSale(_upc) paidEnough(_upc) checkValue(_upc) onlyDistributor() public payable 
  {
    // Update the appropriate fields - distributorID, itemState
    items[_upc].distributorID = msg.sender;
    items[_upc].itemState = State.Sold;
    // Transfer money to farmer
    address payable pFarmerAddress = payable(items[_upc].originFarmerID);
    pFarmerAddress.transfer(items[_upc].productPrice);
    // emit Sold event
    emit Sold(_upc);
  }

  // Define a function 'shipItem' that allows the distributor to mark an item 'Shipped'
  function shipItem(uint _upc) sold(_upc) onlyDistributor() public 
  {
    items[_upc].itemState = State.Shipped;
    // Emit Shipped event
    emit Shipped(_upc);
  }

  // Define a function 'receiveItem' that allows the retailer to mark an item 'Received'
  function receiveItem(uint _upc) shipped(_upc) onlyRetailer() public 
  {
    // Update the appropriate fields - retailerID, itemState
    items[_upc].retailerID = msg.sender;
    items[_upc].itemState = State.Received;
    // Emit Received event
    emit Received(_upc);
  }

  // Define a function 'purchaseItem' that allows the consumer to mark an item 'Purchased'
  function purchaseItem(uint _upc) received(_upc) onlyConsumer() public 
    {
    // Update the appropriate fields - consumerID, itemState
    items[_upc].consumerID = msg.sender;
    items[_upc].itemState = State.Purchased;
    // Emit Purchased event
    emit Purchased(_upc);
  }

  // Define a function 'fetchItemBufferOne' that fetches the data
  function fetchItemBufferOne(uint _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  address ownerID,
  address originFarmerID,
  string memory originFarmName,
  string memory originFarmInformation,
  string memory originFarmLatitude,
  string memory originFarmLongitude
  ) 
  {
  itemSKU = items[_upc].sku;
  itemUPC = _upc;
  ownerID = items[_upc].ownerID;
  originFarmerID = items[_upc].originFarmerID;
  originFarmName = items[_upc].originFarmName;
  originFarmInformation = items[_upc].originFarmInformation;
  originFarmLatitude = items[_upc].originFarmLatitude;
  originFarmLongitude = items[_upc].originFarmLongitude;

  return 
  (itemSKU,
  itemUPC,
  ownerID,
  originFarmerID,
  originFarmName,
  originFarmInformation,
  originFarmLatitude,
  originFarmLongitude);
  }

  // Define a function 'fetchItemBufferTwo' that fetches the data
  function fetchItemBufferTwo(uint _upc) public view returns 
  (uint    itemSKU,
  uint    itemUPC,
  uint    productID,
  string memory productNotes,
  uint    productPrice,
  uint    itemState,
  address distributorID,
  address retailerID,
  address consumerID  ) 
  {
  itemSKU = items[_upc].sku;
  itemUPC = _upc;
  productID = items[_upc].productID;
  productNotes = items[_upc].productNotes;
  productPrice = items[_upc].productPrice;
  itemState = uint(items[_upc].itemState);
  distributorID = items[_upc].distributorID;
  retailerID = items[_upc].retailerID;
  consumerID = items[_upc].consumerID;

  return 
  (
  itemSKU,
  itemUPC,
  productID,
  productNotes,
  productPrice,
  itemState,
  distributorID,
  retailerID,
  consumerID
  );
  }
}
