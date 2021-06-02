import shibaSwapData from '@shibaswap/shibaswap-data-snoop'

type Info = shibaSwapData.topdog.Info;

type Pools = shibaSwapData.topdog.Pool[];

type Claims = shibaSwapData.vesting.User[];

type Users = shibaSwapData.topdog.User[];

export default {
    async info(block_number: number): Promise<Info> {   
        return await shibaSwapData.topdog.info({block: block_number});
    },

    async pools(block_number: number): Promise<Pools> {
        return await shibaSwapData.topdog.pools({block: block_number});
    },
    
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.swapWBTCRewardsVesting.users({block: block_number})
    },

    async users(block_number: number): Promise<Users> {
        return await shibaSwapData.topdog.users({block: block_number});
    }
}
