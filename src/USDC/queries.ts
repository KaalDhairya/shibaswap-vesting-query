import shibaSwapData from '@shibaswap/shibaswap-data-snoop'

type Claims = any[];

export default {
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.swapUSDCRewardsVesting.users({block: block_number})
    }
}