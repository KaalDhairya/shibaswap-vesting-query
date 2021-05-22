import sushiData from '@sushiswap/sushi-data'
import shibaSwapData from '@shibaswap/shibaswap-data'


// type Info = sushiData.masterchef.Info;
type Info = shibaSwapData.topdog.Info;

// type Pools = sushiData.masterchef.Pool[];
type Pools = shibaSwapData.topdog.Pool[];

// type Claims = sushiData.vesting.User[];
type Claims = shibaSwapData.vesting.User[];

// type Users = sushiData.masterchef.User[];
type Users = shibaSwapData.topdog.User[];

export default {
    async info(block_number: number): Promise<Info> {   
        return await shibaSwapData.topdog.info({block: block_number});
    },

    async pools(block_number: number): Promise<Pools> {
        return await shibaSwapData.topdog.pools({block: block_number});
    },
    
    async claims(block_number?: number): Promise<Claims> {
        return await shibaSwapData.vesting.users({block: block_number})
    },

    async users(block_number: number): Promise<Users> {
        return await shibaSwapData.topDog.users({block: block_number});
    }
}
