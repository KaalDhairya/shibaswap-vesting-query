"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shibaswap_data_snoop_1 = __importDefault(require("@shibaswap/shibaswap-data-snoop"));
exports.default = {
    async info(block_number) {
        return await shibaswap_data_snoop_1.default.topdog.info({ block: block_number });
    },
    async pools(block_number) {
        return await shibaswap_data_snoop_1.default.topdog.pools({ block: block_number });
    },
    async claims(block_number) {
        return await shibaswap_data_snoop_1.default.vesting.users({ block: block_number });
    },
    async users(block_number) {
        return await shibaswap_data_snoop_1.default.topdog.users({ block: block_number });
    }
};
