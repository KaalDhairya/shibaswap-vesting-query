import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'
import queries from './queries';
import { finalize } from '../rewardCalculation'
import { Options } from '../types'
import { TOPDOG_COLLECTION } from '../Database/constants';
import { option } from 'commander';


export default async function getDistribution(options: Options, userBurnRewards: Map) {
    options.startBlock = options.startBlock;
    options.claimBlock = options.claimBlock ?? (await shibaSwapData.blocks.latestBlock()).number;
    console.log("**************************")
    console.log(options.claimBlock);
    // Fetch the data and redirect the addresses right away
    // const data = redirect(await fetchData(options.startBlock, options.endBlock, options.claimBlock));
    // Rewars claimed by the users till now 


    const WEEK = 1;
    const REWARD_WEEK = 0;
    const REWARD_AMOUNT = 573000000000;   // 573 Billion




    // DO NOT CHANGE
    const VESTED_AMOUNT = 0;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e18;
    const POOL = 23;
    const LOCK_PERCENT = 0;
    const UNLOCK_PERCENT = 100;
    const REWARD_TOKEN = "RYOSHI"
    const CONTRACT = "TopDog"


    const claims = await queries.claims(options.claimBlock);
    console.log(claims.length)
    const final = await finalizeWithBurnRewards(
        options.startBlock, 
        options.endBlock,
        options.overwrite,
        options.prod,
        REWARD_AMOUNT,
        WEEK,
        REWARD_WEEK,
        REWARD_TOKEN,
        CONTRACT,
        POOL,
        UNLOCK_PERCENT,
        LOCK_PERCENT,
        INPUT_DECIMAL,
        OUTPUT_DECIMAL,
        claims,
        TOPDOG_COLLECTION,
        options.noFile,
        userBurnRewards=userBurnRewards
        );

    // console.log(final.users)

    return {
        amounts: final.users,
        blacklisted: final.blacklisted,
        merkle: parseBalanceMap(final.users),
        lockInfo: final.lockInfo
    };
}
