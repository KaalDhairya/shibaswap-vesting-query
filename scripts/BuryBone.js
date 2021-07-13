let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const rewardsCollection = mongoose.model('rewardsCollection');

let lastSslpBalance = undefined;
let usersLength = 0;
async function fetchAndStore(blockResult) {
    try{

    let usersA = new Map()
    const NORMALIZE_CONSTANT = 1000000000000;
    const data = await queries.buryBoneUsers(blockResult); //quering BuryBone subgraph for this block
    console.log("For: ",blockResult," queryRess: ", data);
    const totalSupplyAtBlock = data[0].totalSupply;

    if(lastSslpBalance == totalSupplyAtBlock && usersLength == data[0].users.length){
        console.log("EX: ",totalSupplyAtBlock, lastSslpBalance, usersLength, data[0].users.length)
        console.log("Found same");
    }else{
        lastSslpBalance = totalSupplyAtBlock;
        usersLength = data[0].users.length;
        console.log("Found different")
        for(j = 0;j < data[0].users.length; j++) {
            const userAddress = data[0].users[j].id;
            const userRewardPercentage = totalSupplyAtBlock ? (data[0].users[j].tBone * NORMALIZE_CONSTANT/totalSupplyAtBlock): 0;
            usersA.set(userAddress, userRewardPercentage)
        }
    
        // console.log("MAP Users: ", usersA)
    
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
            sslpBalance: totalSupplyAtBlock,
            date: Date.now()
        }
    
        let doc = await rewardsCollection.findOneAndUpdate({ block_number: blockResult, contract: "BuryBone" }, obj, { new: true, upsert: true });
    
    }
    
    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult);
    }
}   

async function main() {
    console.log("start fetching blocks - BuryBone");

    try{
    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 30 12 * * *', async () => {
    //     console.log("cron running...");
    const web3 = new Web3(new Web3.providers.HttpProvider(config.infuraUrl))
    let currentBlockNumber = await web3.eth.getBlockNumber();
    // console.log("mainnet currentBlockNumber: ", currentBlockNumber)
    if(config.contract.BuryBoneFlag){


    const params = {
        contract: "BuryBone"
    }
    let latestBlockNumber = 0;
    let latestBlock = await rewardsCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for BuryBone
    if(latestBlock[0] == undefined){
        latestBlockNumber = config.contract.BuryBoneStartBlock;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
        lastSslpBalance = latestBlock[0].sslpBalance;
        usersLength = latestBlock[0].user_share.length;
    }



    // const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryBone}&startblock=12808057&endblock=12808072&page=17&offset=5&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
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
    //     const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.BuryBone}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
    //     let res = await axios.get(URL);
    //     console.log("Page: ", page," * ", res.data.result.length, " per ", offset);
    //     let blockArray = [];
    //     for(let i=0; i<res.data.result.length; i++){
    //         blockArray.push(res.data.result[i].blockNumber);
    //     }
    //     let abc = [...new Set(blockArray)]
    //     console.log(blockArray.length, "Block Array:: ", abc, abc.length, abc[abc.length -1]);
    //     // if(res.data.result.length<offset){
    //     //     reachedLast = true;
    //     // } else {
    //     //     ++page;
    //     //     //offset = offset/page;
    //     // }
    //     ++page;
    //     // offset+=offset;
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

    console.log("BuryBone: New blocks added :", po, "from: ", latestBlockNumber, "-", endBlock);

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