import { fetchAll, fetchEntryBySort, fetchOne, insert } from './Database/utils'
import { USER_INFO_COLLECTION, WEEKLY_REWARD_INFO_COLLECTION } from './Database/constants';
import { LOCK_PERIOD } from "./constants";
import Blacklist from './blacklist.json';
import queries from './genericQueries'
import fs from "fs";

import {Promise} from "bluebird"



function normalise(amount, output_decimal){
    return Math.floor(amount*output_decimal)
}

async function CalculateUserEqualRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token){
    let userInfo = new Map()
    if(startBlock && endBlock){
        let filter = {}
        if(poolId !== -1){
            filter = {"block_number":{ $gte: startBlock, $lte: endBlock }, "contract": contract, "poolId": poolId }
        }else{
            filter= {"block_number":{ $gte: startBlock, $lte: endBlock }, "contract": contract }
        }
        const rewardData: any[] = await fetchAll(rewardShareCollection, filter)
        const rewardPerBlock = reward_amount/rewardData.length;
        const l = rewardData[0].user_share.length - 1
        let userSpotData: any[] = []
        console.log("reward Per block", rewardPerBlock)
        for(var i=0; i< 5;i++){
            var r = Math.floor(Math.random() * l) + 1;
            userSpotData.push({address: rewardData[0].user_share[r-1].address,  blockData: {}})
        }
        rewardData.forEach(blockInfo => {
            console.log("block_number",blockInfo.block_number,rewardShareCollection)
            blockInfo.user_share.forEach(user => {
                const userReward = rewardPerBlock/blockInfo.user_share.length
                for(var i=0;i <5;i++){
                    if(userSpotData[i].address === user.address){
                        userSpotData[i].blockData[blockInfo.block_number] = userReward
                    }
                }
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
        });
        if(!fs.existsSync('./spotCheck')) {
            fs.mkdirSync('./spotCheck', { recursive: true})
        }

        fs.writeFileSync(
            `./spotCheck/${reward_token}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
            JSON.stringify(
                userSpotData, null, 1
            )
        );
    }

    return userInfo
}

export async function CalculateUserRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token){
    let userInfo = new Map()
    if(startBlock && endBlock){
        let filter = {}
        if(poolId !== -1){
            filter = {"block_number":{ $gte: startBlock, $lte: endBlock }, "contract": contract, "poolId": poolId }
        }else{
            filter= {"block_number":{ $gte: startBlock, $lte: endBlock }, "contract": contract }
        }
        console.log(contract, startBlock, endBlock);
        const rewardData: any[] = await fetchAll(rewardShareCollection, filter)
        const rewardPerBlock = reward_amount/rewardData.length;
        const l = rewardData[0].user_share.length - 1
        let userSpotData: any[] = []
        for(var i=0; i< 5;i++){
            var r = Math.floor(Math.random() * l) + 1;
            userSpotData.push({address: rewardData[0].user_share[r-1].address,  blockData: {}})
        }
        rewardData.forEach(blockInfo => {
            console.log("block_number",blockInfo.block_number,rewardShareCollection)
            blockInfo.user_share.forEach(user => {
                const userReward = (rewardPerBlock*user.amount)/blockInfo.normalize_exponent
                for(var i=0;i <5;i++){
                    if(userSpotData[i].address === user.address){
                        userSpotData[i].blockData[blockInfo.block_number] = userReward
                    }
                }
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
        });
        if(!fs.existsSync('./spotCheck')) {
            fs.mkdirSync('./spotCheck', { recursive: true})
        }

        fs.writeFileSync(
            `./spotCheck/${reward_token}.json`,//-${options.claimBlock}}`, - will enable when subgraph switches to mainnet
            JSON.stringify(
                userSpotData, null, 1
            )
        );
    }

    return userInfo
}

async function CalculateUserRewardsBlockByBlock(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection){
    let userInfo = new Map()
    if(startBlock && endBlock){
        let filter = {}
        if(poolId !== -1){
            filter = {"block_number":{ $gte: startBlock, $lte: endBlock }, "poolId": poolId }
        }else{
            filter= {"block_number":{ $gte: startBlock, $lte: endBlock } }
        }
        const block_numbers = await fetchAll(rewardShareCollection, filter, {block_number: 1, _id: 0})
        const rewardPerBlock = reward_amount/block_numbers.length;
        for(const blockNum of block_numbers) {
            console.log("running for block: ", blockNum.block_number)
            let filter1 = {}
            if(poolId !== -1){
                filter1 = {block_number: blockNum.block_number, poolId: poolId }
            }else{
                filter1= { block_number: blockNum.block_number }
            }
            const blockInfo = await fetchOne(rewardShareCollection, filter1)
            blockInfo.user_share.forEach(user => {
                const userReward = (rewardPerBlock*user.amount)/blockInfo.normalize_exponent
                if(userInfo.has(user.address)) {
                    userInfo.set(user.address, userInfo.get(user.address) + userReward)
                } else {
                    userInfo.set(user.address, userReward)
                }
            });
        }
    }
    return userInfo
}

export async function finalizeBasicRewards(startBlock: number, endBlock: number, overwrite: boolean, prod: boolean,
    rewardsOfWeek, week: number, reward_week: number, reward_token, unloack_percent, lock_percent, input_decimal, output_decimal, claims, NoFile,
    equalRewards = false){
        if(week !== 1 && (!claims || typeof claims === 'undefined' || claims.length === 0)){
            console.error("No claims recieved")
            return {
                users: {},
                blacklisted: {},
                lockInfo: {}
            }
        }
    
        let COLLECTION_TO_WRITE = USER_INFO_COLLECTION
        if(!prod){
            var nowDate = new Date(); 
            var date = nowDate.getDate()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getFullYear(); 
            COLLECTION_TO_WRITE = USER_INFO_COLLECTION+"_week_"+week+"_"+date
        }
    
        if(!overwrite){
            const filter = { "week": week, "rewardToken": reward_token }
            const checkdup = await fetchOne(COLLECTION_TO_WRITE, filter)
            if(checkdup && checkdup != null){
                console.error("Entries already present for the reward of the week. Are you sure you want to overwrite? If so pass -ow")
                return {
                    users: {},
                    blacklisted: {},
                    lockInfo: {}
                }
            }
        }

        const user_reward_array: Array<Map<any,any>> = []
        for(const reward of rewardsOfWeek){
            const userReward = await CalculateUserRewards(reward.startBlock?? startBlock, reward.endBlock?? endBlock, reward.reward_amount, reward.contract, 
                reward.poolId, reward.rewardShareCollection, reward.reward_token )
            if(userReward === null || userReward.size === 0){
                console.error("User data not found for: ", reward.reward_token, reward.rewardShareCollection, reward.poolId )
                return {
                    users: {},
                    blacklisted: {},
                    lockInfo: {}
                }
            }
            user_reward_array.push(userReward)
        }

        let userInfo = new Map()
        for(const rewards of user_reward_array){
            for(var address of rewards.keys()){
                if(userInfo.has(address)) {
                    userInfo.set(address, userInfo.get(address) + rewards.get(address))
                } else {
                    userInfo.set(address, rewards.get(address))
                }
            }
        }

        const finalDistribution = await getDistributionInfo(week, reward_week, reward_token,
            unloack_percent, lock_percent, output_decimal, claims, NoFile, COLLECTION_TO_WRITE, userInfo)
            
        return finalDistribution
}

export async function finalize(startBlock: number, endBlock: number, overwrite: boolean, prod: boolean,
    reward_amount: number, week: number, reward_week: number, reward_token: String, 
    contract, poolId, unloack_percent, lock_percent, input_decimal, output_decimal, claims, rewardShareCollection, NoFile,
    equalRewards = false){
        if(week !== 1 && (!claims || typeof claims === 'undefined' || claims.length === 0)){
            console.error("No claims recieved")
            return {
                users: {},
                blacklisted: {},
                lockInfo: {}
            }
        }
    
        let COLLECTION_TO_WRITE = USER_INFO_COLLECTION
        if(!prod){
            var nowDate = new Date(); 
            var date = nowDate.getDate()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getFullYear(); 
            COLLECTION_TO_WRITE = USER_INFO_COLLECTION+"_week_"+week+"_"+date
        }
    
        if(!overwrite){
            const filter = { "week": week, "rewardToken": reward_token }
            const checkdup = await fetchOne(COLLECTION_TO_WRITE, filter)
            if(checkdup && checkdup != null){
                console.error("Entries already present for the reward of the week. Are you sure you want to overwrite? If so pass -ow")
                return {
                    users: {},
                    blacklisted: {},
                    lockInfo: {}
                }
            }
        }

        // Calculate the user rewards per block for the week. This is 33% of the total reward user should get.
        const usersA = equalRewards ? await CalculateUserEqualRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token)
        : await CalculateUserRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token)

        const finalDistribution =  await getDistributionInfo(week, reward_week, reward_token,
            unloack_percent, lock_percent, output_decimal, claims, NoFile, COLLECTION_TO_WRITE, usersA)

        return finalDistribution

}

