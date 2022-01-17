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

const BONE_WEEK = 8;
const MERGE_WEEK = -2;

main();

async function main() {
    try{
        const rewards = await fetchAll(userInfoCollection, { rewardToken: "BASIC_BONE", week: BONE_WEEK }, {_id: 0})
        for(var userAmount of rewards){
            let v3obj = await fetchOne(userInfoV3, { rewardToken: "BASIC_BONE", week: MERGE_WEEK, account: userAmount.account }, {_id: 0})
            if(v3obj){
                let obj = v3obj;
                obj.TotalLocked = obj.TotalLocked + userAmount.TotalLocked;
                obj.converted = true
                obj.mergeCommon = true
                await insert(obj, userInfoV3 )
            }else{
                let obj = userAmount;
                obj.week = BONE_WEEK;
                obj.converted = true
                obj.mergeCommon = false
                await insert(obj, userInfoV3 )
            }
        }
    }catch(err){
        console.log("Error throw: MergeBones: ", err);
    }
}
