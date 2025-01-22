import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { ethers } from 'ethers';
import Web3 from 'web3';
import fs from 'fs';

const chainNameOrId = 1343;
const rpcUrl = "http://localhost:8545";
const web3 = new Web3(rpcUrl);
const contractAddress = "0xb9679A4cEA94BaEE7491248c27171410d3d21923"; // 스마트 컨트랙트의 주소
const provider = new ethers.JsonRpcProvider(rpcUrl);
const identifier = "0x5E38a246f5cdddd9495E33FcFb29C68412764133"; // 검증을 원하는 did
// const identifier = '0x8B6Df783D2c8944A6bA949Bd65CC9f227cC7C0fa'; // 파기된 did
// 특별한 소유권 값 (파기 값)
const invalidOwner = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

const contractData = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8'));
const contract = new web3.eth.Contract(contractData.abi, contractAddress);
provider.on('debug', (info) => {
    console.log('Network request:', info);
});
async function isDidRegistered(identifier, contract) {
    try {
        // Step 1: Check the owner of the DID
        const owner = await contract.methods.identityOwner(identifier).call();
        console.log(`Owner for ${identifier}: ${owner.toUpperCase()}`);

        // If the owner is the invalid address, the DID is not registered
        if (owner.toUpperCase() === invalidOwner.toUpperCase()) {
            console.log("DID owner is invalid.");
            return false;
        }

        // Step 2: Check if any relevant events exist
        const pastEvents = await contract.getPastEvents('DIDOwnerChanged', {
            filter: { identity: identifier },
            fromBlock: 0, // Start from the genesis block
            toBlock: 'latest', // Search up to the latest block
        });

        // If there's at least one event, the DID is registered
        if (pastEvents.length > 0) {
            console.log(`DID ${identifier} is registered. Events:`, pastEvents);
            return true;
        } else {
            console.log(`No relevant events found for DID ${identifier}.`);
            return false;
        }
    } catch (error) {
        console.error("Error looking up DID owner or events:", error);
        return false;
    }
}

async function resolveDidDocument(did, resolver) {
    try {
        const didDocument = (await resolver.resolve(did)).didDocument;

        if (!didDocument || !didDocument.verificationMethod || didDocument.verificationMethod.length === 0) {
            console.log(`DID document for ${did} is invalid or empty.`);
            return null;
        }
        console.log(`DID document for ${did}:`, didDocument);
        return didDocument;
    } catch (error) {
        console.error("Error resolving DID document:", error);
        return null;
    }
}

const providerConfig = {
    name: "devnet",
    rpcUrl: rpcUrl,
    chainId: chainNameOrId,
    registry: contractAddress,
};

const did = "did:ethr:devnet:" + identifier;

// const ethrDidResolver = getResolver(providerConfig);
const ethrDidResolver = getResolver({
        networks:[{
            name: "devnet",
            rpcUrl: rpcUrl,
            chainId: chainNameOrId,
            registry: contractAddress,
        }]
    }
);

const didResolver = new Resolver(ethrDidResolver);

const didDocument = await resolveDidDocument(did, didResolver);

if (didDocument) {
    const isRegistered = await isDidRegistered(identifier, contract);
    if (isRegistered) {
        console.log(`${did} is registered on the blockchain.`);
    } else {
        console.log(`${did} is not registered on the blockchain.`);
    }
} else {
    console.log(`Failed to resolve a valid DID document for ${did}.`);
}