export async function finalizeWithBurnRewards(startBlock: number, endBlock: number, overwrite: boolean, prod: boolean,
    reward_amount: number, week: number, reward_week: number, reward_token: String, 
    contract, poolId, unloack_percent, lock_percent, input_decimal, output_decimal, claims, rewardShareCollection, NoFile,
    equalRewards = false, userBurnRewards: Map = new Map()){
        if(week !== 1 && (!claims || typeof claims === 'undefined' || claims.length === 0)){
            console.error("No claims recieved")
            return {
                users: {},
                blacklisted: {},
                lockInfo: {}
            }
        }
    
        let COLLECTION_TO_WRITE = USER_INFO_COLLECTION
        if(!prod){
            var nowDate = new Date(); 
            var date = nowDate.getDate()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getFullYear(); 
            COLLECTION_TO_WRITE = USER_INFO_COLLECTION+"_week_"+week+"_"+date
        }
    
        if(!overwrite){
            const filter = { "week": week, "rewardToken": reward_token }
            const checkdup = await fetchOne(COLLECTION_TO_WRITE, filter)
            if(checkdup && checkdup != null){
                console.error("Entries already present for the reward of the week. Are you sure you want to overwrite? If so pass -ow")
                return {
                    users: {},
                    blacklisted: {},
                    lockInfo: {}
                }
            }
        }

        // Calculate the user rewards per block for the week. This is 33% of the total reward user should get.
        const usersA = equalRewards ? await CalculateUserEqualRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token)
        : await CalculateUserRewards(startBlock, endBlock, reward_amount, contract, poolId, rewardShareCollection, reward_token)

        // Add Burn rewards on top of SSLP rewards
        for (const [userAcc, userR] of userBurnRewards) {
            if (usersA.keys().includes(userAcc)) {
                usersA.set(userAcc, userR + usersA.get(userAcc))
            } else {
                usersA.set(userAcc, userR)
            }
        }

        const finalDistribution =  await getDistributionInfo(week, reward_week, reward_token,
            unloack_percent, lock_percent, output_decimal, claims, NoFile, COLLECTION_TO_WRITE, usersA)

        return finalDistribution

}



