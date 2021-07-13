let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const topDogCollection = mongoose.model('topDogCollection');

let lastSslpBalance = undefined;
let usersLength = 0;
const POOL = 0;
async function fetchAndStore(blockResult) {
    try{

    let stillLeft = true;
    let skipThisBlock = false;
    let last_id = "";
    let usersA = new Map()
    let pool_id = POOL;
    const NORMALIZE_CONSTANT = 1000000000000;
    // const data = await queries.topDogPools(blockResult); //quering TopDog subgraph for this block
    // const data = await queries.topDogUsers(blockResult); //quering TopDog subgraph for this block
    console.log("\n new block started: ", blockResult, "\n")
    while(stillLeft){
    const data = await queries.topDogRewardPools(blockResult, last_id, pool_id); //quering TopDog subgraph for this block
    console.log(lastSslpBalance, data.balance," For: ",blockResult," .. ",usersLength, " userCount", data.userCount, "this.length of users: ", data.users.length, "lastID: ", last_id);

    if(lastSslpBalance == data.balance && usersLength == data.userCount || data.userCount == 0){
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
            console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
            usersA.set(userAddress, userRewardPercentage)
        }
        last_id = data.users[data.users.length-1].id;
    
    }
    }
    // console.log("users: ", data);
    //   console.log("blahblah: ", data.length)
    // for(i=0;i<data.length;i++){
    //     console.log("hhhblahblah: ", data[i].users.length);
    //     for(j=0;j<data[i].users.length; j++){
    //         // console.log("popop",data[i].users[j].amount)

    //     }
    // }

    // for(j = 0;j < data.length; j++) {
    //     if(data[j].pool.id == POOL)
    //     {
    //     const userAddress = data[j].address;
    //     const totalSupplyAtBlock = data[j].pool == undefined ? 0 : data[j].pool.balance;
    //     const userRewardPercentage = totalSupplyAtBlock ? (data[j].amount * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
    //     console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
    //         usersA.set(userAddress, userRewardPercentage)
    //     }
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
     

    // const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.TopDog}&startblock=12808057&endblock=12808072&page=17&offset=5&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
    // let res = await axios.get(URL);
    // let reachedLast = false;
    // let page = 1;
    // let offset = 10;
    // let startBlock = 0;
    let endBlock = currentBlockNumber;
    // let returnObj = [];
    lastestBlockNumber = latestBlockNumber;
    console.log("lastestBlockNumber: ", latestBlockNumber)
    // while(!reachedLast){
    //     const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.TopDog}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
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
    for  (i=latestBlockNumber; i <= endBlock; i++){
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