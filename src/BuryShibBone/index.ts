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

// async function fetchData(blockNumber: number) {
//     const pools = await queries.pools(blockNumber);
//     const users = await queries.users(blockNumber);
//     console.log("###################################################");
//     // console.log(infoBeginning, infoEnd, poolsBeginning, poolsEnd, usersBeginning, usersEnd, claimed);

//     return ({
//             pools: pools,
//             users: users
//     });
// }

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
    let blocks:number[] = [25290297, 25290870, 25290949, 25291142, 25291170, 25292815, 25292961, 25293028, 25293029, 25293029, 25293490, 25293491, 25294055, 25294474, 25294700, 25296876, 25302906, 25302911, 25302914, 25305927, 25305935, 25307036, 25307118, 25307131, 25307185, 25307195, 25307217, 
        25307294, 25307307, 25307316, 25307368, 25307398, 25307410, 25307417, 25307443, 25307471, 25307734, 25307747, 25308388, 25311916, 25313303, 25313527, 25313706, 25313760, 25313769, 25313813, 25314243, 25322128, 25322130, 25322132, 25322134, 25322140, 25322146, 25322147, 25322148, 25322149, 25322150, 25322151, 
        25322157, 25322158, 25322159, 25322161, 25322162, 25322163, 25322166, 25322168, 25322169, 25322170, 25322173, 25322174, 25322175, 25322176, 25322178, 25322180, 25322181, 25322183, 25322287, 25322307, 25322314, 25322315, 25322316, 25322324, 25325310, 25325960, 25329365, 25346408, 25386424]
    const POOL = 0;
    const REWARD_AMOUNT = 1250000;
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
                // console.log(userAddress, eachBuryUserInABlock.xShib, totalSupplyAtBlock, userReward)
                if(usersA.has(userAddress)) {
                    usersA.set(userAddress, usersA.get(userAddress) + userReward)
                } else {
                    usersA.set(userAddress, userReward)
                }
            })
            // cumSupply += Number(eachBuryInABlock.totalSupply);
        })

    })

    console.log(usersA)
    // console.log(cumSupply)

    let users:any[] = []
    for(var address of usersA.keys()){
        users.push({
            address: address,
            amount: Number(usersA.get(address))
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