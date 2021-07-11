import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'

import queries from './queries';

import { LOCK_PERIOD, VESTING_POOL_ID, VESTING_START } from "../constants";
import Blacklist from './blacklist.json';
import {Promise} from "bluebird"
import { fetchAll, fetchOne, insert } from '../Database/utils'
import { USER_INFO_COLLECTION } from '../Database/constants';

type Info = shibaSwapData.topdog.Info;

type Pools = shibaSwapData.topdog.Pool[];

type Claims = shibaSwapData.vesting.User[];

type User = shibaSwapData.topdog.User;

type UsersConsolidated = {
    address: string,
    amount: number
}[];

type Options = {
    startBlock?: number,
    endBlock: number,
    claimBlock?: number
};

type DataPart = {
    info: Info,
    pools: Pools,
    users: User[],
    claims: Claims
};

type Data = {
    beginning: DataPart,
    end: DataPart
};

const VESTED_AMOUNT = 0;
const INPUT_DECIMAL = 1e18;
const OUTPUT_DECIMAL = 1e8;
const POOL = 15;
const REWARD_AMOUNT = 5000;   //33% of total rewards
const LockPercent = 67;
const UnLockPercent = 33;
const WEEK = 3;
const REWARD_WEEK = 1;
const REWARD_TOKEN = "WBTC"

export default async function getDistribution(options: Options) {
    options.startBlock = options.startBlock ?? VESTING_START;
    options.claimBlock = options.claimBlock ?? (await shibaSwapData.blocks.latestBlock()).number;
    console.log("**************************")
    console.log(options.claimBlock);
    // Fetch the data and redirect the addresses right away
    // const data = redirect(await fetchData(options.startBlock, options.endBlock, options.claimBlock));
    const final = await finalize(options.startBlock, options.endBlock, options.claimBlock);

    console.log(final.users)

    return {
        amounts: final.users,
        blacklisted: final.blacklisted,
        merkle: parseBalanceMap(final.users),
        lockInfo: final.lockInfo
    };
}

async function fetchData(blockNumber: number) {
    const pools = await queries.pools(blockNumber);
    const users = await queries.users(blockNumber);
    console.log("###################################################");
    // console.log(infoBeginning, infoEnd, poolsBeginning, poolsEnd, usersBeginning, usersEnd, claimed);

    return ({
            pools: pools,
            users: users
    });
}

function normalise(amount){
    return Math.floor(amount*OUTPUT_DECIMAL)
}

async function CalculateUserRewards(){
    // let blocks:number[] = [12777015, 12777016, 12777017, 12777018, 12777019, 12777020, 12777021, 12777022, 12777023, 12777024, 12777025, 12777026, 12777027, 12777028, 12777029, 12777030, 12777031, 12777032, 12777033]
    let blocks = [12777056, 12777057, 12777058, 12777059, 12777060, 12777062, 12777063, 12777064, 12777065]
    let usersA = new Map()

    const data = await Promise.mapSeries(blocks, (block) => fetchData(block))
    const blockWithSSLP = data.reduce((num, curr)=>{
        return num + !!(curr?.pools && curr.pools[POOL]?.sslpBalance)
    },0)
    console.log(blockWithSSLP)
    const rewardPerBlock = REWARD_AMOUNT/blockWithSSLP;

    const filteredBlocks = data.filter(curr=>{return !!(curr?.pools && curr.pools[POOL]?.sslpBalance)})

    filteredBlocks?.forEach((blockData)=>{
        const newUsers = blockData?.users?.filter(u=>u.poolId == POOL);
        newUsers?.forEach(user => {
            const ssplAtBlock = blockData.pools[POOL]?.sslpBalance??0;
            const userReward = ssplAtBlock ? (user.amount*rewardPerBlock/ssplAtBlock): 0;
            if(usersA.has(user.address)) {
                usersA.set(user.address, usersA.get(user.address) + userReward)
            } else {
                usersA.set(user.address, userReward)
            }
        });
    })
    return usersA;
}

async function finalize(startBlock: number, endBlock: number, claimBlock: number) {

    // Calculate the user rewards per block for the week. This is 33% of the total reward user should get.
    const usersA = await CalculateUserRewards()

    // Rewars claimed by the users till now 
    const claims = await queries.claims(claimBlock);

    let users:any[] = []
    for(var address of usersA.keys()){
        // Initialising values assuming first week
        const account = address.toLowerCase()
        const week = WEEK
        const week_date = (new Date()).getTime()
        const RewardOfWeek =  normalise(usersA.get(address)/INPUT_DECIMAL)   // 33% reward available to claim right away
        const LockedThisWeek =  Math.floor(RewardOfWeek * LockPercent / UnLockPercent)      // Calculate the rest of 67% of the reward
        const LockReleaseDate =  (new Date()).getTime() + LOCK_PERIOD // Lock release date for the locked reward of the week i.e. after 6 months
        const rewardToken =  REWARD_TOKEN             // reward token
        let TotalLocked = LockedThisWeek    // Total locked till now
        let TotalVested =  0                // Total vested till now i.e. Released amount till now. 0 for the 1st week
        let VestedThisWeek =  0             // Released amount this week. 0 for the 1st week
        let TotalClaimedTill =  0              // Total claimed till now. 0 for the 1st week
        let ClaimedPrevWeek =  0                // Claimed amount previous week. 0 for the 1st week
        let ClaimableThisWeek =  RewardOfWeek   // Total claimable amount this week. ronly 33% of the week for 1st week.
        let TotalClaimable =  ClaimableThisWeek         // Cumulative claimable including what is withdrawn by user. Only for analysis

        const PREV_WEEK  = WEEK - 1
        const filter = { "week": PREV_WEEK, "account": account, "rewardToken": REWARD_TOKEN }
        const lastWeekInfo = await fetchOne(USER_INFO_COLLECTION, filter)
        if(lastWeekInfo && lastWeekInfo!==null){
            TotalLocked = lastWeekInfo.TotalLocked + LockedThisWeek   //Total locked amount of the user
            //NEED TO CHECK IF ADDRESS LOWECASE
            TotalClaimedTill = claims.find(u => address === u.id)?.totalClaimed ?? 0              // Total claimed till ow of the user
            ClaimedPrevWeek = normalise(TotalClaimedTill) - lastWeekInfo.TotalClaimedTill                      // Claimed amount prev week
            const filter1= {"week": REWARD_WEEK, "account": account, "rewardToken": REWARD_TOKEN}
            const rewardWeekInfo  = await fetchOne(USER_INFO_COLLECTION, filter1)
            TotalVested = lastWeekInfo.TotalVested 
            TotalClaimable = lastWeekInfo.TotalClaimable + RewardOfWeek
            if(rewardWeekInfo){
                VestedThisWeek = rewardWeekInfo.LockedThisWeek             // Find the lock released for the week
                TotalVested += VestedThisWeek               // Total vested till now
                TotalClaimable += VestedThisWeek      // Total Claimable till now (every week's 33% + all vested reward)
                TotalLocked -= VestedThisWeek
            }
            ClaimableThisWeek = TotalClaimable  - TotalClaimedTill              // Claimable of this week
        }

        // Create user object to store for this week
        const user_obj = {
            account : account,
            week : week,
            week_date: week_date,
            LockedThisWeek : LockedThisWeek,
            LockReleaseDate :  LockReleaseDate,
            RewardOfWeek :  RewardOfWeek,
            rewardToken :  rewardToken,
            TotalLocked : TotalLocked,
            TotalVested :  TotalVested,
            VestedThisWeek :  VestedThisWeek,
            TotalClaimedTill :  TotalClaimedTill,
            ClaimedPrevWeek :  ClaimedPrevWeek,
            ClaimableThisWeek :  ClaimableThisWeek,
            TotalClaimable :  TotalClaimable
        }
        insert(user_obj, USER_INFO_COLLECTION)
        users.push(user_obj)
    }

    // Users who didn't participated in the current week but have claimable or locked amount
    if(WEEK > 1){
        const prev_week_users = await fetchAll(USER_INFO_COLLECTION, {"week": WEEK - 1, "rewardToken": REWARD_TOKEN})
        const uncommon_users = prev_week_users.filter(u => !users.some(u2 => u.account == u2.account))
        await uncommon_users.forEach(async prev_week_user => {
            const TotalClaimedTill =  claims.find(u => prev_week_user.account === u.id)?.totalClaimed ?? 0
            const claimedPrevWeek = normalise(TotalClaimedTill) - prev_week_user.TotalClaimedTill
            const filter1= {"week": REWARD_WEEK, "account": address, "rewardToken": REWARD_TOKEN}
            const rewardWeekInfo  = await fetchOne(USER_INFO_COLLECTION, filter1)
            const VestedThisWeek = rewardWeekInfo?.LockedThisWeek  ?? 0                                    // Find the lock released for the week
            const TotalVested = prev_week_user.TotalVested  +  VestedThisWeek              // Total vested till now
            const TotalClaimable = prev_week_user.TotalClaimable + VestedThisWeek      // Total Claimable till now (every week's 33% + all vested reward)
            const ClaimableThisWeek = TotalClaimable  - normalise(TotalClaimedTill)              // Claimable of this week
            if(prev_week_user.TotalLocked != 0 &&  TotalClaimable != 0){
                const user_obj = {
                    account : prev_week_user.account,
                    week : WEEK,
                    week_date: (new Date()).getTime(),
                    LockedThisWeek :  0,
                    LockReleaseDate :  0,
                    RewardOfWeek :  0,
                    rewardToken :  prev_week_user.rewardToken,
                    TotalLocked : prev_week_user.TotalLocked,
                    TotalVested : TotalVested,
                    VestedThisWeek :  prev_week_user.VestedThisWeek,
                    TotalClaimedTill :  TotalClaimedTill,
                    ClaimedPrevWeek : claimedPrevWeek,
                    ClaimableThisWeek :  ClaimableThisWeek,
                    TotalClaimable : TotalClaimable
                }
                users.push(user_obj)
                insert(user_obj, USER_INFO_COLLECTION)
            }
        });
    }

    return filterUsers(users, claims)
}

