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

    let blocks:number[] = [25288382, 25288387, 25288756, 25288768, 25288891, 25288893, 25288895, 25288896, 25288898, 25289114, 25289243, 25289305, 25289389, 25289390, 25289391, 25289392, 25289394, 25289409, 25289410, 25289523, 25289728, 25289758, 25289759, 25289916, 25290096, 25290159, 25290194, 25290681, 25290685, 25290696, 25290829, 25290952, 25290958, 25291039, 25291115, 25291224, 25291266, 25291269, 
        25291403, 25291494, 25291510, 25291517, 25291537, 25291701, 25291842, 25291846, 25291892, 25291924, 25292111, 25292113, 25292115, 25292401, 25292612, 25292642, 25292656, 25292704, 25292716, 25292718, 25292721, 25292766, 25292777, 25292781, 25292784, 25292786, 25292831, 25292832, 25292833, 25292834, 25292836, 25292848, 25292859, 25292860, 25292862, 25293073, 25293075, 25293076, 25293077, 25293357, 
        25293363, 25293365, 25293384, 25293385, 25293510, 25293600, 25293941, 25293942, 25293943, 25294140, 25294142, 25294144, 25294150, 25294216, 25294224, 25294225, 25294226, 25294226, 25294334, 25294335, 25294337, 25294376, 25295514, 25299876, 25299997, 25300703, 25300706, 25301445, 25302747, 25305436, 25305707, 25305714, 25305772, 25306219, 25306342, 25306580, 25306582, 25306586, 25306738, 25306747, 
        25306757, 25306762, 25306763, 25306776, 25306953, 25306966, 25307035, 25307083, 25307084, 25307085, 25307143, 25307182, 25307191, 25307193, 25307197, 25307562, 25307783, 25307792, 25307885, 25308053, 25308262, 25308272, 25308302, 25308323, 25308324, 25308328, 25308414, 25308416, 25308475, 25308486, 25308565, 25309390, 25309391, 25309392, 25309444, 25309492, 25309517, 25309543, 25311759, 25311765, 
        25311777, 25311778, 25311886, 25311886, 25311887, 25311888, 25311899, 25311900, 25311901, 25311905, 25311906, 25312129, 25312131, 25312132, 25312145, 25312268, 25312410, 25312411, 25312412, 25312454, 25312456, 25312463, 25312464, 25312491, 25312492, 25312495, 25312570, 25312571, 25312572, 25312594, 25312594, 25312595, 25312600, 25312772, 25312773, 25312773, 25313217, 25313219, 25313223, 25313234, 
        25313264, 25313270, 25313384, 25313388, 25313458, 25313459, 25313533, 25313534, 25313535, 25313551, 25313552, 25313554, 25313630, 25313631, 25313632, 25313782, 25313788, 25313802, 25313803, 25313807, 25313910, 25313912, 25314004, 25314005, 25314006, 25314061, 25314062, 25314067, 25314560, 25314561, 25314562, 25314732, 25314734, 25314735, 25315255, 25315259, 25315261, 25315262, 25316997, 25321184, 
        25321185, 25321186, 25321355, 25321358, 25321362, 25321363, 25321365, 25321390, 25321481, 25324817, 25325258, 25325293, 25325295, 25325343, 25325455, 25325462, 25326032, 25326034, 25326035, 25326991, 25326996, 25327002, 25327106, 25327548, 25327549, 25327557, 25327558, 25327559, 25327560, 25327914, 25328418, 25328420, 25328424, 25329842, 25329842, 25332679, 25340582, 25345786, 25345794, 25345799, 
        25346346, 25346361, 25347942, 25348786, 25349694, 25359618, 25371938, 25371939, 25371940, 25376120, 25386276, 25386277, 25386278, 25386403, 25386404, 25386406, 25388060, 25388061, 25388066, 25388192]
    let usersA = new Map()
    let cumSSLP = 0
    const POOL = 1;
    const REWARD_AMOUNT = 100000;
    const INPUT_DECIMAL = 1e18;
    const OUTPUT_DECIMAL = 1e18;

    const data = await Promise.mapSeries(blocks, (block) => fetchData(block))
    const blockWithSSLP = data.reduce((num, curr)=>{
        return num + !!(curr?.pools && curr.pools[POOL]?.sslpBalance)
    },0)
    console.log(blockWithSSLP)
    const rewardPerBlock = REWARD_AMOUNT/blockWithSSLP;

    data?.forEach((blockData)=>{
        const newUsers = blockData.users.filter(u=>u.poolId == POOL);
        newUsers.forEach(user => {
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

    console.log(usersA)
    // console.log(cumSSLP)

    let users:any[] = []
    for(var address of usersA.keys()){
        users.push({
            address: address,
            amount: Number(((usersA.get(address))/INPUT_DECIMAL))
        })
    }

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