export async function getDistributionInfo( week: number, reward_week: number, reward_token: String,
    unlock_percent, lock_percent, output_decimal, claims, NoFile, COLLECTION_TO_WRITE, usersA) {

    // console.log(usersA)

    let users:any[] = []
    let totalRewardsOfWeek = 0
    let totalLockedInWeek = 0
    let totalVestedThisWeek = 0

    const PREV_WEEK = 11.1;
    console.log("total users", usersA.size)
    for(var address of usersA.keys()){
        // Initialising values assuming first week
        const account = address.toLowerCase()
        const week_date = (new Date()).getTime()
        const RewardOfWeek =  normalise(usersA.get(address), output_decimal)   // 33% reward available to claim right away
        const LockedThisWeek =  Math.floor(RewardOfWeek * lock_percent / unlock_percent)      // Calculate the rest of 67% of the reward
        const LockReleaseDate =  (new Date()).getTime() + LOCK_PERIOD // Lock release date for the locked reward of the week i.e. after 6 months
        let TotalLocked = LockedThisWeek    // Total locked till now
        let TotalVested =  0                // Total vested till now i.e. Released amount till now. 0 for the 1st week
        let VestedThisWeek =  0             // Released amount this week. 0 for the 1st week
        let TotalClaimedTill =  0              // Total claimed till now. 0 for the 1st week
        let ClaimedPrevWeek =  0                // Claimed amount previous week. 0 for the 1st week
        let ClaimableThisWeek =  RewardOfWeek   // Total claimable amount this week. ronly 33% of the week for 1st week.
        let TotalClaimable =  ClaimableThisWeek         // Cumulative claimable including what is withdrawn by user. Only for analysis
        let NextFirstLock = LockReleaseDate

        totalRewardsOfWeek+=RewardOfWeek
        totalLockedInWeek+=LockedThisWeek


        const filter = { "week": PREV_WEEK, "account": account, "rewardToken": reward_token }
        const lastWeekInfo = await fetchOne(USER_INFO_COLLECTION, filter)
        if(lastWeekInfo && lastWeekInfo!==null){
            TotalLocked = lastWeekInfo.TotalLocked + LockedThisWeek   //Total locked amount of the user
            //NEED TO CHECK IF ADDRESS LOWECASE
            TotalClaimedTill = claims.find(u => address === u.id)?.totalClaimed ?? 0              // Total claimed till ow of the user
            TotalClaimedTill = normalise(TotalClaimedTill, 1e18)                              /// normalising with 1e18 because of subgraph issue which outputs vesting amount*1etokendec/1e18
            ClaimedPrevWeek = TotalClaimedTill - lastWeekInfo.TotalClaimedTill                      // Claimed amount prev week
            const filter1= {"week": reward_week, "account": account, "rewardToken": reward_token}
            const rewardWeekInfo  = await fetchOne(USER_INFO_COLLECTION, filter1)
            TotalVested = lastWeekInfo.TotalVested 
            TotalClaimable = lastWeekInfo.TotalClaimable + RewardOfWeek
            if(rewardWeekInfo){
                VestedThisWeek = rewardWeekInfo.LockedThisWeek             // Find the lock released for the week
                TotalVested += VestedThisWeek               // Total vested till now
                TotalClaimable += VestedThisWeek      // Total Claimable till now (every week's 33% + all vested reward)
                TotalLocked -= VestedThisWeek
                totalVestedThisWeek += VestedThisWeek
            }
            ClaimableThisWeek = TotalClaimable  - TotalClaimedTill              // Claimable of this week
            const filter2 = { "week": { $gt: reward_week }, "LockedThisWeek": { $gt: 0 }, "account": account, "rewardToken": reward_token }
            const firstLockDate = await fetchEntryBySort(USER_INFO_COLLECTION, filter2,  { week: 1 })
            NextFirstLock = firstLockDate?.LockReleaseDate ?? LockReleaseDate
        }

        // Create user object to store for this week
        if(TotalLocked!=0 || ClaimableThisWeek!=0){
            const user_obj = {
                account : account,
                week : week,
                week_date: week_date,
                LockedThisWeek : LockedThisWeek,
                LockReleaseDate :  LockReleaseDate,
                RewardOfWeek :  RewardOfWeek,
                rewardToken :  reward_token,
                TotalLocked : TotalLocked,
                TotalVested :  TotalVested,
                VestedThisWeek :  VestedThisWeek,
                TotalClaimedTill :  TotalClaimedTill,
                ClaimedPrevWeek :  ClaimedPrevWeek,
                ClaimableThisWeek :  ClaimableThisWeek,
                TotalClaimable :  TotalClaimable,
                NextFirstLock: NextFirstLock
            }
            console.log(user_obj)
            await insert(user_obj, COLLECTION_TO_WRITE)
            users.push(user_obj)
        }

        // console.log("user address and reward of week: ", address, RewardOfWeek)
    }


    // Users who didn't participated in the current week but have claimable or locked amount
    if(week > 1){
        console.log("Checking previous week users")
        const prev_week_users = await fetchAll(USER_INFO_COLLECTION, {"week": PREV_WEEK, "rewardToken": reward_token})
        const uncommon_users = prev_week_users.filter(u => !users.some(u2 => u.account == u2.account))
        // console.log("uncommon users: ", uncommon_users.length)
        for(const prev_week_user of uncommon_users) {
            const account = prev_week_user.account
            let TotalClaimedTill =  claims.find(u => prev_week_user.account === u.id)?.totalClaimed ?? 0
            TotalClaimedTill = normalise(TotalClaimedTill, 1e18)
            const claimedPrevWeek = TotalClaimedTill - prev_week_user.TotalClaimedTill
            const filter1= {"week": reward_week, "account": account, "rewardToken": reward_token}
            const rewardWeekInfo  = await fetchOne(USER_INFO_COLLECTION, filter1)
            const VestedThisWeek = rewardWeekInfo?.LockedThisWeek  ?? 0                                    // Find the lock released for the week
            const TotalVested = prev_week_user.TotalVested  +  VestedThisWeek              // Total vested till now
            const TotalClaimable = prev_week_user.TotalClaimable + VestedThisWeek      // Total Claimable till now (every week's 33% + all vested reward)
            const ClaimableThisWeek = TotalClaimable  - TotalClaimedTill              // Claimable of this week
            const filter2 = { "week": { $gt: reward_week }, "LockedThisWeek": { $gt: 0 }, "account": account, "rewardToken": reward_token }
            const firstLockDate = await fetchEntryBySort(USER_INFO_COLLECTION, filter2, { week: 1 })
            const TotalLocked = prev_week_user.TotalLocked - VestedThisWeek
            const NextFirstLock = firstLockDate?.LockReleaseDate ?? 0

            totalVestedThisWeek+=VestedThisWeek

            if(TotalLocked != 0 ||  ClaimableThisWeek != 0){
                const user_obj = {
                    account : prev_week_user.account,
                    week : week,
                    week_date: (new Date()).getTime(),
                    LockedThisWeek :  0,
                    LockReleaseDate :  0,
                    RewardOfWeek :  0,
                    rewardToken :  prev_week_user.rewardToken,
                    TotalLocked : TotalLocked,
                    TotalVested : TotalVested,
                    VestedThisWeek :  VestedThisWeek,
                    TotalClaimedTill :  TotalClaimedTill,
                    ClaimedPrevWeek : claimedPrevWeek,
                    ClaimableThisWeek :  ClaimableThisWeek,
                    TotalClaimable : TotalClaimable,
                    NextFirstLock : NextFirstLock
                }
                console.log(user_obj)
                users.push(user_obj)
                await insert(user_obj, COLLECTION_TO_WRITE)
            }
        }
    }

    console.log("Total Rewards Of Week", totalRewardsOfWeek)
    console.log("Total Locked This Week", totalLockedInWeek)
    console.log("Total vested this week ", totalVestedThisWeek)
    
    if(NoFile){
        console.log("DB process completed. No File will be generated")
        return {
            users: {},
            blacklisted: {},
            lockInfo: {}
        }
    }
    return filterUsers(users, claims)
}

