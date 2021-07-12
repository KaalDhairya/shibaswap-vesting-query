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
        return await shibaSwapData.topdog.rewardPools({block: block_number})
    },
}
