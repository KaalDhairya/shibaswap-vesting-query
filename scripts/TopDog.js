let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const topDogCollection = mongoose.model('topDogCollection');

let lastSslpBalance = undefined;
let usersLength = 0;
const POOL = 25;
const skipBlockNumber = 10;
async function fetchAndStore(blockResult) {
    try{

    let stillLeft = true;
    let skipThisBlock = false;
    let last_id = "";
    let users = []
    let pool_id = POOL;
    const NORMALIZE_CONSTANT = 1000000000000;

    console.log("\n new block started: ", blockResult, "\n")
    while(stillLeft){
    const data = await queries.topDogRewardPools(blockResult, last_id, pool_id); //quering TopDog subgraph for this block
    console.log(lastSslpBalance, data.balance," For: ",blockResult," .. ",usersLength, " userCount", data.userCount, "this.length of users: ", data.users.length, "lastID: ", last_id);

    if(lastSslpBalance == data.balance && (usersLength == data.userCount || data.userCount == 0)){
        console.log("skipped: ", blockResult)
        skipThisBlock = true;
        break;
    }
    if(data.users.length == 0){
        stillLeft = false;
        lastSslpBalance = data.balance;
        usersLength = data.userCount;  
        console.log("Reached end for this block: ", blockResult) 
    }else{
        console.log("For: ",blockResult, data.userCount, "length: ", data.users.length," queryRess: FROM ", data.users[0]," - ", data.users[data.users.length-1]);
        for(j = 0;j < data.users.length; j++) {
            const userAddress = data.users[j].address;
            const totalSupplyAtBlock = data.balance == undefined ? 0 : data.balance;
            const userRewardPercentage = totalSupplyAtBlock ? (data.users[j].amount * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
            // console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
            users.push({
                address: userAddress,
                amount: Number(userRewardPercentage)
            })
        }
        last_id = data.users[data.users.length-1].id;
    
    }
    }

    if(!skipThisBlock){
        
        let obj = {
            user_share: users,
            normalize_exponent: NORMALIZE_CONSTANT,
            sslpBalance: lastSslpBalance,
            date: Date.now()
        }
    
        let doc = await topDogCollection.findOneAndUpdate({ block_number: blockResult, contract: "TopDog", poolId: POOL }, obj, { new: true, upsert: true });
    }
    
    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult);
    }
}

async function main() {
    console.log("start fetching blocks - TopDog");

    try{
    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 45 12 * * *', async () => {
    //     console.log("cron running...");
    const web3 = new Web3(new Web3.providers.HttpProvider(config.infuraUrl))
    let currentBlockNumber = await web3.eth.getBlockNumber();
    // console.log("mainnet currentBlockNumber: ", currentBlockNumber)
    if(config.contract.TopDogFlag){

      
    const params = {
        contract: "TopDog",
        poolId: POOL
    }
    let latestBlockNumber = 0;
    let latestBlock = await topDogCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for TopDog
    if(latestBlock[0] == undefined){
        latestBlockNumber = config.contract.TopDogStartBlock;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
        lastSslpBalance = latestBlock[0].sslpBalance;
        usersLength = latestBlock[0].user_share.length;
    }
     
    let endBlock = currentBlockNumber;

    lastestBlockNumber = latestBlockNumber;
    console.log("lastestBlockNumber: ", latestBlockNumber)

    let po=0;
    let buggyBlocks = [];
    for  (i=latestBlockNumber; i <= endBlock; i = i+skipBlockNumber){
        // console.log("BlockNumber: ", i);
            try{
                await fetchAndStore(i);
                ++po;
            }catch(err){
                console.log(err, "Error in block: ", i);
                buggyBlocks.push(i);
            }
        }

    console.log("TopDog: New blocks added :", po, "from: ", latestBlockNumber, "-", endBlock);

    // let modelRes = await topDogCollection.find(params);

    // console.log("Execution completed: DB now ", modelRes);
    console.log("Issue occured in blocks: ", buggyBlocks);

    }
    // });
    } catch (err) {
        console.log("Error throw: TopDog: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
