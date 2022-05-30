
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

const BURNTSHIB_CONTRACT_ADDRESS = '0x7E743f75C2555A7c29068186feed7525D0fe9195';


const TOTAL_REWARDS_AMOUNT = BigNumber.from(2540000000000); // 2.54 Trillion

const NORMALISE_CONST = 1e18;

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
    const { startBlock, endBlock } = options;

    const ADDRESS_BURNT_MAPPING = {}; // { senderAddress, amountBurnt, percentShibSupply, rewardsAmount }

    const ADDRESS_BLACKLIST = JSON.parse(await fs.readFileAsync('./src/blacklist.json')).map((a) => a.toLowerCase());

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

        if (fromBlock >= endBlock) {
            break;
        }

        await Promise.delay(RATE_LIMIT_DELAY_IN_MS);
        console.log('Waiting due to Etherscan rate limit...');
    };

    if (eventData.length === 0) {
        throw Error('No Burn events between given block range');
    }

    console.log(`Total no of Burn events: ${eventData.length} between ${START_BLOCK} - ${END_BLOCK} blocks`);

    console.log('Fetching Total Supply of Burnt Shib per block');
    const burntShibPerBlock = {}; // TODO: GET FROM ETHERSCAN
    let blockNumber = START_BLOCK;
    while (true) {
        const getTotalSupplyPerBlockOptions = {
            params: {
                module: 'stats',
                action: 'tokensupplyhistory',
                contractAddress: BURNTSHIB_CONTRACT_ADDRESS,
                blockno: blockNumber,
                apikey: '',
            }
        };
        const res = await axios.get(ETHERSCAN_ROOT_URI, getTotalSupplyPerBlockOptions);

        burntShibPerBlock[String(blockNumber)] = Number(res.result);
        blockNumber += 1;

        if (blockNumber >= endBlock) {
            break;
        }

        // Rate limited to 2 calls/sec (https://docs.etherscan.io/api-endpoints/tokens#get-historical-erc20-token-totalsupply-by-contractaddress-and-blockno)
        await Promise.delay(750);
    };
    const noOfBlocks = endBlock - startBlock;
    const TOTAL_REWARDS_PER_BLOCK = TOTAL_REWARDS_AMOUNT / noOfBlocks;

    eventData.map((data: any) => {
        const abiCoder = new ethers.utils.AbiCoder();
        const decodedData = abiCoder.decode(BURN_EVENT_ABI, data.data);
        const senderAddress = decodedData['sender'];
        const blockNumberString = String(Number(decodedData['blockNumber']));
        if (!ADDRESS_BLACKLIST.includes(senderAddress.toLowerCase())) {
            const amountBurnt = !Object.keys(ADDRESS_BURNT_MAPPING).includes(senderAddress) ?
                decodedData['amount'] / NORMALISE_CONST:
                ADDRESS_BURNT_MAPPING[senderAddress]['amountBurnt'] + (decodedData['amount'] / NORMALISE_CONST);
            console.log(senderAddress, decodedData);
            const percentShibSupply = amountBurnt / burntShibPerBlock[blockNumberString];
            const rewardsAmount = percentShibSupply * TOTAL_REWARDS_PER_BLOCK;
            ADDRESS_BURNT_MAPPING[senderAddress] = { senderAddress, amountBurnt, percentShibSupply, rewardsAmount };
        } else {
            console.log(senderAddress, ' is blacklisted.')
        }
    })

    const userBurnRewards = {};
    Object.keys(ADDRESS_BURNT_MAPPING).map((address) => {
        userBurnRewards[address] = ADDRESS_BURNT_MAPPING[address]['rewardsAmount'];
    });

    const distribution = await getDistribution(options, userBurnRewards);

    const parsedMerkle = parseBalanceMap(distribution.users);
    await fs.writeFileAsync(`merkle-${START_BLOCK}-${END_BLOCK}.json`, JSON.stringify(parsedMerkle, null, 1));
};
