import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'

import queries from './queries';

import { LOCK_PERIOD, VESTING_POOL_ID, VESTING_START } from "../constants";
import Blacklist from './blacklist.json';
import {Promise} from "bluebird"
import { fetch, insert } from '../Database/utils'
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

async function CalculateUserRewards(){
    let blocks:number[] = [25288382, 25288387, 25288756, 25288768, 25288891, 25288893, 25288895, 25288896, 25288898, 25289114, 25289243, 25289305, 25289389, 25289390, 25289391, 25289392, 25289394, 25289409, 25289410, 25289523, 25289728, 25289758, 25289759, 25289916, 25290096, 25290159, 25290194, 25290681, 25290685, 25290696, 25290829, 25290952, 25290958, 25291039, 25291115, 25291224, 25291266, 25291269, 
        25291403, 25291494, 25291510, 25291517, 25291537, 25291701, 25291842, 25291846, 25291892, 25291924, 25292111, 25292113, 25292115, 25292401, 25292612, 25292642, 25292656, 25292704, 25292716]
    let usersA = new Map()
    const POOL = 0;
    const REWARD_AMOUNT = 10000;   //33% of total rewards

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
        // cumSSLP+= blockData.pools[POOL]?.sslpBalance??0;
    })
    return usersA;
}

async function finalize(startBlock: number, endBlock: number, claimBlock: number) {
    const VESTED_AMOUNT = 0;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e8;
    const WEEK = 1;

    const usersA = await CalculateUserRewards()
    console.log(usersA)

    const claims = await queries.claims(claimBlock);

    let users:any[] = []
    for(var address of usersA.keys()){
        const account = address.toLowerCase()
        const week = WEEK
        const week_date = (new Date()).getTime()
        const LockedThisWeek =  usersA.get(address) * 67 / 33
        const LockReleaseDate =  (new Date()).getTime() + LOCK_PERIOD
        const RewardOfWeek =  usersA.get(address)
        const rewardToken =  "WBTC"
        let TotalLocked = LockedThisWeek
        let TotalVested =  0
        let VestedThisWeek =  0
        let TotalClaimedTill =  0
        let ClaimedPrevWeek =  0
        let ClaimableThisWeek =  RewardOfWeek
        let TotalClaimable =  ClaimableThisWeek

        if(WEEK > 1){
            const PREV_WEEK  = WEEK - 1
            const filter = { "week": PREV_WEEK, "account": address, "rewardToken": "WBTC" }
            const lastWeekInfo = fetch(USER_INFO_COLLECTION, filter)
            TotalLocked = lastWeekInfo.TotalLocked + LockedThisWeek
            TotalClaimedTill = claims.find(u => address === u.id)?.totalClaimed ?? 0
            ClaimedPrevWeek = TotalClaimedTill - lastWeekInfo.TotalClaimedTill
        }
        const user_obj = {
            account : account,
            week : week,
            week_date: week_date,
            LockedThisWeek :  LockedThisWeek,
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
        users.push({
            address: address.toLowerCase(),
            amount: Number(((usersA.get(address))/INPUT_DECIMAL))
        })
    }

    console.log(claims)

    const blacklist = Blacklist.map((a:String)=>a.toLowerCase())


    return {
        users: users
            .filter(user => user.amount >= 1e-18)
            .filter(user => !blacklist.includes(user.address))
            .map(user => {
                // const vested = user.amount * fraction;

                const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

                return ({
                    address: user.address,
                    vested: BigInt(Math.floor((user.amount - claimed) * OUTPUT_DECIMAL))
                })
            })
            .filter(user => user.vested > BigInt(0))
            .map(user => ({[user.address]: String(user.vested)}))
            .reduce((a, b) => ({...a, ...b}), {}),

        blacklisted: users
            .filter(user => user.amount >= 1e-18)
            .filter(user => blacklist.includes(user.address))
            .map(user => {
                // const vested = user.amount * fraction;

                const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

                return ({
                    address: user.address,
                    vested: BigInt(Math.floor((user.amount - claimed) * OUTPUT_DECIMAL))
                })
            })
            .filter(user => user.vested > BigInt(0))
            .map(user => ({[user.address]: String(user.vested)}))
            .reduce((a, b) => ({...a, ...b}), {}),
        
        lockInfo: users
            .filter(user => user.amount >= 1e-18)
            .filter(user => !blacklist.includes(user.address))
            .map(user => {
                // const vested = user.amount * fraction;
        
                const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;
        
                return ({
                    address: user.address,
                    locked: BigInt(Math.floor((user.amount * 66 / 33) * OUTPUT_DECIMAL)),
                    nextLockDate: (new Date()).getTime() + LOCK_PERIOD,
                    totalClaimed: claimed
                })
            })
            .filter(user => user.locked > BigInt(0))
            .map(user => ({[user.address]: {address: user.address, locked: String(user.locked), nextLockDate: user.nextLockDate, totalClaimed: user.totalClaimed}}))
            .reduce((a, b) => ({...a, ...b}), {})
    }
}