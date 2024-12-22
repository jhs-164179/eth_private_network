import { ethers } from 'ethers';
import { EthrDID } from 'ethr-did'
import { eth } from 'web3';
import { Web3 } from 'web3';
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'


const rpcUrl = "http://localhost:8555";
const web3 = new Web3(rpcUrl);
const addr = "0x95758c2f8dbB1423c201bA5dDB1C4Ed3EDe0d23a";
const adminAddr = "0x31447BC4804C427ACF6a831C2A5d0F00fd40483a";

const chainNameOrId = 1343

const contractAddress = "0x60a1CD1E762B7dDa6682AF5ad8eE1f07ED877324";
const privateKey = "0xbcda1b80c904e2230c2e243aee5ca7a3c8f80c8defeed6540b8ccf2bca9401e1"
const provider = new ethers.JsonRpcProvider(rpcUrl);

const unlocked = await web3.eth.personal.unlockAccount(addr, '1234', 600);
const adminUnlocked = await web3.eth.personal.unlockAccount(adminAddr, '1234', 600);
// const amountToSend = web3.utils.toWei("30", "ether");

// // 이더 전송 트랜잭션 호출
// const txReceipt = await web3.eth.sendTransaction({
//     from: adminAddr,
//     to: addr,
//     value: amountToSend,
//     gas: 21000,  // 기본 트랜잭션 가스 리밋
//     gasPrice: await web3.eth.getGasPrice()
// });


//const wallet = new ethers.Wallet(privateKey, provider);
// console.log(wallet);
// const ethrDid = new EthrDID({ identifier: addr, signer: wallet, rpcUrl: rpcUrl, chainNameOrId: 'devnet', provider: provider, registry: contractAddress, alg: 'ES256K-R' });
// const owner = await ethrDid.lookupOwner();
// console.log(owner);

// let resultHash = await ethrDid.setAttribute("example Key", "example value", 86400);
// console.log(resultHash);

const providerConfig = {
    name: "devnet",
    rpcUrl: rpcUrl,
    chainId: parseInt('1343'),
    registry: contractAddress
}

const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);
const didDocument = (await didResolver.resolve('did:ethr:devnet:0x95758c2f8dbB1423c201bA5dDB1C4Ed3EDe0d23a')).didDocument

console.log(didDocument);

