import * as util from 'ethereumjs-util';

class HashUtils {
  static getAddressFromHash(signature: string, hashString: string) {
    const ethereumString: string =
      '\x19Ethereum Signed Message:\n' + hashString.length + hashString;

    const nonce = util.keccak(Buffer.from(ethereumString, 'utf-8'));

    const { v, r, s } = util.fromRpcSig(signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuf = util.pubToAddress(pubKey);
    const addr = util.bufferToHex(addrBuf);

    return addr;
  }
}

export default HashUtils;
