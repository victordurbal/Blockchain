/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create the private blockchain
 *  It usesthe library 'crypto-js' to create the hashes for each block and 'bitcoinjs-message'
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time the application is ran, the chain will be empty
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class
     * Also everytime a Blockchain class is created, it will initialize the chain by creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method returns a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
           let height = await self.getChainHeight();
           block.height = height + 1;
           block.time = new Date().getTime().toString().slice(0,-3);
           if(block.height > 0){
               block.previousBlockHash = self.chain[self.height].hash;
            }
           block.hash = SHA256(JSON.stringify(block)).toString();
           let checkVal = await block.validate();
           if(checkVal){
                self.chain.push(block);
                self.height = self.chain.length - 1;
                resolve(block);
           }else{
                reject(Error("Block hash error"))
           }
        }).catch(error => {
            console.error(error)
          });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow to request a message that will be used to
     * sign the trqnsqction with a Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before your submit your Block.
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(`${address}:${new Date().getTime().toString().slice(0, -3)}:starRegistry`);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let messageTime = parseInt(message.split(':')[1]);
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
            let lessThan5Min = currentTime-messageTime < (5*60);
            if(lessThan5Min){
                let submitIsVerified = bitcoinMessage.verify(message, address, signature);
                if(submitIsVerified){
                    let newBlock = new BlockClass.Block({star:star, owner:address});
                    await self._addBlock(newBlock);
                    console.log(newBlock);
                    resolve(newBlock);
                }else{
                    reject(Error("Block verification error, wrong signature"));
                    console.log("Wrong signature !");
                }
            }else{
                console.log("More than 5 min elapsed !");
                reject(Error("Time elapsed > 5 min"));
            }
        }).catch(error => {
            console.error(error)
          });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            const findHash = self.chain.find(p => p.hash === hash);
            if(!findHash){
                reject("This hash is not part of the blockchain");
            }else{
                console.log(findHash);
                resolve(findHash);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and belong to the owner with the wallet address passed as parameter.
     * @param {*} address 
     */
    getStarsByWalletAddress(address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            self.chain.slice(1).forEach(async block => {
                let blockData = await block.getBData();
                
                if(blockData.owner === address){
                    stars.push(blockData);
                }
            });
            resolve(stars);
        });
        
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     */
    
    validateChain() {
        let promises = [];
        let errorLog = [];
        let chainIndex = 0;
        let self = this;
        return new Promise((resolve, reject) => {self.chain.forEach(b => {
            promises.push(b.validate());
            if(b.height > 0) //this is not Genesis
            {
                let prevHash = b.previousBlockHash;
                let bHash = self.chain[chainIndex-1].hash;
                if(bHash != prevHash){
                    errorLog.push(`Error - Block Height: ${b.height} - Previous hash don't match`);
                }
            }
            chainIndex++;
            });
            resolve(errorLog);
        });
    }

}

module.exports.Blockchain = Blockchain;   