import shibaSwapData from '@shibaswap/shibaswap-data-snoop'

type Info = shibaSwapData.bar.Info;

// type Pools = shibaSwapData.bar.Pool[];

type Claims = shibaSwapData.vesting.User[];

type Users = shibaSwapData.bar.User[];

export default {
    async info(block_number: number): Promise<Info> {   
        return await shibaSwapData.bar.info({block: block_number});
    },

    // async pools(block_number: number): Promise<Pools> {
    //     return await shibaSwapData.bar.pools({block: block_number});
    // },
    
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.vesting.users({block: block_number})
    },

    async users(block_number: number): Promise<Users> {
        return await shibaSwapData.bar.users({block: block_number});
    }
}
