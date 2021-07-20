let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const buryShibCollection = mongoose.model('buryShibCollection');
const buryLeashCollection = mongoose.model('buryLeashCollection');
const buryBoneCollection = mongoose.model('buryBoneCollection');
const topDogCollection = mongoose.model('topDogCollection');

async function checkBuryShib() {
    const params = {
        contract: "BuryShib"
    }
    let modelRes = await buryShibCollection.find(params);

    console.log("\n Result for BuryShib :: total blocks saved in mongoDB", modelRes.length);
    for (i=0;i<modelRes.length;i++){
        const obj = modelRes[i];
        let total = 0;
        for(j=0;j<obj.user_share.length;j++){
            total = total + obj.user_share[j].amount;
        }
 
        console.log("For BlockNumber: ", obj.block_number, ", ratio total = ", total);
        }
        const reward_amount = 5000000000000000000000
        let userInfo = new Map()
        let totalReward = 0;
        let userTotal = 0;
        const rewardPerBlock = reward_amount/modelRes.length;
        modelRes.forEach(blockInfo => {
            console.log("block_number",blockInfo.block_number)
            blockInfo.user_share.forEach(user => {
                
                // if(user.address == "0xb8ac63a0f6205f455ba10796aec5ed56e841d961"){
                //     userTotal+=user.amount;
                //     console.log("amount: ", user.amount);
                // }
                const userReward = (rewardPerBlock*user.amount)/blockInfo.normalize_exponent
                totalReward+=userReward;
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
    })
    console.log(userTotal, " || totalReward:: ", totalReward)
}

async function checkBuryLeash() {
    const params = {
        contract: "BuryLeash"
    }
    let modelRes = await buryLeashCollection.find(params);

    console.log("\n Result for BuryLeash :: total blocks saved in mongoDB", modelRes.length);
    for (i=0;i<modelRes.length;i++){
        const obj = modelRes[i];
        let total = 0;
        for(j=0;j<obj.user_share.length;j++){
            total = total + obj.user_share[j].amount;
        }
        console.log("For BlockNumber: ", obj.block_number, ", ratio total = ", total);
    }
    const reward_amount = 5000000000000000000000
        let userInfo = new Map()
        let totalReward = 0;
        let userTotal = 0;
        const rewardPerBlock = reward_amount/modelRes.length;
        modelRes.forEach(blockInfo => {
            console.log("block_number",blockInfo.block_number)
            blockInfo.user_share.forEach(user => {
                
                // if(user.address == "0xb8ac63a0f6205f455ba10796aec5ed56e841d961"){
                //     userTotal+=user.amount;
                //     console.log("amount: ", user.amount);
                // }
                const userReward = (rewardPerBlock*user.amount)/blockInfo.normalize_exponent
                totalReward+=userReward;
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
    })
    console.log(userTotal, " || totalReward:: ", totalReward)
}
async function checkBuryBone() {
    const params = {
        contract: "BuryBone"
    }
    let modelRes = await buryBoneCollection.find(params);

    console.log("\n Result for BuryBone :: total blocks saved in mongoDB", modelRes.length);
    for (i=0;i<modelRes.length;i++){
        const obj = modelRes[i];
        let total = 0;
        for(j=0;j<obj.user_share.length;j++){
            total = total + obj.user_share[j].amount;
        }
        console.log("For BlockNumber: ", obj.block_number, ", ratio total = ", total);
    }
    const reward_amount = 5000000000000000000000
        let userInfo = new Map()
        let totalReward = 0;
        let userTotal = 0;
        const rewardPerBlock = reward_amount/modelRes.length;
        modelRes.forEach(blockInfo => {
            console.log("block_number",blockInfo.block_number)
            blockInfo.user_share.forEach(user => {
                
                // if(user.address == "0xb8ac63a0f6205f455ba10796aec5ed56e841d961"){
                //     userTotal+=user.amount;
                //     console.log("amount: ", user.amount);
                // }
                const userReward = (rewardPerBlock*user.amount)/blockInfo.normalize_exponent
                totalReward+=userReward;
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
    })
    console.log(userTotal, " || totalReward:: ", totalReward)
}
async function checkTopDog() {
    const params1 = {
        contract: "TopDog",
        poolId: 0
    }
    let modelRes1 = await topDogCollection.find(params1);

    console.log("\n Result for Topdog - pool 0 :: total blocks saved in mongoDB", modelRes1.length);
    for (i=0;i<modelRes1.length;i++){
        const obj = modelRes1[i];
        let total = 0;
        for(j=0;j<obj.user_share.length;j++){
            total = total + obj.user_share[j].amount;
        }
        console.log("For BlockNumber: ", obj.block_number, ", ratio total = ", total);
    }
    const params2 = {
        contract: "TopDog",
        poolId: 15
    }
    let modelRes2 = await topDogCollection.find(params2);

    console.log("\n Result for Topdog - pool 15 :: total blocks saved in mongoDB", modelRes2.length);
    for (i=0;i<modelRes2.length;i++){
        const obj = modelRes2[i];
        let total = 0;
        for(j=0;j<obj.user_share.length;j++){
            total = total + obj.user_share[j].amount;
        }
        console.log("For BlockNumber: ", obj.block_number, ", ratio total = ", total);
    }
}


async function main() {
    console.log("start checking RewardDistribution blocks");

    try{
    if(config.contract.checkRewardDistribution_BuryShib){
        await checkBuryShib();
    } else if(config.contract.checkRewardDistribution_BuryLeash){
        await checkBuryLeash();
    } else if(config.contract.checkRewardDistribution_BuryBone){
        await checkBuryBone();
    } else if(config.contract.checkRewardDistribution_TopDog){
        await checkTopDog();
    } else{ }
    } catch (err) {
        console.log("Error throw: BuryShib: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });