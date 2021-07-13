import { Command } from "commander";
import fs from "fs";
import shibaSwapData from '@shibaswap/shibaswap-data-snoop';

import getDistribution from './bar/index';
import { VESTING_START } from "./constants";

const program = new Command();

type Options = {
    startBlock: number,
    endBlock: number,
    claimBlock: number
};

program
    .option('-s, --startBlock <number>')
    .requiredOption('-e, --endBlock <number>')
    .option('-c, --claimBlock <number>')

program.parse(process.argv);

main();

async function main() {
    const options: Options = {
        startBlock: Number(program.opts().startBlock ?? VESTING_START),
        endBlock: Number(program.opts().endBlock),
        claimBlock: Number(program.opts().claimBlock ?? await shibaSwapData.utils.timestampToBlock(Date.now()))
    }

    const distribution = await getDistribution(options);

    // TODO
    // if(!fs.existsSync('./outputs')) {
    //     fs.mkdirSync('./outputs')
    // }

    // fs.writeFileSync(
    //     `./outputs/amounts-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
    //     JSON.stringify(
    //         distribution.amounts, null, 1
    //     )
    // );

    // fs.writeFileSync(
    //     `./outputs/blacklisted-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
    //     JSON.stringify(
    //         distribution.blacklisted, null, 1
    //     )
    // );

    // fs.writeFileSync(
    //     `./outputs/merkle-${options.startBlock}-${options.endBlock}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
    //     JSON.stringify(
    //         distribution.merkle, null, 1
    //     )
    // )
};