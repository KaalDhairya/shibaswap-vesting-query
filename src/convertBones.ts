let cron = require('node-cron');
let axios = require('axios');
const Web3 = require('web3');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const fs = require('fs');
const { convertCompilerOptionsFromJson } = require('typescript');

import { fetchAll, fetchOne, insert } from './Database/utils';
const userInfoCollection = 'user_info_v3';
const userInfoV3 = 'user_info_bone';

const WEEK = 2;
const WEEK_OVERRIDE = -2;
const BONE_RATE = 0.9137;
const BONE_BASE = 18;

main();

function convertBone(amount, rate, base){
    return Math.floor((amount*rate*Math.pow(10, BONE_BASE-base))/BONE_RATE);
}

async function main() {
    try{
            console.log("start converting into bones");
            const tokenInfos = [
                {name: "WETH", rate: 3229, base: 18}, 
                {name: "SHIB_BONE", rate: BONE_RATE, base: 18}, 
                {name: "LEASH_BONE", rate: BONE_RATE, base: 18}, 
                {name: "BONE_BONE", rate: BONE_RATE, base: 18}, 
                {name: "WBTC", rate: 42305, base: 8}, 
                {name: "USDC", rate: 1, base: 6}, 
                {name: "USDT", rate: 1, base: 6}, 
                {name: "DAI", rate: 1, base: 18}
            ]
            let TotalWeth = 0;
            let TotalBone = 0;
            let TotalWbtc = 0;
            let TotalUsdc = 0;
            let TotalUsdt = 0;
            let TotalDai = 0; 
            let TotalLockedBoneWeek = 0;

            for(var tokenInfo of tokenInfos){
                console.log("tokenInfo", tokenInfo)
                const reward = await fetchAll(userInfoCollection, { rewardToken: tokenInfo.name, week: WEEK }, {_id: 0}) 
                console.log("user count:", reward.length)
                for(var userAmount of reward){
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
                    let v3obj = await fetchOne(userInfoV3, { rewardToken: "BASIC_BONE", week: WEEK_OVERRIDE, account: userAmount.account }, {_id: 0})
                    if(v3obj){
                        let newObj = v3obj;
                        // console.log("Updating object: ", newObj)
                        newObj.ClaimableThisWeek += convertBone(userAmount.ClaimableThisWeek,tokenInfo.rate,tokenInfo.base)
                        newObj.ClaimedPrevWeek += convertBone(userAmount.ClaimedPrevWeek,tokenInfo.rate,tokenInfo.base)
                        newObj.LockedThisWeek += convertBone(userAmount.LockedThisWeek,tokenInfo.rate,tokenInfo.base)
                        newObj.RewardOfWeek += convertBone(userAmount.RewardOfWeek,tokenInfo.rate,tokenInfo.base)
                        newObj.TotalClaimable += convertBone(userAmount.TotalClaimable,tokenInfo.rate,tokenInfo.base)
                        newObj.TotalClaimedTill += convertBone(userAmount.TotalClaimedTill,tokenInfo.rate,tokenInfo.base)
                        newObj.TotalLocked += convertBone(userAmount.TotalLocked,tokenInfo.rate,tokenInfo.base)
                        // console.log("After update: ", newObj)
                        await insert(newObj, userInfoV3 )
                        TotalLockedBoneWeek+=convertBone(userAmount.LockedThisWeek,tokenInfo.rate,tokenInfo.base);
                    }else{
                        let obj = userAmount
                        // console.log("object converting: ", obj)
                        obj.week = WEEK_OVERRIDE;
                        obj.ClaimableThisWeek += convertBone(userAmount.ClaimableThisWeek,tokenInfo.rate,tokenInfo.base)
                        obj.ClaimedPrevWeek += convertBone(userAmount.ClaimedPrevWeek,tokenInfo.rate,tokenInfo.base)
                        obj.LockedThisWeek += convertBone(userAmount.LockedThisWeek,tokenInfo.rate,tokenInfo.base)
                        obj.RewardOfWeek += convertBone(userAmount.RewardOfWeek,tokenInfo.rate,tokenInfo.base)
                        obj.TotalClaimable += convertBone(userAmount.TotalClaimable,tokenInfo.rate,tokenInfo.base)
                        obj.TotalClaimedTill += convertBone(userAmount.TotalClaimedTill,tokenInfo.rate,tokenInfo.base)
                        obj.TotalLocked += convertBone(userAmount.TotalLocked,tokenInfo.rate,tokenInfo.base)
                        obj.rewardToken = "BASIC_BONE";
                        // console.log("after conversion: ", obj)
                        await insert(obj, userInfoV3 )
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
            console.log("Total bone: ", TotalBone);
    }catch(err){
        console.log("Error throw: ConvertBone: ", err);
    }
}
