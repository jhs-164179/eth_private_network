import Web3 from 'web3';
import fs from 'fs';

// Geth 노드에 연결
const web3 = new Web3('http://localhost:8545');

// 비밀번호 설정
const password = '1234'; // this value must set by using hash function DO NOT USE RAW USER PASSWORD
const contractAddress = "0xb9679A4cEA94BaEE7491248c27171410d3d21923";
const contractABI = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8')).abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);

const adminAccount = "0x31447BC4804C427ACF6a831C2A5d0F00fd40483a";
const adminPassword = "1234";

// 계정 생성 함수
async function createAccount() {
    try {
        const newAccount = await web3.eth.personal.newAccount(password);
        console.log("New account created: ", newAccount);
        await web3.eth.personal.unlockAccount(adminAccount, adminPassword, 600);
        await web3.eth.personal.unlockAccount(newAccount, password, 600);
        const amountToSend = web3.utils.toWei("30", "ether");

        // 이더 전송 트랜잭션 호출
        const txReceipt = await web3.eth.sendTransaction({
            from: adminAccount,
            to: newAccount,
            value: amountToSend,
            gas: 21000,  // 기본 트랜잭션 가스 리밋
            gasPrice: await web3.eth.getGasPrice()
        });

        console.log(`30 ETH successfully sent to ${newAccount}`);
        console.log("Transaction receipt for ETH transfer:", txReceipt);

        await contract.methods.changeOwner(newAccount, adminAccount).send({
            from: newAccount,
            gasPrice : await web3.eth.getGasPrice(),
            gas: 300000
        });
        console.log(`DID ownership set for account: ${adminAccount}`);
    } catch (error) {
        console.error("Error creating account: ", error);
    }
}

// 계정 생성 호출
createAccount();
