let cron = require('node-cron');
let axios = require('axios');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const fs = require('fs');
const { convertCompilerOptionsFromJson } = require('typescript');
var Sche = new Schema({ 
    account: {
        type: String
    },
    ClaimableThisWeek: {
        type: Number
    },
    ClaimedPrevWeek: {
        type: Number
    },
    LockedThisWeek: {
        type: Number
    },
    LockReleaseDate: {
      type: Number  
    },
    RewardOfWeek: {
        type: Number
    },
    rewardToken: {
        type: String
    },
    TotalClaimable: {
        type: Number
    },
    TotalClaimedTill: {
        type: Number
    },
    TotalLocked: {
        type: Number
    },
    TotalVested: {
        type: Number
    },
    VestedThisWeek: {
        type: Number
    },
    week: {
        type: Number
    },
    week_date: {
        type: Number
    }
});
const userInfoCollection = mongoose.model('user_info_v3', Sche);
const userInfoV3 = mongoose.model('user_info_bone', Sche);


async function main() {
    try{
        if(config.contract.convertBones){
            const WEEK = 1;
            const WEEK_OVERRIDE = -1;
            const BONE_RATE = 0.9137;
            const BONE_BASE = 18;
            console.log("start converting into bones");
            const tokenInfos = [
                {name: "WETH", rate: 3229, base: 18}, 
                {name: "SHIB_BONE", rate: 0.9137, base: 18}, 
                {name: "LEASH_BONE", rate: 0.9137, base: 18}, 
                {name: "BONE_BONE", rate: 0.9137, base: 18}, 
                {name: "WBTC", rate: 42305, base: 8}, 
                {name: "USDC", rate: 1, base: 6}, 
                {name: "USDT", rate: 1, USDT: 6}, 
                {name: "DAI", rate: 1, base: 18}
            ]
            let TotalWeth = 0;
            let TotalBone = 0;
            let TotalWbtc = 0;
            let TotalUsdc = 0;
            let TotalUsdt = 0;
            let TotalDai = 0; 
            let TotalLockedBoneWeek = 0;

            for(tokenInfo of tokenInfos){
                console.log("tokenInfo", tokenInfo)
                const reward = await userInfoCollection.find({ rewardToken: tokenInfo.name, week: WEEK }, {_id: 0}) 
                console.log("user count:", reward.length)
                for(userAmount of reward){
                    console.log(userAmount.week, userAmount.account, userAmount.rewardToken, userAmount.LockedThisWeek);
                    switch(userAmount.rewardToken){
                        case "WETH": 
                            TotalWeth+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break;
                        case "SHIB_BONE":
                        case "LEASH_BONE":
                        case "BONE_BONE":
                            TotalBone+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break;
                        case "WBTC":
                            TotalWbtc+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break
                        case "USDC":
                            TotalUsdc+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break;
                        case "USDT":
                            TotalUsdt+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break
                        case "DAI":
                            TotalDai+=(userAmount.LockedThisWeek/Math.pow(10,tokenInfo.base));
                            break;   
                    }
                    let v3obj = await userInfoV3.findOne({ rewardToken: "BASIC_BONE", week: WEEK_OVERRIDE, account: userAmount.account }, {_id: 0})
                    if(v3obj){
                        let newObj = v3obj._doc;
                        // console.log("Updating object: ", newObj)
                        newObj.ClaimableThisWeek += Math.floor((userAmount.ClaimableThisWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.ClaimedPrevWeek += Math.floor((userAmount.ClaimedPrevWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.LockedThisWeek += Math.floor((userAmount.LockedThisWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.RewardOfWeek += Math.floor((userAmount.RewardOfWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.TotalClaimable += Math.floor((userAmount.TotalClaimable*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.TotalClaimedTill += Math.floor((userAmount.TotalClaimedTill*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        newObj.TotalLocked += Math.floor((userAmount.TotalLocked*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        // console.log("After update: ", newObj)
                        await userInfoV3.updateOne({ rewardToken: "BASIC_BONE", week: WEEK_OVERRIDE, account: userAmount.account }, {$set: newObj}, { upsert: true} )
                        TotalLockedBoneWeek+=newObj.LockedThisWeek;
                    }else{
                        let obj = userAmount._doc
                        // console.log("object converting: ", obj)
                        obj.week = WEEK_OVERRIDE;
                        obj.ClaimableThisWeek = Math.floor((userAmount.ClaimableThisWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.ClaimedPrevWeek = Math.floor((userAmount.ClaimedPrevWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.LockedThisWeek = Math.floor((userAmount.LockedThisWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.RewardOfWeek = Math.floor((userAmount.RewardOfWeek*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.TotalClaimable = Math.floor((userAmount.TotalClaimable*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.TotalClaimedTill = Math.floor((userAmount.TotalClaimedTill*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.TotalLocked = Math.floor((userAmount.TotalLocked*tokenInfo.rate*Math.pow(10, BONE_BASE-tokenInfo.base))/BONE_RATE)
                        obj.rewardToken = "BASIC_BONE";
                        // console.log("after conversion: ", obj)
                        await userInfoV3.updateOne({ rewardToken: "BASIC_BONE", week: WEEK_OVERRIDE, account: userAmount.account }, {$set: obj}, { upsert: true} )
                        TotalLockedBoneWeek+=obj.LockedThisWeek;
                    }   
                }
            }
            console.log("Total bone locked this week: ", TotalLockedBoneWeek);
            console.log("Total weth: ", TotalWeth);
            console.log("Total wbtc: ", TotalWbtc);
            console.log("Total Usdt: ", TotalUsdt);
            console.log("Total Usdc: ", TotalUsdc);
            console.log("Total dai: ", TotalDai);
            console.log("Total bone: ", TotalBone)
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
