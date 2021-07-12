let cron = require('node-cron');
let axios = require('axios');
const queries = require('./queries');
const config = require('./config.json');

const mongoose = require('mongoose');
const { off } = require('process');
const rewardsCollection = mongoose.model('rewardsCollection');

async function fetchAndStore(blockResult) {
    try{

    let usersA = new Map()
    const POOL = 0;
    const NORMALIZE_CONSTANT = 1000000000000;
    // const data = await queries.topDogPools(blockResult); //quering TopDog subgraph for this block
    console.log("For: ",blockResult)//," queryRess: ", data[0]);
    // console.log("users: ", data);

    const data = [
            {
              "id": "1",
              "sslpBalance": "14529.883831097258355998",
              "users": [
                {
                  "address": "0x000c61cb7c8154e1d0725305a7ee82b0045b8a81",
                  "amount": "128629211443019147",
                  "id": "1-0x000c61cb7c8154e1d0725305a7ee82b0045b8a81"
                },
                {
                  "address": "0x001bf4a405571e242c82c642066492037c0e18ce",
                  "amount": "11333773466798065",
                  "id": "1-0x001bf4a405571e242c82c642066492037c0e18ce"
                },
                {
                  "address": "0x003bf900bb317c78a9139a0a7d84186864994107",
                  "amount": "4469629874714436",
                  "id": "1-0x003bf900bb317c78a9139a0a7d84186864994107"
                },
                {
                  "address": "0x004449e3c8fa8820fa69f74786f6f92791ba40ee",
                  "amount": "275878739488068982",
                  "id": "1-0x004449e3c8fa8820fa69f74786f6f92791ba40ee"
                },
                {
                  "address": "0x004972015974adc0f3dd2b9ead330517130942ed",
                  "amount": "216799633821605777",
                  "id": "1-0x004972015974adc0f3dd2b9ead330517130942ed"
                },
                {
                  "address": "0x004dec538105ea7308df506ec6fd2b0f262bec0a",
                  "amount": "60484541363261204",
                  "id": "1-0x004dec538105ea7308df506ec6fd2b0f262bec0a"
                },
                {
                  "address": "0x0066a11110c09ba83f2b19ad7e9d2ef2a4008294",
                  "amount": "2996305078074859611",
                  "id": "1-0x0066a11110c09ba83f2b19ad7e9d2ef2a4008294"
                },
                {
                  "address": "0x008ebb689f606869d820f0848dee4ca03297e5de",
                  "amount": "14235454172157094",
                  "id": "1-0x008ebb689f606869d820f0848dee4ca03297e5de"
                },
                {
                  "address": "0x0095e7f04e88a35ec8a23e01469549f346b9ae8b",
                  "amount": "1230678707514094196",
                  "id": "1-0x0095e7f04e88a35ec8a23e01469549f346b9ae8b"
                },
                {
                  "address": "0x009f6ad312ef64031ef54c7be989df5ad7c0f762",
                  "amount": "69635941091436787",
                  "id": "1-0x009f6ad312ef64031ef54c7be989df5ad7c0f762"
                },
                {
                  "address": "0x00a64509329f15cb6dc2a32d5217a461c0dcf8c7",
                  "amount": "2655681383252176",
                  "id": "1-0x00a64509329f15cb6dc2a32d5217a461c0dcf8c7"
                },
                {
                  "address": "0x00a9883a64db41c42195e9919e06f12c04474e01",
                  "amount": "96043982219334816",
                  "id": "1-0x00a9883a64db41c42195e9919e06f12c04474e01"
                },
                {
                  "address": "0x00c239a21867327d811e98f3c6723518f4e219e1",
                  "amount": "2148699304189414665",
                  "id": "1-0x00c239a21867327d811e98f3c6723518f4e219e1"
                },
                {
                  "address": "0x00c556dde642adcb5ba4f37ffeb704e334af6d92",
                  "amount": "14833815829381238",
                  "id": "1-0x00c556dde642adcb5ba4f37ffeb704e334af6d92"
                },
                {
                  "address": "0x00c6ae6054242a41f4d75552b0826bc2b89517f0",
                  "amount": "120920051523109319",
                  "id": "1-0x00c6ae6054242a41f4d75552b0826bc2b89517f0"
                },
                {
                  "address": "0x00c9dbdaec3ad41d36d2ba280f3c90d128d24154",
                  "amount": "321182248817625515",
                  "id": "1-0x00c9dbdaec3ad41d36d2ba280f3c90d128d24154"
                },
                {
                  "address": "0x00cd0cb76119189c6490e0665617a727222e64c6",
                  "amount": "103366841346883288",
                  "id": "1-0x00cd0cb76119189c6490e0665617a727222e64c6"
                },
                {
                  "address": "0x00ce049d0624a087473a4bd5078ac90ad25175e8",
                  "amount": "11120916496333019748",
                  "id": "1-0x00ce049d0624a087473a4bd5078ac90ad25175e8"
                },
                {
                  "address": "0x00debd8dcd38db2187450ad70392d48c6710e455",
                  "amount": "321868698646305250",
                  "id": "1-0x00debd8dcd38db2187450ad70392d48c6710e455"
                },
                {
                  "address": "0x00eedb8711b0a15fbeae7dd2f2a74a12a5d2b9b3",
                  "amount": "510433124149660252",
                  "id": "1-0x00eedb8711b0a15fbeae7dd2f2a74a12a5d2b9b3"
                },
                {
                  "address": "0x012fa05e65df2621188050ce834da7e100e59034",
                  "amount": "1952357477625311034",
                  "id": "1-0x012fa05e65df2621188050ce834da7e100e59034"
                },
                {
                  "address": "0x0130708815c98a0b578f948a2ffd27e9d02d8c19",
                  "amount": "410887336510525689",
                  "id": "1-0x0130708815c98a0b578f948a2ffd27e9d02d8c19"
                },
                {
                  "address": "0x0130e2ffe2efdabc4d1b9ff7dec5f677c2e8c785",
                  "amount": "417604308839478271",
                  "id": "1-0x0130e2ffe2efdabc4d1b9ff7dec5f677c2e8c785"
                },
                {
                  "address": "0x014fc0a376cbc15fff5d8455d308a53778e028e5",
                  "amount": "20548805419062782",
                  "id": "1-0x014fc0a376cbc15fff5d8455d308a53778e028e5"
                },
                {
                  "address": "0x0177a84b802da9a67e53a7397eba4438a2e93be5",
                  "amount": "65799396353547301",
                  "id": "1-0x0177a84b802da9a67e53a7397eba4438a2e93be5"
                },
                {
                  "address": "0x0187e69badaf5aae725167486db93cb319e4bf36",
                  "amount": "1058138184993670303",
                  "id": "1-0x0187e69badaf5aae725167486db93cb319e4bf36"
                },
                {
                  "address": "0x018f4b918a24de93be4e5ffccca4e895fe7a9167",
                  "amount": "1548660082768098234",
                  "id": "1-0x018f4b918a24de93be4e5ffccca4e895fe7a9167"
                },
                {
                  "address": "0x01a16190acaeea33e06b67440d78a2ed02594e90",
                  "amount": "21969385222386073",
                  "id": "1-0x01a16190acaeea33e06b67440d78a2ed02594e90"
                },
                {
                  "address": "0x01af7e9b6985f6d3c2a1feb8ac46fb33c0612090",
                  "amount": "170687069922516041",
                  "id": "1-0x01af7e9b6985f6d3c2a1feb8ac46fb33c0612090"
                },
                {
                  "address": "0x01bd33806ba82645a77d5fd3a0c422d2789df2c7",
                  "amount": "928410310355121824",
                  "id": "1-0x01bd33806ba82645a77d5fd3a0c422d2789df2c7"
                },
                {
                  "address": "0x01ccbace93d83943a416b530b87cfb95e3c9f181",
                  "amount": "44614697447272617",
                  "id": "1-0x01ccbace93d83943a416b530b87cfb95e3c9f181"
                },
                {
                  "address": "0x01f336ee89635aee0bb5268ac8fca2f9fbd21d93",
                  "amount": "1147490941403388941",
                  "id": "1-0x01f336ee89635aee0bb5268ac8fca2f9fbd21d93"
                },
                {
                  "address": "0x01fc7ad6f9eada4a61efc6b566aa78cf6a7839ac",
                  "amount": "124284327575992488",
                  "id": "1-0x01fc7ad6f9eada4a61efc6b566aa78cf6a7839ac"
                },
                {
                  "address": "0x01fdd41f59fbfeaed9f6870e87ad43fd9318457e",
                  "amount": "1248064172000283343",
                  "id": "1-0x01fdd41f59fbfeaed9f6870e87ad43fd9318457e"
                },
                {
                  "address": "0x020bcdbc6f9573bd12f0112121b8131ec1d79996",
                  "amount": "47420326851912859",
                  "id": "1-0x020bcdbc6f9573bd12f0112121b8131ec1d79996"
                },
                {
                  "address": "0x0217f4cfcd73a2729559e62a855058c341b21209",
                  "amount": "67728092917215951",
                  "id": "1-0x0217f4cfcd73a2729559e62a855058c341b21209"
                },
                {
                  "address": "0x022ecad595fc206636ff72277c45410893016a66",
                  "amount": "32003225930683607",
                  "id": "1-0x022ecad595fc206636ff72277c45410893016a66"
                },
                {
                  "address": "0x02327c50a29d5ee73502108e3d23718f91c27a05",
                  "amount": "172062096492454470",
                  "id": "1-0x02327c50a29d5ee73502108e3d23718f91c27a05"
                },
                {
                  "address": "0x02429acf87fbfdf356208e905ee3d1848e55fb3b",
                  "amount": "2019802792850080792",
                  "id": "1-0x02429acf87fbfdf356208e905ee3d1848e55fb3b"
                },
                {
                  "address": "0x024616f5883d0bfc6501ec7cf5c60c7bbb23e7ce",
                  "amount": "457590264952952621",
                  "id": "1-0x024616f5883d0bfc6501ec7cf5c60c7bbb23e7ce"
                },
                {
                  "address": "0x025770f35bc9d93f79d8b36180a1230a5152de18",
                  "amount": "579498808688903570",
                  "id": "1-0x025770f35bc9d93f79d8b36180a1230a5152de18"
                },
                {
                  "address": "0x0258a9547615209d923fb7855d397d661b681d71",
                  "amount": "405518393676262528",
                  "id": "1-0x0258a9547615209d923fb7855d397d661b681d71"
                },
                {
                  "address": "0x0267fd1eebe43de6929d8757bc8723ca4f5cfcef",
                  "amount": "460796191445841495",
                  "id": "1-0x0267fd1eebe43de6929d8757bc8723ca4f5cfcef"
                },
                {
                  "address": "0x0276a66bfd05606faa3810ec69d3f28be2c7e4d3",
                  "amount": "301770364166250107",
                  "id": "1-0x0276a66bfd05606faa3810ec69d3f28be2c7e4d3"
                },
                {
                  "address": "0x027e786c3374f94ce0175319b5bf5ed5f8b455cd",
                  "amount": "58538433758698453",
                  "id": "1-0x027e786c3374f94ce0175319b5bf5ed5f8b455cd"
                },
                {
                  "address": "0x028552de04ccebdd99c0c7c401f77955a615c5ad",
                  "amount": "319332141601271157",
                  "id": "1-0x028552de04ccebdd99c0c7c401f77955a615c5ad"
                },
                {
                  "address": "0x028a6b6774dd40ca2fa3e6d6305c99f6affaf3e4",
                  "amount": "884794966783664",
                  "id": "1-0x028a6b6774dd40ca2fa3e6d6305c99f6affaf3e4"
                },
                {
                  "address": "0x02b13dae4cdd398255fd36397eb0871fd9e05c59",
                  "amount": "233822689666719179",
                  "id": "1-0x02b13dae4cdd398255fd36397eb0871fd9e05c59"
                },
                {
                  "address": "0x02f2e5e9687d7db7a68c9bab0962294baa053cbc",
                  "amount": "418514975131067390",
                  "id": "1-0x02f2e5e9687d7db7a68c9bab0962294baa053cbc"
                },
                {
                  "address": "0x0315201a515cb5c61bc7e49c4e2f5a58861eb2a4",
                  "amount": "1278458973139778499",
                  "id": "1-0x0315201a515cb5c61bc7e49c4e2f5a58861eb2a4"
                },
                {
                  "address": "0x031cb01db3908f1023268530be52d182c742d29e",
                  "amount": "3130335363017915",
                  "id": "1-0x031cb01db3908f1023268530be52d182c742d29e"
                },
                {
                  "address": "0x031f003ae4411a333a454a542422020febee55e0",
                  "amount": "76118906984589523",
                  "id": "1-0x031f003ae4411a333a454a542422020febee55e0"
                },
                {
                  "address": "0x03247c809fdd45cb6fe91eb7e12a106cf709137d",
                  "amount": "125535711541229791",
                  "id": "1-0x03247c809fdd45cb6fe91eb7e12a106cf709137d"
                },
                {
                  "address": "0x033a0b9dcbd3451d7bcb6c39bfc1c452cbb710ae",
                  "amount": "983059572147015324",
                  "id": "1-0x033a0b9dcbd3451d7bcb6c39bfc1c452cbb710ae"
                },
                {
                  "address": "0x034e617d90eba96b47a555d1d9b1bedbff196044",
                  "amount": "112695579481218273",
                  "id": "1-0x034e617d90eba96b47a555d1d9b1bedbff196044"
                },
                {
                  "address": "0x0351e8444c575b076ac80b098a4cfaf42d26aea3",
                  "amount": "155802576479430552",
                  "id": "1-0x0351e8444c575b076ac80b098a4cfaf42d26aea3"
                },
                {
                  "address": "0x0352de60830c6852c3d8ed0fe9cce7ff2cc865b2",
                  "amount": "1814234338010692129",
                  "id": "1-0x0352de60830c6852c3d8ed0fe9cce7ff2cc865b2"
                },
                {
                  "address": "0x036d7361fae049faed06fb4286b554688f52aec1",
                  "amount": "1986509976444880568",
                  "id": "1-0x036d7361fae049faed06fb4286b554688f52aec1"
                },
                {
                  "address": "0x037cdd09bdca6659afc885466aee3955160a6b89",
                  "amount": "63080639016307503",
                  "id": "1-0x037cdd09bdca6659afc885466aee3955160a6b89"
                },
                {
                  "address": "0x037de347e9bfc5c70a7389561701138a1e0b3f86",
                  "amount": "95484255397109915",
                  "id": "1-0x037de347e9bfc5c70a7389561701138a1e0b3f86"
                },
                {
                  "address": "0x038feeb852b2722aa89c11041759ca11483fedf6",
                  "amount": "467340116701762454",
                  "id": "1-0x038feeb852b2722aa89c11041759ca11483fedf6"
                },
                {
                  "address": "0x03aec6f99318107a820ed2d09ea20220c66ea188",
                  "amount": "566915338648264099",
                  "id": "1-0x03aec6f99318107a820ed2d09ea20220c66ea188"
                },
                {
                  "address": "0x03f8694723f0010d56ef907c0b845cf1d2c73124",
                  "amount": "1001863678486341931",
                  "id": "1-0x03f8694723f0010d56ef907c0b845cf1d2c73124"
                },
                {
                  "address": "0x043c623dd692aebe0e357b4e5e4294b3b18f5a69",
                  "amount": "1920359717635504",
                  "id": "1-0x043c623dd692aebe0e357b4e5e4294b3b18f5a69"
                },
                {
                  "address": "0x0445cc882c1a74d050646fe16c09d7b643317ac2",
                  "amount": "202767969739498767",
                  "id": "1-0x0445cc882c1a74d050646fe16c09d7b643317ac2"
                },
                {
                  "address": "0x0446db2e4ddc2a6cbf5c129d8caca3d41a540cd7",
                  "amount": "2933821295943555522",
                  "id": "1-0x0446db2e4ddc2a6cbf5c129d8caca3d41a540cd7"
                },
                {
                  "address": "0x0488b8904a4c7bc56761b5da45bfd290c9b48af0",
                  "amount": "5217636633062654820",
                  "id": "1-0x0488b8904a4c7bc56761b5da45bfd290c9b48af0"
                },
                {
                  "address": "0x04c68d62a2dc0486a737b07ac96b3843e34efb1a",
                  "amount": "1744914845478498963",
                  "id": "1-0x04c68d62a2dc0486a737b07ac96b3843e34efb1a"
                },
                {
                  "address": "0x04cfb73e4a3a64ed221f489b17ccfd442902e075",
                  "amount": "1359028969112706613",
                  "id": "1-0x04cfb73e4a3a64ed221f489b17ccfd442902e075"
                },
                {
                  "address": "0x04d4aeecc64875f6237bd7d69915ada265e83d69",
                  "amount": "108986632004711397",
                  "id": "1-0x04d4aeecc64875f6237bd7d69915ada265e83d69"
                },
                {
                  "address": "0x04d6565ca54e2244d8ca83daa6a8ffdd8bd65c35",
                  "amount": "22341101610359864",
                  "id": "1-0x04d6565ca54e2244d8ca83daa6a8ffdd8bd65c35"
                },
                {
                  "address": "0x04e2110e684d14c95a8da696f0bdbfd11279a417",
                  "amount": "47039133358064991",
                  "id": "1-0x04e2110e684d14c95a8da696f0bdbfd11279a417"
                },
                {
                  "address": "0x04ebe8bb9d021d70751a46f1d8ae732ba1ee6b0a",
                  "amount": "26205217952495363",
                  "id": "1-0x04ebe8bb9d021d70751a46f1d8ae732ba1ee6b0a"
                },
                {
                  "address": "0x04edd4261d178ee5f202afe1475c1738d03112c5",
                  "amount": "1445531311454496834",
                  "id": "1-0x04edd4261d178ee5f202afe1475c1738d03112c5"
                },
                {
                  "address": "0x04ff2fba50235b062fb563fe01e50ef028ba1058",
                  "amount": "41886954509751629",
                  "id": "1-0x04ff2fba50235b062fb563fe01e50ef028ba1058"
                },
                {
                  "address": "0x051149ecc5e1605293764bfb27171d2caae1f92c",
                  "amount": "10766545064053748",
                  "id": "1-0x051149ecc5e1605293764bfb27171d2caae1f92c"
                },
                {
                  "address": "0x05139aba7eabd75af9d4f5cd63ea138aac6e3b2b",
                  "amount": "1062829633292540877",
                  "id": "1-0x05139aba7eabd75af9d4f5cd63ea138aac6e3b2b"
                },
                {
                  "address": "0x05241941d8aea73f4e5cd0fa6821f00f7f3abb87",
                  "amount": "236382784685391896",
                  "id": "1-0x05241941d8aea73f4e5cd0fa6821f00f7f3abb87"
                },
                {
                  "address": "0x05271853224d839a9bc6a342f27821e7fb32b001",
                  "amount": "10750645996947281927",
                  "id": "1-0x05271853224d839a9bc6a342f27821e7fb32b001"
                },
                {
                  "address": "0x053a1cade6e56e2700b33312e78aa06db7fc1e22",
                  "amount": "158403500889879193",
                  "id": "1-0x053a1cade6e56e2700b33312e78aa06db7fc1e22"
                },
                {
                  "address": "0x053dc704f3866e0cdfcb075a55c39fbe7ed12621",
                  "amount": "1490693802550804602",
                  "id": "1-0x053dc704f3866e0cdfcb075a55c39fbe7ed12621"
                },
                {
                  "address": "0x054301aff3a17da8b86bdc233dd687d5198e493e",
                  "amount": "185804735048539282",
                  "id": "1-0x054301aff3a17da8b86bdc233dd687d5198e493e"
                },
                {
                  "address": "0x05434276ab2436fc10fd05b99b96f2756c09cecf",
                  "amount": "978373861947043540",
                  "id": "1-0x05434276ab2436fc10fd05b99b96f2756c09cecf"
                },
                {
                  "address": "0x055f3e30ce9d2e3b17db01fae87b8e6c30f445d3",
                  "amount": "1710547720871086461",
                  "id": "1-0x055f3e30ce9d2e3b17db01fae87b8e6c30f445d3"
                },
                {
                  "address": "0x056bf45a910a1713260448fb35b87109b9b9d80b",
                  "amount": "333948684114626289",
                  "id": "1-0x056bf45a910a1713260448fb35b87109b9b9d80b"
                },
                {
                  "address": "0x058ed7fcc90afbb1fd172ec3d14cb671b3bc8622",
                  "amount": "617126003255639773",
                  "id": "1-0x058ed7fcc90afbb1fd172ec3d14cb671b3bc8622"
                },
                {
                  "address": "0x05cacad2c3f8b5173583172c024eda1c726be1dc",
                  "amount": "4028355716282043",
                  "id": "1-0x05cacad2c3f8b5173583172c024eda1c726be1dc"
                },
                {
                  "address": "0x05ce0e38e71bf8f06065c8e5cb86bce6e89661d4",
                  "amount": "99501927517742782",
                  "id": "1-0x05ce0e38e71bf8f06065c8e5cb86bce6e89661d4"
                },
                {
                  "address": "0x05cea90c4917dce896737c4fde55f3dc5880dd75",
                  "amount": "471788262742199021",
                  "id": "1-0x05cea90c4917dce896737c4fde55f3dc5880dd75"
                },
                {
                  "address": "0x05d77930327dd3334b0f8f327402e1c63a4184d4",
                  "amount": "51019194226765483923",
                  "id": "1-0x05d77930327dd3334b0f8f327402e1c63a4184d4"
                },
                {
                  "address": "0x05df3e49c5f40fdaea75cf7590732cc62526c979",
                  "amount": "15288291926009769",
                  "id": "1-0x05df3e49c5f40fdaea75cf7590732cc62526c979"
                },
                {
                  "address": "0x060528f13052566c79220090a73d9b8c0304e627",
                  "amount": "5483491879724605595",
                  "id": "1-0x060528f13052566c79220090a73d9b8c0304e627"
                },
                {
                  "address": "0x06082bf4348aa23034f76dd37a1dc5f47433528f",
                  "amount": "6662774697053364000",
                  "id": "1-0x06082bf4348aa23034f76dd37a1dc5f47433528f"
                },
                {
                  "address": "0x0622a73fcaae6557fe99f8e3cf2dda61ed0fd76d",
                  "amount": "20087327895075451",
                  "id": "1-0x0622a73fcaae6557fe99f8e3cf2dda61ed0fd76d"
                },
                {
                  "address": "0x064c2dd39e1897a381ddc34978cd4e2ee333feaa",
                  "amount": "10372746413005529",
                  "id": "1-0x064c2dd39e1897a381ddc34978cd4e2ee333feaa"
                },
                {
                  "address": "0x065e2ea6888a87f593081f19e4e0768b4096da8e",
                  "amount": "14234993807693381",
                  "id": "1-0x065e2ea6888a87f593081f19e4e0768b4096da8e"
                },
                {
                  "address": "0x065fbe170e45873718fecd355765cf305361a8c2",
                  "amount": "3113275842861305195",
                  "id": "1-0x065fbe170e45873718fecd355765cf305361a8c2"
                },
                {
                  "address": "0x0665c0c4d8f8511388b6c3cb4ad13459545addf0",
                  "amount": "1788453886743114226",
                  "id": "1-0x0665c0c4d8f8511388b6c3cb4ad13459545addf0"
                },
                {
                  "address": "0x067a50a70fe3155d3d80923da4df53e44880a87e",
                  "amount": "4146223070645964342",
                  "id": "1-0x067a50a70fe3155d3d80923da4df53e44880a87e"
                },
                {
                  "address": "0x068cc6a956e0cbc3745ef4f16de6ca78d545e753",
                  "amount": "441730745607405944",
                  "id": "1-0x068cc6a956e0cbc3745ef4f16de6ca78d545e753"
                }
              ]
            },
            {
              "id": "15",
              "sslpBalance": "352670.534531872745412924",
              "users": [
                {
                  "address": "0x00022740584dc80a44de77149317689617316cc9",
                  "amount": "131559029031109224",
                  "id": "15-0x00022740584dc80a44de77149317689617316cc9"
                },
                {
                  "address": "0x000627e12f109efff8a1d19bebba10599daa5f41",
                  "amount": "145984370322805260",
                  "id": "15-0x000627e12f109efff8a1d19bebba10599daa5f41"
                },
                {
                  "address": "0x00074037959156077965a8dd9d956f313eba3e0e",
                  "amount": "2202289967759358906",
                  "id": "15-0x00074037959156077965a8dd9d956f313eba3e0e"
                },
                {
                  "address": "0x000c61cb7c8154e1d0725305a7ee82b0045b8a81",
                  "amount": "2913795557001424068",
                  "id": "15-0x000c61cb7c8154e1d0725305a7ee82b0045b8a81"
                },
                {
                  "address": "0x00159a8db4db89e7e556cf8ab5681a8724248ba7",
                  "amount": "12410050974977984020",
                  "id": "15-0x00159a8db4db89e7e556cf8ab5681a8724248ba7"
                },
                {
                  "address": "0x00164e07c9d069b80969c1243ae86e141931f48a",
                  "amount": "10722470031857795753",
                  "id": "15-0x00164e07c9d069b80969c1243ae86e141931f48a"
                },
                {
                  "address": "0x001a181ab8c41045e26dd2245ffcc12818ea742f",
                  "amount": "17595444113019269380",
                  "id": "15-0x001a181ab8c41045e26dd2245ffcc12818ea742f"
                },
                {
                  "address": "0x001e5045621f6ecfb1ad1aafaadbeb5bd1317c37",
                  "amount": "8979764826328936013",
                  "id": "15-0x001e5045621f6ecfb1ad1aafaadbeb5bd1317c37"
                },
                {
                  "address": "0x0024800df12f4cdad16b325e9720fbdd50b96fcc",
                  "amount": "33754899360335111",
                  "id": "15-0x0024800df12f4cdad16b325e9720fbdd50b96fcc"
                },
                {
                  "address": "0x0028be83aea26315638e81e28a2fcd3fd378e7db",
                  "amount": "1652814073572390484758",
                  "id": "15-0x0028be83aea26315638e81e28a2fcd3fd378e7db"
                },
                {
                  "address": "0x002bd362713f9c07692eb3007654f83ceb75f70d",
                  "amount": "1202150624872639552",
                  "id": "15-0x002bd362713f9c07692eb3007654f83ceb75f70d"
                },
                {
                  "address": "0x002d2769c38bf304e9c4d6d2b4f830a2ea1b1583",
                  "amount": "2406460212421225213",
                  "id": "15-0x002d2769c38bf304e9c4d6d2b4f830a2ea1b1583"
                },
                {
                  "address": "0x002f0bdd400e23803f7eedf73b2bdfe87f128935",
                  "amount": "958136098322558528",
                  "id": "15-0x002f0bdd400e23803f7eedf73b2bdfe87f128935"
                },
                {
                  "address": "0x003064c272da1a1b3cb880b56ee6a1f22b39867b",
                  "amount": "824238506258023462",
                  "id": "15-0x003064c272da1a1b3cb880b56ee6a1f22b39867b"
                },
                {
                  "address": "0x00310101097364c4c06b185e4e02e412e82a869b",
                  "amount": "2122728697319263802",
                  "id": "15-0x00310101097364c4c06b185e4e02e412e82a869b"
                },
                {
                  "address": "0x00336bbac7f3871d995f76ba8d587d82feecdcec",
                  "amount": "5113010910583319265",
                  "id": "15-0x00336bbac7f3871d995f76ba8d587d82feecdcec"
                },
                {
                  "address": "0x003b0e8bea5a9feb944b37365b05ce752376263a",
                  "amount": "10125042158088139705",
                  "id": "15-0x003b0e8bea5a9feb944b37365b05ce752376263a"
                },
                {
                  "address": "0x003bf900bb317c78a9139a0a7d84186864994107",
                  "amount": "212157477648800357",
                  "id": "15-0x003bf900bb317c78a9139a0a7d84186864994107"
                },
                {
                  "address": "0x003e8ae04428b34b0660c5044d50b5d79e9985d3",
                  "amount": "1288072148577245187",
                  "id": "15-0x003e8ae04428b34b0660c5044d50b5d79e9985d3"
                },
                {
                  "address": "0x00409491bad26482c53f016ce0099e1941292725",
                  "amount": "829038168446163023",
                  "id": "15-0x00409491bad26482c53f016ce0099e1941292725"
                },
                {
                  "address": "0x0040fb8f6b3d98c050f4a9a3cf3414e3d7265dc2",
                  "amount": "5396320684671801660",
                  "id": "15-0x0040fb8f6b3d98c050f4a9a3cf3414e3d7265dc2"
                },
                {
                  "address": "0x0045b3535427b56c28d80d20134f9d3cf5481a39",
                  "amount": "38786926416305044132",
                  "id": "15-0x0045b3535427b56c28d80d20134f9d3cf5481a39"
                },
                {
                  "address": "0x004972015974adc0f3dd2b9ead330517130942ed",
                  "amount": "159473744870521163",
                  "id": "15-0x004972015974adc0f3dd2b9ead330517130942ed"
                },
                {
                  "address": "0x005ca7732adea71dac2e0182fc7d8e39acdfe91e",
                  "amount": "509946634276149824",
                  "id": "15-0x005ca7732adea71dac2e0182fc7d8e39acdfe91e"
                },
                {
                  "address": "0x005f98425e1a2784059e1ea5dff0570f261242ce",
                  "amount": "1357440854477990652",
                  "id": "15-0x005f98425e1a2784059e1ea5dff0570f261242ce"
                },
                {
                  "address": "0x00651b9e2924f1a5b63f6460832ab211e5829190",
                  "amount": "52988622700375352287",
                  "id": "15-0x00651b9e2924f1a5b63f6460832ab211e5829190"
                },
                {
                  "address": "0x0066a11110c09ba83f2b19ad7e9d2ef2a4008294",
                  "amount": "14593160566216586796",
                  "id": "15-0x0066a11110c09ba83f2b19ad7e9d2ef2a4008294"
                },
                {
                  "address": "0x006d5674a3b505d02dc043d46d74760f544bc6b4",
                  "amount": "734532167391643973",
                  "id": "15-0x006d5674a3b505d02dc043d46d74760f544bc6b4"
                },
                {
                  "address": "0x0072203979c4477c6ec4d22c9bdca3891ba3337a",
                  "amount": "2168952085005165669",
                  "id": "15-0x0072203979c4477c6ec4d22c9bdca3891ba3337a"
                },
                {
                  "address": "0x0078348824506f744e323c5420e976374d55524f",
                  "amount": "53167570394347138192",
                  "id": "15-0x0078348824506f744e323c5420e976374d55524f"
                },
                {
                  "address": "0x0078f56683aafd9a98fd76f9f5277dea9069fcf1",
                  "amount": "9321343718230388558",
                  "id": "15-0x0078f56683aafd9a98fd76f9f5277dea9069fcf1"
                },
                {
                  "address": "0x007b74d113d66755bbde7a614f435b33922d77da",
                  "amount": "1193779980580498905",
                  "id": "15-0x007b74d113d66755bbde7a614f435b33922d77da"
                },
                {
                  "address": "0x007ce03bc6690f16066b87262922031b264f9b05",
                  "amount": "280388705912722085",
                  "id": "15-0x007ce03bc6690f16066b87262922031b264f9b05"
                },
                {
                  "address": "0x0083bbd166cbea6a6ec1ac7cfd7a9e791de01b29",
                  "amount": "12118361475734790576",
                  "id": "15-0x0083bbd166cbea6a6ec1ac7cfd7a9e791de01b29"
                },
                {
                  "address": "0x0084fdf36c37d399df7b35fded618ddf70197b3c",
                  "amount": "2072069524462062781",
                  "id": "15-0x0084fdf36c37d399df7b35fded618ddf70197b3c"
                },
                {
                  "address": "0x008ebb689f606869d820f0848dee4ca03297e5de",
                  "amount": "2674393814323350940",
                  "id": "15-0x008ebb689f606869d820f0848dee4ca03297e5de"
                },
                {
                  "address": "0x008ff804dc804eebc419687ddfef4962a0b0f2b2",
                  "amount": "452754121223288074",
                  "id": "15-0x008ff804dc804eebc419687ddfef4962a0b0f2b2"
                },
                {
                  "address": "0x00973fa0f939fc6c2c36149889b3d4ca475c984f",
                  "amount": "276592210017015091",
                  "id": "15-0x00973fa0f939fc6c2c36149889b3d4ca475c984f"
                },
                {
                  "address": "0x009f6ad312ef64031ef54c7be989df5ad7c0f762",
                  "amount": "680576766764474216",
                  "id": "15-0x009f6ad312ef64031ef54c7be989df5ad7c0f762"
                },
                {
                  "address": "0x00a2101dc0aaa80d2545bd2f3cc72a113f7924eb",
                  "amount": "1085750771838332640",
                  "id": "15-0x00a2101dc0aaa80d2545bd2f3cc72a113f7924eb"
                },
                {
                  "address": "0x00a43befe468bb7ffaa93168d70dd8e05fa6f45e",
                  "amount": "70593573694731257",
                  "id": "15-0x00a43befe468bb7ffaa93168d70dd8e05fa6f45e"
                },
                {
                  "address": "0x00a64509329f15cb6dc2a32d5217a461c0dcf8c7",
                  "amount": "3228163574763152642",
                  "id": "15-0x00a64509329f15cb6dc2a32d5217a461c0dcf8c7"
                },
                {
                  "address": "0x00a9883a64db41c42195e9919e06f12c04474e01",
                  "amount": "495320306278818349",
                  "id": "15-0x00a9883a64db41c42195e9919e06f12c04474e01"
                },
                {
                  "address": "0x00c239a21867327d811e98f3c6723518f4e219e1",
                  "amount": "6062834909663906570",
                  "id": "15-0x00c239a21867327d811e98f3c6723518f4e219e1"
                },
                {
                  "address": "0x00c556dde642adcb5ba4f37ffeb704e334af6d92",
                  "amount": "597655148735710191",
                  "id": "15-0x00c556dde642adcb5ba4f37ffeb704e334af6d92"
                },
                {
                  "address": "0x00c570a19c51d5d058fd7a4cee7d99eaa6c5ef6f",
                  "amount": "8854375169924387154",
                  "id": "15-0x00c570a19c51d5d058fd7a4cee7d99eaa6c5ef6f"
                },
                {
                  "address": "0x00c6ae6054242a41f4d75552b0826bc2b89517f0",
                  "amount": "657284735809322164",
                  "id": "15-0x00c6ae6054242a41f4d75552b0826bc2b89517f0"
                },
                {
                  "address": "0x00c9dbdaec3ad41d36d2ba280f3c90d128d24154",
                  "amount": "915717804414098873",
                  "id": "15-0x00c9dbdaec3ad41d36d2ba280f3c90d128d24154"
                },
                {
                  "address": "0x00cd9ab86e09ab5c58587c552ad822d34380de57",
                  "amount": "178582304970584165",
                  "id": "15-0x00cd9ab86e09ab5c58587c552ad822d34380de57"
                },
                {
                  "address": "0x00ce049d0624a087473a4bd5078ac90ad25175e8",
                  "amount": "24000299183306568982",
                  "id": "15-0x00ce049d0624a087473a4bd5078ac90ad25175e8"
                },
                {
                  "address": "0x00cf604d712cfa2128bac3d13187be9996582632",
                  "amount": "471439358891865160",
                  "id": "15-0x00cf604d712cfa2128bac3d13187be9996582632"
                },
                {
                  "address": "0x00db6e3f200aae09bcbfb0256c7e16a54ce5b365",
                  "amount": "239490000000000000",
                  "id": "15-0x00db6e3f200aae09bcbfb0256c7e16a54ce5b365"
                },
                {
                  "address": "0x00dc13fdf618e0f5b8dd33b05bb4f6b9b79e0ff4",
                  "amount": "510187410884732158",
                  "id": "15-0x00dc13fdf618e0f5b8dd33b05bb4f6b9b79e0ff4"
                },
                {
                  "address": "0x00debd8dcd38db2187450ad70392d48c6710e455",
                  "amount": "3143700826337796359",
                  "id": "15-0x00debd8dcd38db2187450ad70392d48c6710e455"
                },
                {
                  "address": "0x00ed71f3422361d4886328af2034fc8107447cd6",
                  "amount": "5141010139209312612",
                  "id": "15-0x00ed71f3422361d4886328af2034fc8107447cd6"
                },
                {
                  "address": "0x00eedb8711b0a15fbeae7dd2f2a74a12a5d2b9b3",
                  "amount": "1571057227869746236",
                  "id": "15-0x00eedb8711b0a15fbeae7dd2f2a74a12a5d2b9b3"
                },
                {
                  "address": "0x00efca2c32f137b6415058f284de9d9a810301ae",
                  "amount": "200554111467419813",
                  "id": "15-0x00efca2c32f137b6415058f284de9d9a810301ae"
                },
                {
                  "address": "0x010198eb54a6dbb249ce533078d4917c4af21946",
                  "amount": "503773254785284856",
                  "id": "15-0x010198eb54a6dbb249ce533078d4917c4af21946"
                },
                {
                  "address": "0x010441b2bd5681ed2b81c491704534a1c806485b",
                  "amount": "4334673235268288933",
                  "id": "15-0x010441b2bd5681ed2b81c491704534a1c806485b"
                },
                {
                  "address": "0x010743d3761169173e958edf63bc159ed88daac1",
                  "amount": "3890663225335778529",
                  "id": "15-0x010743d3761169173e958edf63bc159ed88daac1"
                },
                {
                  "address": "0x010b78b5aaeb371e57551e576bff29e0958bc7b7",
                  "amount": "2769425987468744958",
                  "id": "15-0x010b78b5aaeb371e57551e576bff29e0958bc7b7"
                },
                {
                  "address": "0x01144022672cde0fedd8b1766fa71b2a5ae310ec",
                  "amount": "415550109516540092",
                  "id": "15-0x01144022672cde0fedd8b1766fa71b2a5ae310ec"
                },
                {
                  "address": "0x01263459b5260b11214fc4cf6dc65851306315d1",
                  "amount": "439442645768222613",
                  "id": "15-0x01263459b5260b11214fc4cf6dc65851306315d1"
                },
                {
                  "address": "0x012c5ff7d91bb12c9763dbcece34fa8499dab01c",
                  "amount": "3712065139849971810",
                  "id": "15-0x012c5ff7d91bb12c9763dbcece34fa8499dab01c"
                },
                {
                  "address": "0x012e563faf84b0fb2be88783532c0cd0d2eaa6dc",
                  "amount": "353147344163898359",
                  "id": "15-0x012e563faf84b0fb2be88783532c0cd0d2eaa6dc"
                },
                {
                  "address": "0x012fa05e65df2621188050ce834da7e100e59034",
                  "amount": "60988476186268664285",
                  "id": "15-0x012fa05e65df2621188050ce834da7e100e59034"
                },
                {
                  "address": "0x01301452a58ff1173a6eabe96dd03a5ceaa66745",
                  "amount": "5126443014144092707",
                  "id": "15-0x01301452a58ff1173a6eabe96dd03a5ceaa66745"
                },
                {
                  "address": "0x0130e2ffe2efdabc4d1b9ff7dec5f677c2e8c785",
                  "amount": "73865031087811421217",
                  "id": "15-0x0130e2ffe2efdabc4d1b9ff7dec5f677c2e8c785"
                },
                {
                  "address": "0x013a18f8211d172acc0b0ef7d8cd9e18caaeae33",
                  "amount": "1952841964327199363",
                  "id": "15-0x013a18f8211d172acc0b0ef7d8cd9e18caaeae33"
                },
                {
                  "address": "0x013b02f44572eb3622939ff95b026bfcde32767e",
                  "amount": "24006532995248298941",
                  "id": "15-0x013b02f44572eb3622939ff95b026bfcde32767e"
                },
                {
                  "address": "0x01417e59b64efc0c8727a31f1fbba7c6536307a3",
                  "amount": "4923160432573995236",
                  "id": "15-0x01417e59b64efc0c8727a31f1fbba7c6536307a3"
                },
                {
                  "address": "0x01447b70e26023154de9741c3c4818e303d8546e",
                  "amount": "1327026280945158291",
                  "id": "15-0x01447b70e26023154de9741c3c4818e303d8546e"
                },
                {
                  "address": "0x014b4eceaf0b07fc3a719fb9719f273b92d1be71",
                  "amount": "12983159626311442365",
                  "id": "15-0x014b4eceaf0b07fc3a719fb9719f273b92d1be71"
                },
                {
                  "address": "0x014c62761ee78358aec38432967721df00f4d8b5",
                  "amount": "527929679242714888",
                  "id": "15-0x014c62761ee78358aec38432967721df00f4d8b5"
                },
                {
                  "address": "0x014ed7af1392af8f921c1f3e5e45e83d4f8915f5",
                  "amount": "4837857608819543441",
                  "id": "15-0x014ed7af1392af8f921c1f3e5e45e83d4f8915f5"
                },
                {
                  "address": "0x014fc0a376cbc15fff5d8455d308a53778e028e5",
                  "amount": "2324856657927781505",
                  "id": "15-0x014fc0a376cbc15fff5d8455d308a53778e028e5"
                },
                {
                  "address": "0x014fd6d863b1c78ec5982e244ee401deb2c4935e",
                  "amount": "1385603283540820539",
                  "id": "15-0x014fd6d863b1c78ec5982e244ee401deb2c4935e"
                },
                {
                  "address": "0x0151aa9acceff2b200cd26049bc6c558355edbc9",
                  "amount": "3604095307776236132",
                  "id": "15-0x0151aa9acceff2b200cd26049bc6c558355edbc9"
                },
                {
                  "address": "0x015289a8b3997894df2ef4fc0d2cd188886d9fcb",
                  "amount": "6711368936253975963",
                  "id": "15-0x015289a8b3997894df2ef4fc0d2cd188886d9fcb"
                },
                {
                  "address": "0x015a0140f5e26095d2a71e967201ca48a821e637",
                  "amount": "1070916936777622271",
                  "id": "15-0x015a0140f5e26095d2a71e967201ca48a821e637"
                },
                {
                  "address": "0x01699127ddb37ca109497137a5f1b1be084f385a",
                  "amount": "393608433793880162",
                  "id": "15-0x01699127ddb37ca109497137a5f1b1be084f385a"
                },
                {
                  "address": "0x016d4412299a7b77b61078e73bac9d6de4821000",
                  "amount": "1732065957790508514",
                  "id": "15-0x016d4412299a7b77b61078e73bac9d6de4821000"
                },
                {
                  "address": "0x01712c975b6ce76c82e2a40c821b69155e3b55cd",
                  "amount": "851533922956638884",
                  "id": "15-0x01712c975b6ce76c82e2a40c821b69155e3b55cd"
                },
                {
                  "address": "0x0177a84b802da9a67e53a7397eba4438a2e93be5",
                  "amount": "6114637083969575367",
                  "id": "15-0x0177a84b802da9a67e53a7397eba4438a2e93be5"
                },
                {
                  "address": "0x017d32f40826117e0fe09708328c03f72091a5e7",
                  "amount": "8305437558992965",
                  "id": "15-0x017d32f40826117e0fe09708328c03f72091a5e7"
                },
                {
                  "address": "0x018085722ea74d61420c66e989eb8a1bd20db789",
                  "amount": "575385778384465415",
                  "id": "15-0x018085722ea74d61420c66e989eb8a1bd20db789"
                },
                {
                  "address": "0x0181dc225f685ce4e1f63e860ae6065ad33b4c3c",
                  "amount": "67990634072266181629",
                  "id": "15-0x0181dc225f685ce4e1f63e860ae6065ad33b4c3c"
                },
                {
                  "address": "0x0187e69badaf5aae725167486db93cb319e4bf36",
                  "amount": "4212097242325493284",
                  "id": "15-0x0187e69badaf5aae725167486db93cb319e4bf36"
                },
                {
                  "address": "0x018f4b918a24de93be4e5ffccca4e895fe7a9167",
                  "amount": "461186746787109828",
                  "id": "15-0x018f4b918a24de93be4e5ffccca4e895fe7a9167"
                },
                {
                  "address": "0x0193163d23e1945beab781e74300a466a06b4ae4",
                  "amount": "1394982721424045033",
                  "id": "15-0x0193163d23e1945beab781e74300a466a06b4ae4"
                },
                {
                  "address": "0x019dd419d1094ef44e6986feb265c653c1011b64",
                  "amount": "4811470319040024018",
                  "id": "15-0x019dd419d1094ef44e6986feb265c653c1011b64"
                },
                {
                  "address": "0x01a2c151a515ddf16fd134f7e6da6cf04b512097",
                  "amount": "1012924986584114906",
                  "id": "15-0x01a2c151a515ddf16fd134f7e6da6cf04b512097"
                },
                {
                  "address": "0x01ad902ae9ee25d734d0e2d762ed9122bcdbceb7",
                  "amount": "3468975857147022577",
                  "id": "15-0x01ad902ae9ee25d734d0e2d762ed9122bcdbceb7"
                },
                {
                  "address": "0x01af7e9b6985f6d3c2a1feb8ac46fb33c0612090",
                  "amount": "888876520658467040",
                  "id": "15-0x01af7e9b6985f6d3c2a1feb8ac46fb33c0612090"
                },
                {
                  "address": "0x01b00360a225f819a3f3e2273f2b6b629e9e55cc",
                  "amount": "462512869169320128",
                  "id": "15-0x01b00360a225f819a3f3e2273f2b6b629e9e55cc"
                },
                {
                  "address": "0x01b2e12c10f39e95ef38b99ca081891fa2c7a499",
                  "amount": "14408028498946024638",
                  "id": "15-0x01b2e12c10f39e95ef38b99ca081891fa2c7a499"
                },
                {
                  "address": "0x01b32e04091d6425b1ce6d51df682abe54ee1ce2",
                  "amount": "269740132798349095",
                  "id": "15-0x01b32e04091d6425b1ce6d51df682abe54ee1ce2"
                },
                {
                  "address": "0x01b5fb05b029efe650213b0b9649784e1bd6860b",
                  "amount": "21929296621458312520",
                  "id": "15-0x01b5fb05b029efe650213b0b9649784e1bd6860b"
                },
                {
                  "address": "0x01bbd820cd0aabd7848c8339d9fa34dfb29d14ea",
                  "amount": "291723540098217728060",
                  "id": "15-0x01bbd820cd0aabd7848c8339d9fa34dfb29d14ea"
                },
                {
                  "address": "0x01bf46d891dbbd75672325c3eef594435dabddc4",
                  "amount": "528600368306182927",
                  "id": "15-0x01bf46d891dbbd75672325c3eef594435dabddc4"
                }
              ]
            }
          ]
    //   console.log("blahblah: ", data.length)
    // for(i=0;i<data.length;i++){
    //     console.log("hhhblahblah: ", data[i].users.length);
    //     for(j=0;j<data[i].users.length; j++){
    //         // console.log("popop",data[i].users[j].amount)

    //     }
    // }

    for(j = 0;j < data.length; j++) {
        if(data[j].pool.id == POOL)
        {
        const userAddress = data[j].address;
        const totalSupplyAtBlock = data[j].pool == undefined ? 0 : data[j].pool.balance;
        const userRewardPercentage = totalSupplyAtBlock ? (data[j].amount * NORMALIZE_CONSTANT /totalSupplyAtBlock): 0;
        console.log(userAddress, " userRewardPercentage: ", userRewardPercentage, j)
            usersA.set(userAddress, userRewardPercentage)
        }
    }

    console.log("MAP Users: ", usersA)

    let users = []
    for(let address of usersA.keys()){
        users.push({
            address: address,
            amount: Number(usersA.get(address))
        })
    }


    let obj = {
        user_share_map: usersA,
        user_share: users,
        normalize_exponent: NORMALIZE_CONSTANT,
        date: Date.now()
    }

    let doc = await rewardsCollection.findOneAndUpdate({ block_number: blockResult, contract: "TopDog" }, obj, { new: true, upsert: true });

    // console.log("Array now: ", users)
    }catch(err){
        console.log(err, "Error in block: ", blockResult);
    }
}

async function main() {
    console.log("start fetching blocks - TopDog");

    try{
    // Cron to run after every 24 hrs to update blocks & perBlock data
    // cron.schedule('0 45 12 * * *', async () => {
    //     console.log("cron running...");
    if(config.contract.TopDogFlag){
    const params = {
        contract: "TopDog"
    }
    let latestBlockNumber = 0;
    let latestBlock = await rewardsCollection.find(params).limit(1).sort({$natural:-1}); // Fetching last block in DB for TopDog
    if(latestBlock[0] == undefined){
        latestBlockNumber = 0;
    } else {
        latestBlockNumber = latestBlock[0].block_number;
    }
     

    // const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.TopDog}&startblock=12808057&endblock=12808072&page=17&offset=5&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
    // let res = await axios.get(URL);
    let reachedLast = false;
    let page = 1;
    let offset = 10;
    let startBlock = 12808057;
    let endBlock = 12808072;
    let returnObj = [];
    lastestBlockNumber = latestBlockNumber;
    console.log("lastestBlockNumber: ", latestBlockNumber)
    while(!reachedLast){
        const URL = `https://${config.etherscanUrl}/api?module=account&action=txlist&address=${config.contract.TopDog}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=asc&apikey=H2EPP8FBXTDEDAAN93Z4975HU6FZYSFQY8`;
        let res = await axios.get(URL);
        console.log("Page: ", page," * ", res.data.result.length, " per ", offset);
        let blockArray = [];
        for(let i=0; i<res.data.result.length; i++){
            blockArray.push(res.data.result[i].blockNumber);
        }
        if(res.data.result.length<offset){
            reachedLast = true;
        } else {
            page++;
        }
        returnObj = [...returnObj, ...blockArray];
    }

    let uniqueBlocks = [...new Set(returnObj)];
    
    // console.log("Resss: ", returnObj);
    console.log("Resss Length: ", returnObj.length);
    console.log("Unique blocks length: ", uniqueBlocks.length);

    let i;
    let skipFirstBlock = false;
    if(latestBlockNumber != 0){
        i=0;
    } else {
        i=1;
        skipFirstBlock = true;  //contract blocks not saved till now, so ignoring first block  (the contract deployment block)
    }
    let op=0;
    let po=0;
    let buggyBlocks = [];
    for  (; i < uniqueBlocks.length; i++){
        console.log("BlockNumber: ", uniqueBlocks[i]);

        if(skipFirstBlock || latestBlockNumber < uniqueBlocks[i]){
            ++po;
            try{
                await fetchAndStore(uniqueBlocks[i]);
            }catch(err){
                console.log(err, "Error in block: ", uniqueBlocks[i]);
                buggyBlocks.push(uniqueBlocks[i]);
            }
        } else {
            /////////////////////////////////
            // skip already fetched blocks //
            /////////////////////////////////
            ++op;
        }


    }

    console.log("TopDog: Already saved blocks: ", op, " New blocks added :", po);

    let modelRes = await rewardsCollection.find(params);

    console.log("Execution completed: DB now ", modelRes);
    console.log("Issue occured in blocks: ", buggyBlocks);

    }
    // });
    } catch (err) {
        console.log("Error throw: TopDog: ", err);
    }

}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    });