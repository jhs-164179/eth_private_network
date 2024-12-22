import Web3 from 'web3';
import fs from 'fs';
import readline from 'readline';
import { ethers } from 'ethers';

// ethers.utils에서 encodeBytes32String과 toUtf8Bytes 가져오기
import { encodeBytes32String} from 'ethers/abi';
import { toUtf8Bytes } from 'ethers/utils';


const web3 = new Web3('http://localhost:8545');
const contractData = JSON.parse(fs.readFileSync('/home/latteisacat/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8'));
const abi = contractData.abi;
const contractAddress = "0x4c33dB29963AB54Ca790f4AfECaECE346df8866c";

const contract = new web3.eth.Contract(abi, contractAddress);

// readline 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 사용자에게 주소 입력 요청
rl.question("Please enter the recipient address (to): ", async function(toAddress) {

    // 계정 비밀번호 입력 받기
    rl.question("Please enter your account password: ", async function(password) {
        const fromAddress = "0x943c4442641611726D9b0a2463efC6C797f2FA05";  // 이더 전송을 할 계정 (보내는 계정)

        try {
            // 계정 잠금 해제
            const unlocked = await web3.eth.personal.unlockAccount(fromAddress, password, 600);
            if (unlocked) {
                console.log("Account unlocked successfully!");
                web3.eth.personal.unlockAccount(toAddress, password, 600); // currently, all password is same
                // 30 ETH를 Wei로 변환
                const amountToSend = web3.utils.toWei("30", "ether");

                // 이더 전송 트랜잭션 호출
                const txReceipt = await web3.eth.sendTransaction({
                    from: fromAddress,
                    to: toAddress,
                    value: amountToSend,
                    gas: 21000,  // 기본 트랜잭션 가스 리밋
                    gasPrice: await web3.eth.getGasPrice()
                });

                console.log(`30 ETH successfully sent to ${toAddress}`);
                console.log("Transaction receipt for ETH transfer:", txReceipt);

                // 이더 전송 후 DID 생성
                const publicKey = toAddress; // DID 생성 시 사용할 publicKey로 주소 사용
                const identity = publicKey;
                const validity = 62400; // 유효기간 (초 단위)

                // DID 트랜잭션 호출
                const gasPrice = await web3.eth.getGasPrice();
                const didReceipt = await contract.methods.setAttribute(
                    identity, 
                    encodeBytes32String('encryptionKey'), 
                    toUtf8Bytes('mykey'), 
                    validity)
                .send({
                    from: publicKey,
                    gasPrice: gasPrice,
                    gas: 1000000
                });

                console.log("DID successfully created with receipt:", didReceipt);
            } else {
                console.log("Failed to unlock account.");
            }
        } catch (error) {
            console.error("Error occurred during transaction: ", error);
        }

        rl.close();  // readline 종료
    });
});

rl.on("close", function() {
    console.log("\nProcess completed.");
    process.exit(0);
});
