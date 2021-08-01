"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("ethereumjs-util");
class HashUtils {
    static getAddressFromHash(signature, hashString) {
        const ethereumString = '\x19Ethereum Signed Message:\n' + hashString.length + hashString;
        const nonce = util.keccak(Buffer.from(ethereumString, 'utf-8'));
        const { v, r, s } = util.fromRpcSig(signature);
        const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
        const addrBuf = util.pubToAddress(pubKey);
        const addr = util.bufferToHex(addrBuf);
        return addr;
    }
}
exports.default = HashUtils;
//# sourceMappingURL=hash.utils.js.map