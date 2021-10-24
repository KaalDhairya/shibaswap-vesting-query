let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const buryShibCollection = mongoose.model('buryShibCollection');

let lastSslpBalance = undefined;
let usersLength = 0;
const skipBlockNumber = 120;
async function fetchAndStore(blockResult) {
    try{

    let stillLeft = true;
    let skipThisBlock = false;
    let last_id = "";
    let users = []
    const NORMALIZE_CONSTANT = 1000000000000;
    console.log("\n new block started: ", blockResult, "\n")
    while(stillLeft){
    const data = await queries.buryShibRewardsUsers(blockResult, last_id); //quering BuryShib subgraph for this block
    console.log(" For: ",blockResult," - ",data.users.length, "last id: ", last_id);
    if(lastSslpBalance == data.totalSupply){
        console.log("skipped: ", blockResult)
        skipThisBlock = true;
        break;
    }
    if(data.users.length == 0){
        stillLeft = false;
        lastSslpBalance = data.totalSupply;
        usersLength = data.userCount;  
        console.log("Reached end for this block: ", blockResult) 
    }else{
        console.log("For: ",blockResult, data.userCount, "length: ", data.users.length," queryRess: FROM ", data.users[0]," - ", data.users[data.users.length-1]);
        for(j = 0;j < data.users.length; j++) {
            const userAddress = data.users[j].id;
            const totalSupplyAtBlock = data.totalSupply == undefined ? 0 : data.totalSupply;
            const userRewardPercentage = totalSupplyAtBlock ? (data.users[j].xShib * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
            // console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
            // usersA.set(userAddress, userRewardPercentage)
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
        
        let doc = await buryShibCollection.findOneAndUpdate({ block_number: blockResult, contract: "BuryShib" }, obj, { new: true, upsert: true });
    }

    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult);
    }
}

async function main() {
    console.log("start fetching blocks - BuryShib");

    try{

    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 40 12 * * *', async () => {
    //     console.log("cron running...");
    const web3 = new Web3(new Web3.providers.HttpProvider(config.infuraUrl))
    let currentBlockNumber = await web3.eth.getBlockNumber();
    // console.log("mainnet currentBlockNumber: ", currentBlockNumber)
    if(config.contract.BuryShibFlag){
    

    const params = {
        contract: "BuryShib"
    }
    let latestBlockNumber = 0;
    let latestBlock = await buryShibCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for BuryShib
    if(latestBlock[0] == undefined){
        latestBlockNumber = config.contract.BuryShibStartBlock;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
        lastSslpBalance = latestBlock[0].sslpBalance;
        usersLength = latestBlock[0].user_share.length;
    }

    let endBlock = currentBlockNumber;
    // let returnObj = [];
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

    console.log("BuryShib: New blocks added :", po, "from: ", latestBlockNumber, "-", endBlock);

    // let modelRes = await buryShibCollection.find(params);

    // console.log("Execution completed: DB now ", modelRes);
    console.log("Issue occured in blocks: ", buggyBlocks);

    }
    // });
    } catch (err) {
        console.log("Error throw: BuryShib: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });