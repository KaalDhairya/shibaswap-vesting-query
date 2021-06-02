import shibaSwapData from '@shibaswap/shibaswap-data-snoop';
declare type Info = shibaSwapData.topdog.Info;
declare type Pools = shibaSwapData.topdog.Pool[];
declare type Claims = shibaSwapData.vesting.User[];
declare type Users = shibaSwapData.topdog.User[];
declare const _default: {
    info(block_number: number): Promise<Info>;
    pools(block_number: number): Promise<Pools>;
    claims(block_number?: number | undefined): Promise<Claims>;
    users(block_number: number): Promise<Users>;
};
export default _default;
