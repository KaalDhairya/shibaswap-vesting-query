let cron = require('node-cron');
let axios = require('axios');
const config = require('./config.json');
const Web3 = require('web3');
const mongoose = require('mongoose');
const fs = require('fs');
const buryShibCollection = mongoose.model('buryShibCollection');
const buryLeashCollection = mongoose.model('buryLeashCollection');
const buryBoneCollection = mongoose.model('buryBoneCollection');
const topDogCollection = mongoose.model('topDogCollection');

async function breakThisMerkleFile(merklePath, rewardType){
    const merkleObj = require(merklePath);
    // console.log(merkleObj.claims)
    for (const key in merkleObj.claims) {
        console.log(`${key}: ${merkleObj.claims[key].index}`);

        fs.writeFileSync(`./outputs/BuryShibBone/Merkle/${rewardType}-${key}.json`, JSON.stringify({ address:key,...merkleObj.claims[key]}, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(file));
            console.log('writing to ' + fileName);
        });
    }
    console.log("merkle path: ", merklePath, " this done");
}


async function main() {
    console.log("start breaking this merkle file");

    try{
    if(config.contract.breakMerkleFlag){
        await breakThisMerkleFile("../outputs/BuryShibBone/merkle-12772112-12773552.json", "buryShib");
    }
    } catch (err) {
        console.log("Error throw: BuryShib: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });