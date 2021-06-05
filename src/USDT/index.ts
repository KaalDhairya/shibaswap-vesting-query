import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
import { parseBalanceMap } from '../parse-balance-map'

import queries from './queries';

import { VESTING_POOL_ID, VESTING_START } from "../constants";
import redirects from '../redirects.json';
import blacklist from './blacklist.json';
import {Promise} from "bluebird"

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
        merkle: parseBalanceMap(final.users)
    };
}

// async function fetchData(startBlock: number, endBlock: number, claimBlock: number) {
//     const [
//         infoBeginning, infoEnd,
//         poolsBeginning, poolsEnd,
//         usersBeginning, usersEnd,
//         claimed
//     ] = await Promise.all([
//         queries.info(startBlock), queries.info(endBlock),
//         queries.pools(startBlock), queries.pools(endBlock),
//         queries.users(startBlock), queries.users(endBlock),
//         queries.claims(claimBlock)
//     ]);
//     console.log("###################################################");
//     console.log(infoBeginning, infoEnd, poolsBeginning, poolsEnd, usersBeginning, usersEnd, claimed);

//     return ({
//         beginning: {
//             info: infoBeginning,
//             pools: poolsBeginning,
//             users: usersBeginning,
//             claims: []
//         },

//         end: {
//             info: infoEnd,
//             pools: poolsEnd,
//             users: usersEnd,
//             claims: claimed
//         }
//     });
// }

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

// Redirects addresses
function redirect(data: Data) {
    data.beginning.users.forEach(user => {
        user.address = redirects.find(redirect => user.address === redirect.from)?.to ?? user.address;
    });
    data.end.users.forEach(user => {
        user.address = redirects.find(redirect => user.address === redirect.from)?.to ?? user.address;
    });
    return data;
}

// Removes duplicate and calculates balances
// function consolidate(data: DataPart, block: number) {
//     const [users, pools, totalAllocPoint] = [data.users, data.pools, data.info.totalAllocPoint];

//     // May run multiple times for one address if it's in multiple pools
//     const consolidated: UsersConsolidated = users.map(user => {
//         const userPools = users
//             .filter(u => user.address === u.address)
//             .filter(u => u.poolId !== VESTING_POOL_ID)

//         const pending = userPools.reduce((a, b) => {
//             return a + pendingBone(block, totalAllocPoint, pools, b)
//         }, 0)

//         const harvested = userPools.reduce((a, b) => a + b.boneHarvested, 0);

//         return ({
//             address: user.address,
//             amount: pending + harvested
//         });
//     });

//     // Removes duplicates
//     return consolidated
//         .filter((v,i,a) => a.findIndex(t => (t.address === v.address)) === i);
// }

function consolidate(data: DataPart, block: number) {
    const [users, pools, totalAllocPoint] = [data.users, data.pools, data.info.totalAllocPoint];

    const newUsers = users.filter(u=>u.poolId == VESTING_POOL_ID);
    // May run multiple times for one address if it's in multiple pools
    const consolidated: UsersConsolidated = newUsers.map(user => {
        console.log("::USER:: ", user);
        const newAmount = Number((user.amount * 1000)/pools[1].sslpBalance); 
        return ({
            address: user.address,
            amount: newAmount
        });
    });
    console.log("consolidated: ", consolidated);
    return consolidated
        .filter((v,i,a) => a.findIndex(t => (t.address === v.address)) === i);
}

async function finalize(startBlock: number, endBlock: number, claimBlock: number) {
    // console.log("usersBeginning", usersBeginning);
    // console.log("usersEnd", usersEnd);
    // console.log("totalVested", totalVested);
    // console.log("claims", claims);

    let blocks:number[] = [25103031, 25103054, 25103227, 25103229, 25103332, 25103373, 25103415, 25104708, 25104753, 25104762, 25104772, 25104773, 25104775, 25104784, 25110913, 25110944, 25110957, 25110970, 25111358, 25111364, 25111536, 25111560, 25111582, 25111716, 
        25111719, 25115436, 25115442, 25115484, 25116501, 25116503, 25116515, 25116566, 25127993, 25127994, 25129039, 25129042, 25129060, 25129061, 25129076, 25129078, 25129079, 25156792, 25156793, 25170149,
        25170152, 25170166, 25170169, 25182627, 25182630, 25182801, 25182807, 25182812, 25182834, 25182840, 25182866, 25182868, 25182891, 25182917, 25183029, 25183039, 25183213, 25183250, 25183278, 25184238, 25184546, 25184547, 25184548, 25192486, 25192489, 25205200]
    let usersA = new Map()
    let cumSSLP = 0
    const POOL = 0;
    const REWARD_AMOUNT = 9000;

    // blocks.forEach(blockNumber=>{
    //      promises.push(fetchData(blockNumber))
    // })
    // const data: any[] = await Promise.all(promises);
    const data = await Promise.mapSeries(blocks, (block) => fetchData(block))
    // console.log(data)
    data?.forEach((blockData)=>{
        const newUsers = blockData.users.filter(u=>u.poolId == POOL);
        newUsers.forEach(user => {
            if(usersA.has(user.address)) {
                usersA.set(user.address, usersA.get(user.address) + user.amount)
            } else {
                usersA.set(user.address, user.amount)
            }
        });
        cumSSLP+= blockData.pools[POOL]?.sslpBalance??0;
    })

    console.log(usersA)
    console.log(cumSSLP)

    let users:any[] = []
    for(var address of usersA.keys()){
        users.push({
            address: address,
            amount: Number(((usersA.get(address)*REWARD_AMOUNT)/cumSSLP)/1e18)
        })
    }
    console.log(users)

    const claims = await queries.claims(claimBlock);
    console.log(claims)

    return {
        users: users
            .filter(user => user.amount >= 1e-18)
            .filter(user => !blacklist.includes(user.address))
            .map(user => {
                // const vested = user.amount * fraction;

                const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

                return ({
                    address: user.address,
                    vested: BigInt(Math.floor((user.amount - claimed) * 1e18))
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

                // const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

                return ({
                    address: user.address,
                    vested: BigInt(((user.amount)))
                })
            })
            .filter(user => user.vested > BigInt(0))
            .map(user => ({[user.address]: String(user.vested)}))
            .reduce((a, b) => ({...a, ...b}), {}),
    }
}


// function finalize(usersBeginning: UsersConsolidated, usersEnd: UsersConsolidated, totalVested: number, claims: Claims) {
//     const users = usersEnd.map(userEnd => {
//         return ({
//             address: userEnd.address,
//             amount: userEnd.amount - (usersBeginning.find(usersBeginning => usersBeginning.address === userEnd.address)?.amount ?? 0)
//         })
//     });

//     const totalFarmed = users.reduce((a, b) => a + b.amount, 0);

//     const fraction = totalVested / totalFarmed;

//     console.log(
//         "totalFarmed: ", totalFarmed,
//         "\ntotalVested: ", totalVested,
//         "\nfraction: ", fraction
//     )

//     return {
//         users: users
//             .filter(user => user.amount >= 1e-18)
//             .filter(user => !blacklist.includes(user.address))
//             .map(user => {
//                 const vested = user.amount * fraction;

//                 const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

//                 return ({
//                     address: user.address,
//                     vested: BigInt(Math.floor((vested - claimed) * 1e18))
//                 })
//             })
//             .filter(user => user.vested >= BigInt(0))
//             .map(user => ({[user.address]: String(user.vested)}))
//             .reduce((a, b) => ({...a, ...b}), {}),

//         blacklisted: users
//             .filter(user => user.amount >= 1e-18)
//             .filter(user => blacklist.includes(user.address))
//             .map(user => {
//                 const vested = user.amount * fraction;

//                 const claimed = claims.find(u => user.address === u.id)?.totalClaimed ?? 0;

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

function calculateTotalVested(data: Data, options: Options) {
    const [startBlock, endBlock] = [options.startBlock, options.endBlock];

    const vestedStart = data.beginning.users
        .filter(user => user.poolId === VESTING_POOL_ID)
        .map(user => {
            const pending = pendingBone(startBlock!, data.beginning.info.totalAllocPoint, data.beginning.pools, user);
            const harvested = user.boneHarvested;
            return pending + harvested;
        })
        .reduce((a, b) => a + b, 0);

    const vestedEnd = data.end.users
        .filter(user => user.poolId === VESTING_POOL_ID)
        .map(user => {
            const pending = pendingBone(endBlock, data.end.info.totalAllocPoint, data.end.pools, user);
            const harvested = user.boneHarvested;
            return pending + harvested;
        })
        .reduce((a, b) => a + b, 0);

    return vestedEnd - vestedStart;
}

// Re-implementation of the pendingBone function from Masterchef
function pendingBone(block: number, totalAllocPoint: number, pools: Pools, user: User) {
    let poolId = user.poolId;
    let pool = pools.filter((entry) => entry.id === poolId ? true : false)[0]; // There's only going to be one

    let accBonePerShare = pool.accBonePerShare;
    if(block > pool.lastRewardBlock && pool.sslpBalance !== 0) {
        let multiplier = block - pool.lastRewardBlock;
        console.log("************************")
        console.log(multiplier, pool.allocPoint, totalAllocPoint);
        let boneReward = BigInt(Math.floor(multiplier * 100 * 1e18 * pool.allocPoint / totalAllocPoint));
        accBonePerShare = accBonePerShare + boneReward * BigInt(1e12) / BigInt(Math.floor(pool.sslpBalance * 1e18));
    }

    return Number(
        (BigInt(user.amount) * accBonePerShare - user.rewardDebt * BigInt(1e12)) / BigInt(1e12)
    ) / 1e18;
}