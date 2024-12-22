import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

const providerConfig ={
    name: "devnet",
    rpcUrl: "http://localhost:8545",
    chainId: 1343,
    registry: "0x4c33dB29963AB54Ca790f4AfECaECE346df8866c"
};

const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);

let did = 'did:ethr:devnet:0xE8b0EB7F18Af5cCF22781B6F39D8F131FB93B008';
const result = await didResolver.resolve(did);
console.log(result);