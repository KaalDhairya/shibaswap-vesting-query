import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'
import queries from './queries';
import { finalize } from '../rewardCalculation'
import { Options } from '../types'
import { BURRY_LEASH_COLLECTION } from '../Database/constants';


export default async function getDistribution(options: Options) {
    options.startBlock = options.startBlock;
    options.claimBlock = options.claimBlock ?? (await shibaSwapData.blocks.latestBlock()).number;
    console.log("**************************")
    console.log(options.claimBlock);
    // Fetch the data and redirect the addresses right away
    // const data = redirect(await fetchData(options.startBlock, options.endBlock, options.claimBlock));
    // Rewars claimed by the users till now 

    const WEEK = 2;
    const REWARD_WEEK = 0;
    const REWARD_AMOUNT = 2310;   //33% of total rewards



    // DO NOT CHANGE
    const VESTED_AMOUNT = 0;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e18;
    const POOL = -1;
    const LOCK_PERCENT = 67;
    const UNLOCK_PERCENT = 33;
    const REWARD_TOKEN = "LEASH_BONE"
    const CONTRACT = "BuryLeash"


    const claims = await queries.claims(options.claimBlock);
    const final = await finalize(
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
        BURRY_LEASH_COLLECTION,
        options.noFile
        );

    // console.log(final.users)

    return {
        amounts: final.users,
        blacklisted: final.blacklisted,
        merkle: parseBalanceMap(final.users),
        lockInfo: final.lockInfo
    };
}