function filterUsers(users, claims){
    const blacklist = Blacklist.map((a:String)=>a.toLowerCase())
    return {
        users: users
            .filter(user => user.ClaimableThisWeek >= 1e-18)
            .filter(user => !blacklist.includes(user.account))
            .map(user => {
                return ({
                    address: user.account,
                    vested: BigInt(Math.floor((user.ClaimableThisWeek)))
                })
            })
            .filter(user => user.vested > BigInt(0))
            .map(user => ({[user.address]: String(user.vested)}))
            .reduce((a, b) => ({...a, ...b}), {}),

        blacklisted: users
            .filter(user => user.ClaimableThisWeek >= 1e-18)
            .filter(user => blacklist.includes(user.account))
            .map(user => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
                return ({
                    address: user.account,
                    vested: BigInt(Math.floor((user.ClaimableThisWeek)))
                })
            })
            .filter(user => user.vested > BigInt(0))
            .map(user => ({[user.address]: String(user.vested)}))
            .reduce((a, b) => ({...a, ...b}), {}),
        
        lockInfo: users
            .filter(user => user.ClaimableThisWeek >= 1e-18)
            .filter(user => !blacklist.includes(user.address))
            .map(user => {
                return ({
                    address: user.account,
                    locked: user.TotalLocked,
                    nextLockDate: (new Date()).getTime() + LOCK_PERIOD,
                    totalClaimed: user.TotalClaimedTill
                })
            })
            .filter(user => user.locked > BigInt(0))
            .map(user => ({[user.address]: {address: user.address, locked: String(user.locked), nextLockDate: user.nextLockDate, totalClaimed: user.totalClaimed}}))
            .reduce((a, b) => ({...a, ...b}), {})
    }
}