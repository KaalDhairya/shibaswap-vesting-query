import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
// import { parseBalanceMap } from '../parse-balance-map'
import {Promise} from "bluebird";

import queries from './queries';

import { VESTING_START } from "./constants";
import redirects from './redirects.json';
import blacklist from './blacklist.json';

type Claims = shibaSwapData.buryshibBoneVesting.User[];
type BuryShibs = shibaSwapData.buryshib.BuryShibs;
type User = shibaSwapData.buryshib.User;

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
    claims: Claims
};

type Data = {
    beginning: DataPart,
    end: DataPart
};

export default async function getDistribution(options: Options) {
    options.startBlock = options.startBlock ?? VESTING_START;
    options.claimBlock = options.claimBlock ?? (await shibaSwapData.blocks.latestBlock()).number;
    // Fetch the data and redirect the addresses right away
    // const data = redirect();
    const data = await fetchData(options.startBlock, options.endBlock, options.claimBlock);
    // console.log(data);

    // const final = finalize(
    //     consolidate(data.beginning, options.startBlock),
    //     consolidate(data.end, options.endBlock),
    //     calculateTotalVested(data, options),
    //     data.end.claims
    // );

    // return {
    //     amounts: final.users,
    //     blacklisted: final.blacklisted,
    //     merkle: parseBalanceMap(final.users)
    // };
    return
}

async function fetchData(startBlock: number, endBlock: number, claimBlock: number) {
    const blocks : number[] = [25079266, 25082856, 25083012, 25083633, 25083639, 25083696, 25083716, 25083746, 25083758, 25100816, 25100869, 25119633, 25127750, 25127981, 25128623, 25128624, 25128941, 25128958, 25128965, 25163479, 25163643, 25163650, 25172003, 25172013];
    const userMarked : any = []
    for(let i=0; i <= blocks.length; i++) {
        userMarked.push([i, new Set()] )
    }
    // const allBlocksQueryResults = await Promise.all(blocks.map(block => queries.buryShibUsers(block)))
    console.log("Done")
    const allBlocksData = await Promise.mapSeries(blocks, (block) => queries.buryShibUsers(block))

    const claimData = queries.buryShibVestingClaims(claimBlock);
    console.log(claimData);

    const userRollCallMap = new Map();
    const userMarkedForBlock = new Map(userMarked);
    const userRewardsDistributionMap = new Map();
    const allUsers = new Set();

    // userMarkedForBlock => 1 -> { "ABC", "PQR" } 2 -> { "ABC", "PQR" }
    // userRollCallMap => "ABC" -> 3 "PQR" -> 5
    // userRewardsDistributionMap => "ABC" -> 40 "PQR" -> 50
    // We should also calculate mean, median and mode
    let totalTotalSupply = 0;
    allBlocksData.forEach((eachBlockQueryResult, blockIndex) => {
        eachBlockQueryResult.forEach(eachBuryInABlock => {
            eachBuryInABlock.users.forEach((eachBuryUserInABlock : User, userIndex) => {
                // Check if the user is already marked for the block if yes don't increment
                const userAddress = eachBuryUserInABlock.id;
                // console.log(userAddress);
                // console.log(userMarkedForBlock.get(blockIndex));
                if(!((userMarkedForBlock.get(blockIndex) as any).has(userAddress))) {
                    userMarkedForBlock.set(blockIndex, (userMarkedForBlock.get(blockIndex) as any).add(userAddress))
                    if(userRollCallMap.has(userAddress)) {
                        userRollCallMap.set(userAddress, userRollCallMap.get(userAddress) + 1)
                    } else {
                        userRollCallMap.set(userAddress, 1)
                    }
                }
                if(userRewardsDistributionMap.has(userAddress)) {
                    userRewardsDistributionMap.set(userAddress, userRewardsDistributionMap.get(userAddress) + eachBuryUserInABlock.xShib)
                } else {
                    userRewardsDistributionMap.set(userAddress, eachBuryUserInABlock.xShib)
                }

                allUsers.add(userAddress);
            })
            totalTotalSupply += Number(eachBuryInABlock.totalSupply);
        })

    })

    // console.log(userRollCallMap)
    // console.log(userMarkedForBlock)
    // console.log(userRewardsDistributionMap);
    // console.log(totalTotalSupply)
    // console.log(allUsers);
    const totalRewards = 400;
    allUsers.forEach(each => {
        const eachTotal = userRewardsDistributionMap.get(each)
        userRewardsDistributionMap.set(each, (((eachTotal / totalTotalSupply) * 100) / 100) * totalRewards)
    })
    console.log(userRewardsDistributionMap);

    return userRewardsDistributionMap;
}

