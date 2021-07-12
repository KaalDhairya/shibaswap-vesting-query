import shibaSwapData from '@shibaswap/shibaswap-data-snoop'

type Info = shibaSwapData.topdog.Info;

type Pools = shibaSwapData.topdog.Pool[];

type Users = shibaSwapData.topdog.User[];

type BuryShibs = shibaSwapData.buryshib.BuryShibs;

type BuryLeashs = shibaSwapData.buryleash.BuryLeashs;

type BuryBones = shibaSwapData.burybone.BuryBones;

type Claims = any[]

export default {
    async info(block_number: number): Promise<Info> {   
        return await shibaSwapData.topdog.info({block: block_number});
    },

    async pools(block_number: number): Promise<Pools> {
        return await shibaSwapData.topdog.pools({block: block_number});
    },

    async users(block_number: number): Promise<Users> {
        return await shibaSwapData.topdog.users({block: block_number});
    },

    async buryShibVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryshibWETHVesting.users({block: block_number})
    },

    async buryShibUsers(block_number: number): Promise<BuryShibs[]> {
        return await shibaSwapData.buryshib.buryShibUsers({block: block_number});
    },

    async buryLeashVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },

    async buryLeashUsers(block_number: number): Promise<BuryLeashs[]> {
        return await shibaSwapData.buryleash.buryLeashUsers({block: block_number});
    },

    async buryBoneVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },

    async buryBoneUsers(block_number: number): Promise<BuryBones[]> {
        return await shibaSwapData.burybone.buryBoneUsers({block: block_number});
    },
}
