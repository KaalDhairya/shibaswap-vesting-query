import shibaSwapData from '@shibaswap/shibaswap-data-snoop'
import { BuryBones } from '@shibaswap/shibaswap-data-snoop/typings/burybone';

type Claims = shibaSwapData.vesting.User[];

export default {
    async buryBoneVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryboneBoneVesting.users({block: block_number})
    },
    async buryBoneUsers(block_number: number): Promise<BuryBones[]> {
        return await shibaSwapData.burybone.buryBoneUsers({block: block_number});
    },
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryboneBoneVesting.users({block: block_number})
    },
}