// Removes duplicate and calculates balances
// function consolidate(data: DataPart, block: number) {
//     const [users, pools, totalAllocPoint] = [data.users, data.pools, data.info.totalAllocPoint];
//
//     // May run multiple times for one address if it's in multiple pools
//     const consolidated: UsersConsolidated = users.map(user => {
//         const userPools = users
//             .filter(u => user.address === u.address)
//
//         const pending = userPools.reduce((a, b) => {
//             return a + pendingBone(block, totalAllocPoint, pools, b)
//         }, 0)
//
//         const harvested = userPools.reduce((a, b) => a + b.boneHarvested, 0);
//
//         return ({
//             address: user.address,
//             amount: pending + harvested
//         });
//     });
//
//     // Removes duplicates
//     return consolidated
//         .filter((v,i,a) => a.findIndex(t => (t.address === v.address)) === i);
// }

// function finalize(usersBeginning: UsersConsolidated, usersEnd: UsersConsolidated, totalVested: number, claims: Claims) {
//     const users = usersEnd.map(userEnd => {
//         return ({
//             address: userEnd.address,
//             amount: userEnd.amount - (usersBeginning.find(usersBeginning => usersBeginning.address === userEnd.address)?.amount ?? 0)
//         })
//     });
//
//     const totalFarmed = users.reduce((a, b) => a + b.amount, 0);
//
//     const fraction = totalVested / totalFarmed;
//
//     return {
//         users: users
//             .filter(user => user.amount >= 1e-18)
//             .filter(user => !blacklist.includes(user.address))
//             .map(user => {
//                 const vested = user.amount * fraction;
//
//                 const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;
//
//                 return ({
//                     address: user.address,
//                     vested: BigInt(Math.floor((vested - claimed) * 1e18))
//                 })
//             })
//             .filter(user => user.vested >= BigInt(0))
//             .map(user => ({[user.address]: String(user.vested)}))
//             .reduce((a, b) => ({...a, ...b}), {}),
//
//         blacklisted: users
//             .filter(user => user.amount >= 1e-18)
//             .filter(user => blacklist.includes(user.address))
//             .map(user => {
//                 const vested = user.amount * fraction;
//
//                 const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;
//
//                 return ({
//                     address: user.address,
//                     vested: BigInt(Math.floor((vested - claimed) * 1e18))
//                 })
//             })
//             .filter(user => user.vested >= BigInt(0))
//             .map(user => ({[user.address]: String(user.vested)}))
//             .reduce((a, b) => ({...a, ...b}), {}),
//     }
// }

// function calculateTotalVested(data: Data, options: Options) {
//     const [startBlock, endBlock] = [options.startBlock, options.endBlock];
//
//     const vestedStart = data.beginning.users
//         .filter(user => user.poolId === VESTING_POOL_ID)
//         .map(user => {
//             const pending = pendingBone(startBlock!, data.beginning.info.totalAllocPoint, data.beginning.pools, user);
//             const harvested = user.boneHarvested;
//             return pending + harvested;
//         })
//         .reduce((a, b) => a + b, 0);
//
//     const vestedEnd = data.end.users
//         .filter(user => user.poolId === VESTING_POOL_ID)
//         .map(user => {
//             const pending = pendingBone(endBlock, data.end.info.totalAllocPoint, data.end.pools, user);
//             const harvested = user.boneHarvested;
//             return pending + harvested;
//         })
//         .reduce((a, b) => a + b, 0);
//
//     return vestedEnd - vestedStart;
// }

// Re-implementation of the pendingBone function from Masterchef
// function pendingBone(block: number, totalAllocPoint: number, pools: Pools, user: User) {
//     let poolId = user.poolId;
//     let pool = pools.filter((entry) => entry.id === poolId ? true : false)[0]; // There's only going to be one
//
//     let accBonePerShare = pool.accBonePerShare;
//     if(block > pool.lastRewardBlock && pool.sslpBalance !== 0) {
//         let multiplier = block - pool.lastRewardBlock;
//         console.log("************************")
//         console.log(multiplier, pool.allocPoint, totalAllocPoint);
//         let boneReward = BigInt(Math.floor(multiplier * 100 * 1e18 * pool.allocPoint / totalAllocPoint));
//         accBonePerShare = accBonePerShare + boneReward * BigInt(1e12) / BigInt(Math.floor(pool.sslpBalance * 1e18));
//     }
//
//     return Number(
//         (BigInt(user.amount) * accBonePerShare - user.rewardDebt * BigInt(1e12)) / BigInt(1e12)
//     ) / 1e18;
// }