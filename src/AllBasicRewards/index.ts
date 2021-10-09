import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'
import queries from './queries';
import { finalizeBasicRewards } from '../rewardCalculation'
import { Options } from '../types'
import { TOPDOG_COLLECTION, BURRY_BONE_COLLECTION, BURRY_LEASH_COLLECTION, BURRY_SHIB_COLLECTION } from '../Database/constants';


export default async function getDistribution(options: Options) {
    options.startBlock = options.startBlock;
    options.claimBlock = options.claimBlock ?? (await shibaSwapData.blocks.latestBlock()).number;
    console.log("**************************")
    console.log(options.claimBlock);
    // Fetch the data and redirect the addresses right away
    // const data = redirect(await fetchData(options.startBlock, options.endBlock, options.claimBlock));
    // Rewars claimed by the users till now 


    const WEEK = 1;
    const REWARD_WEEK = 0;

    const rewardsOfWeek = [
        {reward_amount: 10540, contract: "TopDog", poolId: 15, rewardShareCollection: TOPDOG_COLLECTION, reward_token: "BONE_ETH_BONE"},
        {reward_amount: 6989, contract: "TopDog", poolId: 1, rewardShareCollection: TOPDOG_COLLECTION, reward_token: "LEASH_ETH_BONE"},
        {reward_amount: 24100, contract: "BuryBone", poolId: -1, rewardShareCollection: BURRY_BONE_COLLECTION, reward_token: "BURYBONE_BONE"},
        {reward_amount: 24100 , contract: "BuryLeash", poolId: -1, rewardShareCollection: BURRY_LEASH_COLLECTION, reward_token: "BURYLEASH_BONE"},
        {reward_amount: 144277, contract: "BuryShib", poolId: -1, rewardShareCollection: BURRY_SHIB_COLLECTION, reward_token: "BURYSHIB_BONE", 
            startBlock: 13154154, endBlock: 13244154}
    ]
    
    
    //DO NOT CHANGE
    const VESTED_AMOUNT = 0;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e18;
    const LOCK_PERCENT = 67;
    const UNLOCK_PERCENT = 33;
    const REWARD_TOKEN = "BASIC_BONE";


    const claims = await queries.claims(options.claimBlock);
    console.log(claims.length)
    const final:any = await finalizeBasicRewards(
        options.startBlock, 
        options.endBlock,
        options.overwrite,
        options.prod,
        rewardsOfWeek,
        WEEK,
        REWARD_WEEK,
        REWARD_TOKEN,
        UNLOCK_PERCENT,
        LOCK_PERCENT,
        INPUT_DECIMAL,
        OUTPUT_DECIMAL,
        claims,
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