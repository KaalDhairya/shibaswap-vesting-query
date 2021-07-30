import { Command } from "commander";
import fs from "fs";
import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { Options } from '../types'

import getDistribution from './index';
import { VESTING_START } from "../constants";

const program = new Command();;

program
    .option('-s, --startBlock <number>')
    .option('-e, --endBlock <number>')
    .option('-c, --claimBlock <number>')
    .option('-ow, --overwrite <boolean>')
    .option('-pd, --prod <boolean>')

program.parse(process.argv);

main();

async function main() {
    const options: Options = {
        startBlock: Number(program.opts().startBlock ?? VESTING_START),
        endBlock: Number(program.opts().endBlock),
        claimBlock: Number(program.opts().claimBlock ?? await shibaSwapData.utils.timestampToBlock(Date.now())),
        overwrite: Boolean(program.opts().overwrite ?? false),
        prod: Boolean(program.opts().prod ?? false),
        noFile: Boolean(program.opts().prod ?? false)
    }

    const distribution = await getDistribution(options);

    console.log("Generating files")

    if(!fs.existsSync('./outputs/BuryShibWeth')) {
        fs.mkdirSync('./outputs/BuryShibWeth', { recursive: true})
    }

    fs.writeFileSync(
        `./outputs/BuryShibWeth/amounts-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
        JSON.stringify(
            distribution.amounts, null, 1
        )
    );

    fs.writeFileSync(
        `./outputs/BuryShibWeth/blacklisted-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
        JSON.stringify(
            distribution.blacklisted, null, 1
        )
    );

    fs.writeFileSync(
        `./outputs/BuryShibWeth/merkle-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
        JSON.stringify(
            distribution.merkle, null, 1
        )
    )

    fs.writeFileSync(
        `./outputs/BuryShibWeth/lockInfo-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
        JSON.stringify(
            distribution.lockInfo, null, 1
        )
    )
};