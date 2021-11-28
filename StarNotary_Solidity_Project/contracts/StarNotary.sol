// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Add a name and symbol properties
    string public constant name = 'vicDuToken';
    string public constant symbol = 'VDU';
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        // return the Star saved in tokenIdToStarInfo mapping
        Star memory starName = tokenIdToStarInfo[_tokenId];
        return starName.name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // Passing to star tokenId - need to check if the owner of _tokenId1 or _tokenId2 is the sender
        address addr1 = ownerOf(_tokenId1);
        address addr2 = ownerOf(_tokenId2);
        require(addr1 != addr2, "exchangeStars: Owner cannot exchange star between himself");
        uint256 tokenBelongsTo = 1;
        if(addr1 != msg.sender){
            require(addr2 == msg.sender, "exchangeStars: transfer of token that is not own");
            uint256 tokenBelongsTo = 2;
        }
        
        //Use _transferFrom function to exchange the tokens.
        if(tokenBelongsTo == 1){
            _transferFrom(addr1,addr2,_tokenId1);
            _transferFrom(addr2,addr1,_tokenId2);
        }else{
            _transferFrom(addr1,addr2,_tokenId2);
            _transferFrom(addr2,addr1,_tokenId1);
        }
    }

    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId) == msg.sender, "transferStar: transfer of token that is not own");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }

}