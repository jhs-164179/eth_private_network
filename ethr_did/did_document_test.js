import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { ethers } from 'ethers';
// ethers.utils에서 encodeBytes32String과 toUtf8Bytes 가져오기
import { encodeBytes32String} from 'ethers/abi';
import { toUtf8Bytes } from 'ethers/utils';
import Web3 from 'web3';
import fs from 'fs';

const chainNameOrId = 1343;
const rpcUrl = "http://localhost:8545";
const web3 = new Web3(rpcUrl);
const contractAddress = "0xb9679A4cEA94BaEE7491248c27171410d3d21923"; // 스마트 컨트랙트의 주소
const provider = new ethers.JsonRpcProvider(rpcUrl);
const identifier = "0x5E38a246f5cdddd9495E33FcFb29C68412764133"; // 검증을 원하는 DID
const adminAccount = "0x31447BC4804C427ACF6a831C2A5d0F00fd40483a"; // 관리자 계정
const adminPassword = "1234";

const contractData = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8'));
const contract = new web3.eth.Contract(contractData.abi, contractAddress);

const providerConfig = {
    name: "devnet",
    rpcUrl: rpcUrl,
    chainId: chainNameOrId,
    registry: contractAddress,
};

const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);

async function resolveDidDocument(did, resolver) {
    try {
        const didDocument = (await resolver.resolve(did)).didDocument;
        console.log(`DID Document for ${did}:`, didDocument);
        return didDocument;
    } catch (error) {
        console.error("Error resolving DID document:", error);
        return null;
    }
}

async function testDidFunctions() {
    try {
        await web3.eth.personal.unlockAccount(adminAccount, adminPassword, 600);

        console.log("Initial DID Document:");
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // // 1. Change Owner
        // console.log("\nChanging owner...");
        // await contract.methods.changeOwner(identifier, "0x8B6Df783D2c8944A6bA949Bd65CC9f227cC7C0fa").send({
        //     from: adminAccount,
        //     gas: 300000,
        // });
        // await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // 2. Add Delegate
        console.log("\nAdding delegate...");
        // const delegateType = encodeBytes32String("sigAuth");
        const delegateType = encodeBytes32String("veriKey");
        const delegateAccount = identifier;
        await contract.methods.addDelegate(identifier, delegateType, delegateAccount, 3600).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // 3. Set Attribute
        console.log("\nSetting attribute...");
        const attrName = encodeBytes32String("did/pub/Ed25519/veriKey/base58");
        const attrValue = toUtf8Bytes("0xb97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71");
        await contract.methods.setAttribute(identifier, attrName, attrValue, 3600).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);
        
        console.log("\nSetting attribute...");
        const attrName2 = encodeBytes32String("did/svc/HubService");
        const attrValue2 = toUtf8Bytes("https://hubs.uport.me");
        await contract.methods.setAttribute(identifier, attrName2, attrValue2, 3600).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // 4. Revoke Attribute
        console.log("\nRevoking attribute...");
        await contract.methods.revokeAttribute(identifier, attrName, attrValue).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        console.log("\nRevoking attribute...");
        await contract.methods.revokeAttribute(identifier, attrName2, attrValue2).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // 5. Revoke Delegate
        console.log("\nRevoking delegate...");
        await contract.methods.revokeDelegate(identifier, delegateType, delegateAccount).send({
            from: adminAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000,
        });
        await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // // 6. Add Signed Delegate
        // console.log("\nAdding signed delegate...");
        // const sigV = 27;
        // const sigR = "0x...";
        // const sigS = "0x...";
        // await contract.methods.addDelegateSigned(identifier, sigV, sigR, sigS, delegateType, delegateAccount, 3600).send({
        //     from: adminAccount,
        //     gas: 300000,
        // });
        // await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

        // // 7. Set Signed Attribute
        // console.log("\nSetting signed attribute...");
        // await contract.methods.setAttributeSigned(identifier, sigV, sigR, sigS, attrName, attrValue, 3600).send({
        //     from: adminAccount,
        //     gas: 300000,
        // });
        // await resolveDidDocument(`did:ethr:devnet:${identifier}`, didResolver);

    } catch (error) {
        console.error("Error during DID operations:", error);
    }
}

// Execute tests
testDidFunctions();
