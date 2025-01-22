import Web3 from 'web3';
import fs from 'fs';

// Geth 노드에 연결
const web3 = new Web3('http://localhost:8545');

// 계약 정보 설정
const contractAddress = "0xb9679A4cEA94BaEE7491248c27171410d3d21923";
const contractABI = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8')).abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 관리자 계정 및 설정
const adminAccount = "0x31447BC4804C427ACF6a831C2A5d0F00fd40483a";
const adminPassword = "1234";

// 파기 대상 계정 (예: 삭제 대상 DID)
const targetDID = '0x8B6Df783D2c8944A6bA949Bd65CC9f227cC7C0fa';
// 특별한 소유권 값 (파기 값)
const invalidOwner = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

// DID 파기 함수
async function revokeDID() {
    try {
        // 관리자 계정 잠금 해제
        await web3.eth.personal.unlockAccount(adminAccount, adminPassword, 600);

        // DID 파기 (소유권 변경을 '0x00'으로 설정)
        await contract.methods.changeOwner(targetDID, invalidOwner).send({
            from: adminAccount,
            gasPrice: await web3.eth.getGasPrice(),
            gas: 300000
        });

        console.log(`DID ownership successfully revoked for: ${targetDID}`);
    } catch (error) {
        console.error("Error revoking DID ownership: ", error);
    }
    const currentOwner = await contract.methods.identityOwner(targetDID).call();
    console.log(`Current owner for ${targetDID}: ${currentOwner}`);

}

// DID 파기 호출
revokeDID();
