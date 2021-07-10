var cron = require('node-cron');
var axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');

const mongoose = require('mongoose');
const rewardsCollection = mongoose.model('rewardsCollection');

async function fetchAndStore(blockResult) {
    try{

    let usersA = new Map()
    const NORMALIZE_CONSTANT = 1000000000000;
    const data = await queries.topDogUsers(blockResult.blockNumber); //quering TopDog subgraph for this block
    console.log("For: ",blockResult.blockNumber)//," queryRess: ", data[0]);

    for(j = 0;j < data.length; j++) {
        const userAddress = data[j].address;
        const totalSupplyAtBlock = data[j].pool == undefined ? 0 : data[j].pool.balance;
        const userRewardPercentage = totalSupplyAtBlock ? (data[j].amount * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
        console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
        if(usersA.has(userAddress)) {
            usersA.set(userAddress, usersA.get(userAddress) + userRewardPercentage)
        } else {
            usersA.set(userAddress, userRewardPercentage)
        }
    }

    console.log("MAP Users: ", usersA)

    let users = []
    for(var address of usersA.keys()){
        users.push({
            address: address,
            amount: Number(usersA.get(address))
        })
    }


    var obj = {
        user_share_map: usersA,
        user_share: users,
        normalize_exponent: NORMALIZE_CONSTANT,
        date: blockResult.timeStamp
    }

    let doc = await rewardsCollection.findOneAndUpdate({ block_number: blockResult.blockNumber, contract: "TopDog" }, obj, { new: true, upsert: true });

    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult.blockNumber);
    }
}

async function main() {
    console.log("start fetching blocks - TopDog");

    try{

    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 45 12 * * *', async () => {
    //     console.log("cron running...");
    if(config.contract.TopDogFlag){
    const params = {
        contract: "TopDog"
    }

    let latestBlock = await rewardsCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for TopDog

    console.log("model: ", latestBlock)
     

    const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.TopDog}&startblock=0&endblock=99999999&sort=asc`;
    let res = await axios.get(URL);

    
    console.log("Resss: ", res.data.result.length);

    var i;
    var skipFirstBlock = false;
    if(latestBlock[0] != undefined){
        i=0;
    } else {
        i=1;
        skipFirstBlock = true;  //contract blocks not saved till now, so ignoring first block  (the contract deployment block)
    }
    var op=0;
    var po=0;
    let buggyBlocks = [];
    for  (; i < res.data.result.length; i++){
        console.log("BlockNumber: ", res.data.result[i].blockNumber);

        if(skipFirstBlock || latestBlock[0].block_number < res.data.result[i].blockNumber){
            ++po;
            try{
                await fetchAndStore(res.data.result[i]);
            }catch(err){
                console.log(err, "Error in block: ", res.data.result[i].blockNumber);
                buggyBlocks.push(res.data.result[i].blockNumber);
            }
        } else {
            /////////////////////////////////
            // skip already fetched blocks //
            /////////////////////////////////
            ++op;
        }


    }

    console.log("TopDog: Already saved blocks: ", op, " New blocks added :", po);

    let modelRes = await rewardsCollection.find(params);

    console.log("Execution completed: DB now ", modelRes);
    console.log("Issue occured in blocks: ", buggyBlocks);

    }
    // });
    } catch (err) {
        console.log("Error throw: BuryBone: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });