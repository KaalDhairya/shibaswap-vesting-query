let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');

const mongoose = require('mongoose');
const rewardsCollection = mongoose.model('rewardsCollection');

async function fetchAndStore(blockResult) {
    try{

    let usersA = new Map()
    const NORMALIZE_CONSTANT = 1000000000000;
    const data = await queries.buryShibUsers(blockResult); //quering BuryShib subgraph for this block
    console.log("For: ",blockResult)//," queryRess: ", data[0]);
    const totalSupplyAtBlock = data[0].totalSupply;

    for(j = 0;j < data[0].users.length; j++) {
        const userAddress = data[0].users[j].id;
        const userRewardPercentage = totalSupplyAtBlock ? (data[0].users[j].xShib * NORMALIZE_CONSTANT/totalSupplyAtBlock): 0;
        // console.log(userAddress, " userRewardPercentage: ", userRewardPercentage)
        if(usersA.has(userAddress)) {
            usersA.set(userAddress, usersA.get(userAddress) + userRewardPercentage)
        } else {
            usersA.set(userAddress, userRewardPercentage)
        }
    }

    console.log("MAP Users: ", usersA)

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
        date: Date.now()
    }

    let doc = await rewardsCollection.findOneAndUpdate({ block_number: blockResult, contract: "BuryShib" }, obj, { new: true, upsert: true });

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

    if(config.contract.BuryShibFlag){
    

    const params = {
        contract: "BuryShib"
    }
    let latestBlockNumber = 0;
    let latestBlock = await rewardsCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for BuryShib
    if(latestBlock[0] == undefined){
        latestBlockNumber = 0;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
    }


    // const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryShib}&startblock=0&endblock=99999999&sort=asc`;
    // let res = await axios.get(URL);
    let reachedLast = false;
    let page = 1;
    let offset = 10;
    let startBlock = 12808057;
    let endBlock = 12808072;
    let returnObj = [];
    lastestBlockNumber = latestBlockNumber;
    console.log("lastestBlockNumber: ", latestBlockNumber)
    while(!reachedLast){
        const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryShib}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
        let res = await axios.get(URL);
        console.log("Page: ", page," * ", res.data.result.length, " per ", offset);
        let blockArray = [];
        for(let i=0; i<res.data.result.length; i++){
            blockArray.push(res.data.result[i].blockNumber);
        }
        if(res.data.result.length<offset){
            reachedLast = true;
        } else {
            page++;
        }
        returnObj = [...returnObj, ...blockArray];
    }

    let uniqueBlocks = [...new Set(returnObj)];
    
    // console.log("Resss: ", returnObj);
    console.log("Resss Length: ", returnObj.length);
    console.log("Unique blocks length: ", uniqueBlocks.length);

    let i;
    let skipFirstBlock = false;
    if(latestBlockNumber != 0){
        i=0;
    } else {
        i=1;
        skipFirstBlock = true;  //contract blocks not saved till now, so ignoring first block  (the contract deployment block)
    }
    let op=0;
    let po=0;
    let buggyBlocks = [];
    for  (; i < uniqueBlocks.length; i++){
        console.log("BlockNumber: ", uniqueBlocks[i]);

        if(skipFirstBlock || latestBlockNumber < uniqueBlocks[i]){
            ++po;
            try{
                await fetchAndStore(uniqueBlocks[i]);
            }catch(err){
                console.log(err, "Error in block: ", uniqueBlocks[i]);
                buggyBlocks.push(uniqueBlocks[i]);
            }

        } else {
            /////////////////////////////////
            // skip already fetched blocks //
            /////////////////////////////////
            ++op;
        }


    }

    console.log("BuryShib: Already saved blocks: ", op, " New blocks added :", po);

    let modelRes = await rewardsCollection.find(params);

    console.log("Execution completed: DB now ", modelRes);
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