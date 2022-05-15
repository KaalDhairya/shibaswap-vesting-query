
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const ethers = require('ethers');
const axios = require('axios');
import { parseBalanceMap } from './parse-balance-map';
import { Command } from "commander";
const { BigNumber, utils } = ethers;

const { getAddress } = utils

import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { Options } from './types'

import getDistribution from './Ryo/index';
import { VESTING_START } from "./constants";


const RATE_LIMIT_DELAY_IN_MS = 15 * 1000;
const ETHERSCAN_ROOT_URI = 'https://api.etherscan.io/api';
const SHIBBURN_CONTRACT_ADDRESS = '0x88f09b951F513fe7dA4a34B436a3273DE59F253D';
const BURN_EVENT_TOPIC = '0x3be9da6af6db8f6aec0bb70dffbd38932712c19fa236dc1870f2c6a7c39bd37b';

// Total supply from https://coinmarketcap.com/currencies/shiba-inu/
const TOTAL_BURNT_SHIB_SUPPLY = BigNumber.from(27698950522.0);
const TOTAL_REWARDS_AMOUNT = BigNumber.from(254000000000000); // 254 Trillion



// Command line options
const program = new Command();
program
    .option('-s, --startBlock <number>')
    .option('-e, --endBlock <number>')
    .option('-c, --claimBlock <number>')
    .option('-ow, --overwrite <boolean>')
    .option('-pd, --prod <boolean>')
    .option('-nf, --noFile <boolean>')

program.parse(process.argv);

main();

// Options set via command line
const START_BLOCK = 0 // Number(program.opts().startBlock);
const END_BLOCK = Number(program.opts().endBlock);

// HTTP GET params for Etherscan requests
const etherscanOptions = {
    params: {
        module: 'logs',
        action: 'getLogs',
        // fromBlock: START_BLOCK, This is set below in the loop
        toBlock: END_BLOCK,
        address: SHIBBURN_CONTRACT_ADDRESS,
        topic0: BURN_EVENT_TOPIC,
        apikey: '',
    }
};

// ABI for Burn event in ShibBurn contract
const BURN_EVENT_ABI = [
    {"indexed":false,"internalType":"address","name":"sender","type":"address"}, // Sender
    {"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}, // timestamp
    {"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"}, // tokenAddress (Shiba inu)
    {"indexed":false,"internalType":"uint256","name":"poolIndex","type":"uint256"}, // poolIndex
    {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"} // amount to burn
];



// Main function
async function main () {

    const options: Options = {
        startBlock: Number(program.opts().startBlock ?? VESTING_START),
        endBlock: Number(program.opts().endBlock),
        claimBlock: Number(program.opts().claimBlock ?? await shibaSwapData.utils.timestampToBlock(Date.now())),
        overwrite: Boolean(program.opts().overwrite ?? false),
        prod: Boolean(program.opts().prod ?? false),
        noFile: Boolean(program.opts().noFile ?? false),
    };

    const distribution = await getDistribution(options);


    const ADDRESS_BURNT_MAPPING = {}; // { senderAddress, amountBurnt, percentShibSupply, rewardsAmount }

    const ADDRESS_BLACKLIST = JSON.parse(await fs.readFileAsync('./src/blacklist.json'));

    // Looping Etherscan requests because of 1000 event cap per request
    let eventData = [];
    let fromBlock = START_BLOCK;
    while (true) {
        etherscanOptions.params['fromBlock'] = fromBlock;
        const res = await axios.get(ETHERSCAN_ROOT_URI, etherscanOptions);
        console.log(`Query params fromBlock: ${fromBlock}, toBlock: ${END_BLOCK}`);
        console.log(`No Of Burn Events Returned: ${res.data.result.length}`);
        console.log(`First Burn event from block: ${BigNumber.from(res.data.result[0].blockNumber).toNumber()}`);
        console.log(`Last Burn event to block: ${BigNumber.from(res.data.result[res.data.result.length - 1].blockNumber).toNumber()}`);
        eventData = eventData.concat(res.data.result);
        if (res.data.result.length < 1000) { // 1000 rows cap for each request
            break;
        }

        const lastBlockHex = res.data.result[res.data.result.length - 1].blockNumber;
        const lastBlockNumber = BigNumber.from(lastBlockHex).toNumber();
        fromBlock = lastBlockNumber + 1; // Events from both fromBlock number toBlock number are included

        await Promise.delay(RATE_LIMIT_DELAY_IN_MS);
        console.log('Waiting due to Etherscan rate limit...');
    };

    if (eventData.length === 0) {
        throw Error('No Burn events between given block range');
    }

    console.log(`Total no of Burn events: ${eventData.length} between ${START_BLOCK} - ${END_BLOCK} blocks`);

    eventData.map((data: any) => {
        const abiCoder = new ethers.utils.AbiCoder();
        const decodedData = abiCoder.decode(BURN_EVENT_ABI, data.data);
        const senderAddress = decodedData['sender'];
        if (!ADDRESS_BLACKLIST.includes(senderAddress)) {
            const amountBurnt = !Object.keys(ADDRESS_BURNT_MAPPING).includes(senderAddress) ?
                decodedData['amount'] :
                ADDRESS_BURNT_MAPPING[senderAddress]['amountBurnt'].add(decodedData['amount']);
            const percentShibSupply = amountBurnt.div(TOTAL_BURNT_SHIB_SUPPLY);
            const rewardsAmount = percentShibSupply.mul(TOTAL_REWARDS_AMOUNT);
            ADDRESS_BURNT_MAPPING[senderAddress] = { senderAddress, amountBurnt, percentShibSupply, rewardsAmount };
        } else {
            console.log(senderAddress, ' is blacklisted.')
        }
    })

    const oldFormatBalanceMap = {};
    Object.keys(ADDRESS_BURNT_MAPPING).map((address) => {
        oldFormatBalanceMap[address] = ADDRESS_BURNT_MAPPING[address]['rewardsAmount'];
    });

    // Combine Ryo LP rewards with ShibBurn Rewards
    const combinedMerkle = {};
    Object.keys(oldFormatBalanceMap).map((address) => {
        const n_address = getAddress(address);
        if (Object.keys(combinedMerkle).includes(address)) {
            combinedMerkle[n_address] = combinedMerkle[n_address].add(oldFormatBalanceMap[address]);
        } else {
            combinedMerkle[n_address] = oldFormatBalanceMap[address];
        }
    });
    Object.keys(distribution.amounts).map((address) => {
        const n_address = getAddress(address);
        if (Object.keys(combinedMerkle).includes(address)) {
            combinedMerkle[n_address] = combinedMerkle[n_address].add(distribution.amounts[address]);
        } else {
            combinedMerkle[n_address] = BigNumber.from(distribution.amounts[address]);
        }
    });

    // Converting all reward amounts to String of BigInt to stay consistent with getDistribution function
    Object.keys(combinedMerkle).map((address) => {
        combinedMerkle[address] = String(combinedMerkle[address].toBigInt())
    });

    const parsedMerkle = parseBalanceMap(combinedMerkle);
    // console.log(parsedMerkle);
    await fs.writeFileAsync(`merkle-${START_BLOCK}-${END_BLOCK}.json`, JSON.stringify(parsedMerkle, null, 1));
};
