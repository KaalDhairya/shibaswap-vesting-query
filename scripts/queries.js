const shibaSwapData = require('@shibaswap/shibaswap-data-snoop')
// const { BuryLeashs, buryLeashUsers } = require('@shibaswap/shibaswap-data-snoop/typings/buryleash');

// type Claims = shibaSwapData.vesting.User[];

module.exports = {
    async buryShibVestingClaims(block_number) {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },
    async buryLeashUsers(block_number) {
        return await shibaSwapData.buryleash.buryLeashUsers({block: block_number});
    },
    async claims(block_number) {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },
    async buryBoneVestingClaims(block_number) {
        return await shibaSwapData.buryboneBoneVesting.users({block: block_number})
    },
    async buryBoneUsers(block_number) {
        return await shibaSwapData.burybone.buryBoneUsers({block: block_number});
    },
    async claims(block_number) {
        return await shibaSwapData.buryboneBoneVesting.users({block: block_number})
    },
    async buryShibVestingClaims(block_number) {
        return await shibaSwapData.buryshibBoneVesting.users({block: block_number})
    },
    async buryShibUsers(block_number) {
        return await shibaSwapData.buryshib.buryShibUsers({block: block_number});
    },
    async claims(block_number) {
        return await shibaSwapData.buryshibBoneVesting.users({block: block_number})
    },
    async topDogUsers(block_number) {
        return await shibaSwapData.topdog.users({block: block_number})
    },
    async topDogPools(block_number) {
        return await shibaSwapData.topdog.pools({block: block_number})
    },
    async topDogRewardPools(block_number, last_id, pool_id) {
        return await shibaSwapData.topdog.rewardPool({block: block_number, last_id: last_id, pool_id: pool_id})
    },
    async buryShibRewardsUsers(block_number, last_id) {
        return await shibaSwapData.buryshib.buryShibUserRewards({block: block_number, last_id: last_id});
    },
    async buryLeashRewardsUsers(block_number, last_id) {
        return await shibaSwapData.buryleash.buryLeashUserRewards({block: block_number, last_id: last_id});
    },
    async buryBoneRewardsUsers(block_number,last_id) {
        return await shibaSwapData.burybone.buryBoneUserRewards({block: block_number, last_id: last_id});
    },
}
