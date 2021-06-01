import shibaSwapData from '@shibaswap/shibaswap-data-snoop'

type Claims = shibaSwapData.vesting.User[];

type BuryShibs = shibaSwapData.buryshib.BuryShibs;

export default {
    async buryShibVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryshibBoneVesting.users({block: block_number})
    },
    async buryShibUsers(block_number: number): Promise<BuryShibs[]> {
        return await shibaSwapData.buryshib.buryShibUsers({block: block_number});
    }
}