function filterUsers(users, claims){
    console.log("Preparing for file generation")
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
            // .filter(user => user.ClaimableThisWeek >= 1e-18)
            .filter(user => !blacklist.includes(user.account))
            .map(user => {
                return ({
                    address: user.account,
                    locked: user.TotalLocked,
                    nextLockDate: user.NextFirstLock,
                    totalClaimed: user.TotalClaimedTill
                })
            })
            .filter(user => user.locked > BigInt(0))
            .map(user => ({[user.address]: {address: user.address, locked: String(user.locked), nextLockDate: user.nextLockDate, totalClaimed: user.totalClaimed}}))
            .reduce((a, b) => ({...a, ...b}), {})
    }
}




//Manual functions

async function fetchDataTopdog(blockNumber: number) {
    const pools = await queries.pools(blockNumber);
    const users = await queries.users(blockNumber);
    console.log("###################################################");
    // console.log(infoBeginning, infoEnd, poolsBeginning, poolsEnd, usersBeginning, usersEnd, claimed);

    return ({
            pools: pools,
            users: users
    });
}

async function CalculateUserRewardsManualTopdog(reward_amount, pool){
    // let blocks:number[] = [12777015, 12777016, 12777017, 12777018, 12777019, 12777020, 12777021, 12777022, 12777023, 12777024, 12777025, 12777026, 12777027, 12777028, 12777029, 12777030, 12777031, 12777032, 12777033]
    let blocks = [12777056, 12777057, 12777058, 12777059, 12777060, 12777062, 12777063, 12777064, 12777065]
    let usersA = new Map()

    const data = await Promise.mapSeries(blocks, (block) => fetchDataTopdog(block))
    const blockWithSSLP = data.reduce((num, curr)=>{
        return num + !!(curr?.pools && curr.pools[pool]?.sslpBalance)
    },0)
    console.log(blockWithSSLP)
    const rewardPerBlock = reward_amount/blockWithSSLP;

    const filteredBlocks = data.filter(curr=>{return !!(curr?.pools && curr.pools[pool]?.sslpBalance)})

    filteredBlocks?.forEach((blockData)=>{
        const newUsers = blockData?.users?.filter(u=>u.poolId == pool);
        newUsers?.forEach(user => {
            const ssplAtBlock = blockData.pools[pool]?.sslpBalance??0;
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

async function CalculateUserRewardsManualBury(reward_amount, pool){
    let blocks:number[] = [25290297, 25290870, 25290949, 25291142, 25291170, 25292815, 25292961, 25293028, 25293029, 25293029, 25293490, 25293491, 25294055, 25294474, 25294700, 25296876, 25302906, 25302911, 25302914, 25305927, 25305935, 25307036, 25307118, 25307131, 25307185, 25307195, 25307217, 
        25307294, 25307307, 25307316, 25307368, 25307398, 25307410, 25307417, 25307443, 25307471, 25307734, 25307747, 25308388, 25311916, 25313303, 25313527, 25313706, 25313760, 25313769, 25313813, 25314243, 25322128, 25322130, 25322132, 25322134, 25322140, 25322146, 25322147, 25322148, 25322149, 25322150, 25322151, 
        25322157, 25322158, 25322159, 25322161, 25322162, 25322163, 25322166, 25322168, 25322169, 25322170, 25322173, 25322174, 25322175, 25322176, 25322178, 25322180, 25322181, 25322183, 25322287, 25322307, 25322314, 25322315, 25322316, 25322324, 25325310, 25325960, 25329365, 25346408, 25386424]
    const POOL = 0;
    const REWARD_AMOUNT = 1;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e18;
    
    let usersA = new Map()
    let cumSupply = 0
    const data = await Promise.mapSeries(blocks, (block) => queries.buryShibUsers(block))

    const blockWithSSLP = data.reduce((num, curr)=>{
        return num + !!(curr[0]?.totalSupply)
    },0)
    console.log(blockWithSSLP)
    const rewardPerBlock = REWARD_AMOUNT/blockWithSSLP;
    const filteredBlocks = data.filter(curr=>{return !!(curr[0]?.totalSupply)})

    filteredBlocks?.forEach((eachBlockQueryResult, blockIndex) => {
        eachBlockQueryResult.forEach(eachBuryInABlock => {
            eachBuryInABlock.users.forEach((eachBuryUserInABlock : any, userIndex) => {
                // Check if the user is already marked for the block if yes don't increment
                const userAddress = eachBuryUserInABlock.id;
                const totalSupplyAtBlock = eachBuryInABlock.totalSupply??0;
                const userReward = totalSupplyAtBlock ? (eachBuryUserInABlock.xShib*rewardPerBlock/totalSupplyAtBlock): 0;
                // if(userAddress == "0x48863c213eb16127d16fd377088b118554187c49")console.log(userAddress, eachBuryUserInABlock.xShib, totalSupplyAtBlock, userReward)
                if(usersA.has(userAddress)) {
                    usersA.set(userAddress, usersA.get(userAddress) + userReward)
                } else {
                    usersA.set(userAddress, userReward)
                }
            })
            // cumSupply += Number(eachBuryInABlock.totalSupply);
        })

    })
    return usersA;
}
