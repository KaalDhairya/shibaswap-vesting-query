var cron = require('node-cron');
var axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');

const mongoose = require('mongoose');
const rewardsCollection = mongoose.model('rewardsCollection');

async function fetchAndStore(blockResult) {

    let usersA = new Map()
    const NORMALIZE_CONSTANT = 1000000000000;
    const data = await queries.buryLeashUsers(blockResult.blockNumber); //quering BuryLeash subgraph for this block
    console.log("For: ",blockResult.blockNumber)//," queryRess: ", data[0]);
    const totalSupplyAtBlock = data[0].totalSupply;

    for(j = 0;j < data[0].users.length; j++) {
        const userAddress = data[0].users[j].id;
        const userRewardPercentage = totalSupplyAtBlock ? (data[0].users[j].xLeash * NORMALIZE_CONSTANT/totalSupplyAtBlock): 0;
        // console.log(userAddress, " userRewardPercentage: ", userRewardPercentage)
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

    let doc = await rewardsCollection.findOneAndUpdate({ block_number: blockResult.blockNumber, contract: "BuryLeash" }, obj, { new: true, upsert: true });

    // console.log("Array now: ", users)
}

async function main() {
    console.log("start fetching blocks");

    try{

    // Cron to run after every 24 hrs to update blocks & perBlock data
    cron.schedule('0 30 12 * * *', async () => {
        console.log("cron running...");
    
    const params = {
        contract: "BuryLeash"
    }

    let latestBlock = await rewardsCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for BuryLeash

    console.log("model: ", latestBlock)

    const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryLeash}&startblock=0&endblock=99999999&sort=asc`;
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
    for  (; i < res.data.result.length; i++){
        console.log("BlockNumber: ", res.data.result[i].blockNumber);

        if(skipFirstBlock || latestBlock[0].block_number < res.data.result[i].blockNumber){
            ++po;
            await fetchAndStore(res.data.result[i]);
        } else {
            /////////////////////////////////
            // skip already fetched blocks //
            /////////////////////////////////
            ++op;
        }


    }

    console.log("BuryLeash: Already saved blocks: ", op, " New blocks added :", po);

    let modelRes = await rewardsCollection.find();

    console.log("Execution completed: DB now ", modelRes)
    });
    } catch (err) {
        console.log("Error throw: BuryBone: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });