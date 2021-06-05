import shibaSwapData from '@shibaswap/shibaswap-data-snoop'
import { BuryLeashs, buryLeashUsers } from '@shibaswap/shibaswap-data-snoop/typings/buryleash';

type Claims = shibaSwapData.vesting.User[];

export default {
    async buryShibVestingClaims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },
    async buryLeashUsers(block_number: number): Promise<BuryLeashs[]> {
        return await shibaSwapData.buryleash.buryLeashUsers({block: block_number});
    },
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.buryleashBoneVesting.users({block: block_number})
    },
}
