let cron = require('node-cron');
let axios = require('axios');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const fs = require('fs');
const userInfoCollection = mongoose.model('user_info_v3');
const userInfoV3 = mongoose.model('user_info_bone');


async function main() {
    try{
        if(config.contract.convertBones){
            const WEEK = 1;
            const WEEK_OVERRIDE = -1;
            const BONE_RATE = 0.9137;
            console.log("start converting into bones");
            const tokenInfos = [
                {name: "SHIB_BONE", rate: 0.9137}, 
                {name: "SHIB_WETH", rate: 3229}, 
                {name: "LEASH_BONE", rate: 0.9137}, 
                {name: "BONE_BONE", rate: 0.9137}, 
                {name: "WBTC", rate: 42305}, 
                {name: "USDC", rate: 1}, 
                {name: "USDT", rate: 1}, 
                {name: "DAI", rate: 1}
            ]
            let TotalLockedBoneWeek = 0;

            for(tokenInfo in tokenInfos){
                const reward = await userInfoCollection.find({ rewardToken: tokenInfo.name, week: WEEK }) 
                for(userAmount in reward){
                    console.log(userAmount.week, userAmount.account, userAmount.rewardToken, userAmount.LockedThisWeek);
                    let v3obj = await userInfoV3.find({ rewardToken: "BASIC_BONE", week: WEEK, account: userAmount.account })
                    if(v3Obj){
                        let newObj = {...v3obj}
                        newObj.ClaimableThisWeek += (v3Obj.ClaimableThisWeek/tokenInfo.rate)*BONE_RATE
                        newObj.ClaimedPrevWeek += (v3Obj.ClaimedPrevWeek/tokenInfo.rate)*BONE_RATE
                        newObj.LockedThisWeek += (v3Obj.LockedThisWeek/tokenInfo.rate)*BONE_RATE
                        newObj.RewardOfWeek += (v3Obj.RewardOfWeek/tokenInfo.rate)*BONE_RATE
                        newObj.TotalClaimable += (v3Obj.TotalClaimable/tokenInfo.rate)*BONE_RATE
                        newObj.TotalClaimedTill += (v3Obj.TotalClaimedTill/tokenInfo.rate)*BONE_RATE
                        newObj.TotalLocked += (v3Obj.TotalLocked/tokenInfo.rate)*BONE_RATE
                        await userInfoV3.findOneAndUpdate({ rewardToken: tokenInfo.name, week: WEEK, account: userAmount.account }, newObj, { new: true, upsert: true} )
                        TotalLockedBoneWeek+=newObj.LockedThisWeek;
                    }else{
                        let obj = {...userAmount}
                        obj.week = WEEK_OVERRIDE;
                        obj.ClaimableThisWeek = (userAmount.ClaimableThisWeek/tokenInfo.rate)*BONE_RATE
                        obj.ClaimedPrevWeek = (userAmount.ClaimedPrevWeek/tokenInfo.rate)*BONE_RATE
                        obj.LockedThisWeek = (userAmount.LockedThisWeek/tokenInfo.rate)*BONE_RATE
                        obj.RewardOfWeek = (userAmount.RewardOfWeek/tokenInfo.rate)*BONE_RATE
                        obj.TotalClaimable = (userAmount.TotalClaimable/tokenInfo.rate)*BONE_RATE
                        obj.TotalClaimedTill = (userAmount.TotalClaimedTill/tokenInfo.rate)*BONE_RATE
                        obj.TotalLocked = (userAmount.TotalLocked/tokenInfo.rate)*BONE_RATE
                        await userInfoV3.insertOne(obj)
                        TotalLockedBoneWeek+=obj.LockedThisWeek;
                    }   
                }
            }
            console.log("Total bone locked this week: ", TotalLockedBoneWeek);
        }
    }catch(err){
        console.log("Error throw: ConvertBone: ", err);
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
