// 필요한 모듈 import
import Web3, { ProviderError } from 'web3';
import fs from 'fs';
import readline from 'readline';
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
// Web3 인스턴스 생성
const web3 = new Web3('http://localhost:8545');  // 이더리움 노드 URL

// 스마트 계약 ABI 및 주소 로드
const contractData = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8'));
const abi = contractData.abi;  // abi 필드만 가져옴
const contractAddress = "0x4c33dB29963AB54Ca790f4AfECaECE346df8866c";  // 배포된 스마트 계약 주소

// 스마트 계약 인스턴스 생성
const contract = new web3.eth.Contract(abi, contractAddress);
const chainId = await web3.eth.getChainId();
const providerConfig ={
    name: "devnet",
    rpcUrl: "http://localhost:8545",
    chainId: parseInt(chainId),
    registry: contractAddress
}

const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);
// readline 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// DID 소유자 검증 함수
async function verifyDIDOwner(didAddress, password) {
    try {
        // 계정 잠금 해제
        const unlocked = await web3.eth.personal.unlockAccount(didAddress, password, 600);
        if (unlocked) {
            console.log("Account unlocked successfully!");

            // DID 소유자 확인
            const owner = await contract.methods.identityOwner(didAddress).call();
            console.log(`DID ${didAddress} is owned by:`, owner);
            // DID document create
            const result = await didResolver.resolve(`did:ethr:devnet:${didAddress}`)
            console.log("result: ", result.didDocument);            

        } else {
            console.log("Failed to unlock account.");
        }
    } catch (error) {
        console.error("Error verifying DID owner:", error);
    }
}

// DID 주소와 비밀번호 입력 요청
rl.question("Please enter the DID address: ", function(didAddress) {
    rl.question("Please enter your account password: ", function(password) {
        // 모든 입력이 끝난 후 verifyDIDOwner 호출
        verifyDIDOwner(didAddress, password).then(() => {
            rl.close();  // readline 종료
        }).catch((error) => {
            console.error("Error during verification:", error);
            rl.close();
        });
    });
});

// readline 종료 시 호출
rl.on("close", function() {
    console.log("\nProcess completed.");
    process.exit(0);
});
