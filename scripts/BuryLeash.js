let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const buryLeashCollection = mongoose.model('buryLeashCollection');

let lastSslpBalance = undefined;
let usersLength = 0;
const skipBlockNumber = 60;
async function fetchAndStore(blockResult) {
    try{

    let stillLeft = true;
    let skipThisBlock = false;
    let last_id = "";
    let usersA = new Map()
    const NORMALIZE_CONSTANT = 1000000000000;
    console.log("\n new block started: ", blockResult, "\n")
    while(stillLeft){
    const data = await queries.buryLeashRewardsUsers(blockResult, last_id); //quering BuryLeash subgraph for this block
    // console.log(lastSslpBalance, data.totalSupply," For: ",blockResult," .. ",usersLength, " userCount", data.userCount, "this.length of users: ", data.users.length, "lastID: ", last_id);
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
            const userRewardPercentage = totalSupplyAtBlock ? (data.users[j].xLeash * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
            console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
            usersA.set(userAddress, userRewardPercentage)
        }
        last_id = data.users[data.users.length-1].id;
    
    }
    }
    // const data = await queries.buryLeashUsers(blockResult); //quering BuryLeash subgraph for this block
    // console.log("For: ",blockResult," queryRess: ", data);
    // const totalSupplyAtBlock = data[0].totalSupply;

    // if(lastSslpBalance == totalSupplyAtBlock && usersLength == data[0].users.length){
    //     console.log("EX: ",totalSupplyAtBlock, lastSslpBalance, usersLength, data[0].users.length)
    //     console.log("Found same");
    // }else{
    //     lastSslpBalance = totalSupplyAtBlock;
    //     usersLength = data[0].users.length;
    //     console.log("Found different")
    // for(j = 0;j < data[0].users.length; j++) {
    //     const userAddress = data[0].users[j].id;
    //     const userRewardPercentage = totalSupplyAtBlock ? (data[0].users[j].xLeash * NORMALIZE_CONSTANT/totalSupplyAtBlock): 0;
    //     usersA.set(userAddress, userRewardPercentage)
    // }

    // console.log("MAP Users: ", usersA)

    if(!skipThisBlock){
        let users = []
        for(let address of usersA.keys()){
            users.push({
                address: address,
                amount: Number(usersA.get(address))
            })
        }


        let obj = {
            user_share_map: usersA,
            user_share: users,
            normalize_exponent: NORMALIZE_CONSTANT,
            sslpBalance: lastSslpBalance,
            date: Date.now()
        }

        let doc = await buryLeashCollection.findOneAndUpdate({ block_number: blockResult, contract: "BuryLeash" }, obj, { new: true, upsert: true });
    }

    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult);
    }
}

async function main() {
    console.log("start fetching blocks - BuryLeash");

    try{

    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 35 12 * * *', async () => {
    //     console.log("cron running...");
    const web3 = new Web3(new Web3.providers.HttpProvider(config.infuraUrl))
    let currentBlockNumber = await web3.eth.getBlockNumber();
    // console.log("mainnet currentBlockNumber: ", currentBlockNumber)
    if(config.contract.BuryLeashFlag){

    
    const params = {
        contract: "BuryLeash"
    }
    let latestBlockNumber = 0;
    let latestBlock = await buryLeashCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for BuryLeash
    if(latestBlock[0] == undefined){
        latestBlockNumber = config.contract.BuryLeashStartBlock;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
        lastSslpBalance = latestBlock[0].sslpBalance;
        usersLength = latestBlock[0].user_share.length;
    }


    // const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryLeash}&startblock=0&endblock=99999999&sort=asc`;
    // let res = await axios.get(URL);
    // let reachedLast = false;
    // let page = 1;
    // let offset = 1000;
    // let startBlock = 0;
    let endBlock = currentBlockNumber;
    // let returnObj = [];
    lastestBlockNumber = latestBlockNumber;
    console.log("lastestBlockNumber: ", latestBlockNumber)
    // while(!reachedLast){
    //     const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryLeash}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
    //     let res = await axios.get(URL);
    //     console.log("Page: ", page," * ", res.data.result.length, " per ", offset);
    //     let blockArray = [];
    //     for(let i=0; i<res.data.result.length; i++){
    //         blockArray.push(res.data.result[i].blockNumber);
    //     }
    //     if(res.data.result.length<offset){
    //         reachedLast = true;
    //     } else {
    //         page++;
    //     }
    //     returnObj = [...returnObj, ...blockArray];
    // }

    // let uniqueBlocks = [...new Set(returnObj)];
    
    // console.log("Resss: ", returnObj);
    // console.log("Resss Length: ", returnObj.length);
    // console.log("Unique blocks length: ", uniqueBlocks.length);

    // let i;
    // let skipFirstBlock = false;
    // if(latestBlockNumber != 0){
    //     i=0;
    // } else {
    //     i=1;
    //     skipFirstBlock = true;  //contract blocks not saved till now, so ignoring first block  (the contract deployment block)
    // }
    let op=0;
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

    console.log("BuryLeash: New blocks added :", po, "from: ", latestBlockNumber, "-", endBlock);

    // let modelRes = await buryLeashCollection.find(params);

    // console.log("Execution completed: DB now ", modelRes);
    console.log("Issue occured in blocks: ", buggyBlocks);

    }
    // });
    } catch (err) {
        console.log("Error throw: BuryLeash: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });