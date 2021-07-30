import shibaSwapData from '@shibaswap/shibaswap-data-snoop';

type Info = shibaSwapData.topdog.Info;

type Pools = shibaSwapData.topdog.Pool[];

// type Claims = shibaSwapData.vesting.User[];

type User = shibaSwapData.topdog.User;

type UsersConsolidated = {
    address: string,
    amount: number
}[];

export type Options = {
    startBlock: number,
    endBlock: number,
    claimBlock?: number,
    overwrite: boolean,
    prod: boolean 
};


// type DataPart = {
//     info: Info,
//     pools: Pools,
//     users: User[],
//     claims: Claims
// };

// type Data = {
//     beginning: DataPart,
//     end: DataPart
// };
