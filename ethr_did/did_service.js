import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { ethers } from 'ethers';

const app = express();
const port = 3000;

const web3 = new Web3('http://localhost:8545');

// 관리자 계정 및 비밀번호
const adminAccount = "0x4b824A394372747f56fA9ba40E2341Fd46d52573";
const adminPassword = "1234";

// 컨트랙트 초기화
const contractAddress = "0xc10023F83d567046706f42480f5BfB4eb933a259";
const contractABI = JSON.parse(fs.readFileSync('/home/dnslab11/ethr_did/truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8')).abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);

const keystoreDir = '/home/dnslab11/ethr_did/genesis/keystore';
const chainNameOrId = 1344;
const rpcUrl = "http://localhost:8545";
const invalidOwner = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

// Keystore 파일 찾기
async function findKeystoreFile(accountAddress) {
    try {
        const files = fs.readdirSync(keystoreDir);
        const targetFile = files.find(file => file.includes(accountAddress.toLowerCase().replace('0x', '')));
        if (!targetFile) return null;

        return { path: path.join(keystoreDir, targetFile), filename: targetFile };
    } catch (error) {
        console.error("Error finding keystore file:", error);
        return null;
    }
}

// DID 계정 생성
async function createDidAccount(password) {
    try {
        const newAccount = await web3.eth.personal.newAccount(password);
        console.log("New account created: ", newAccount);

        await web3.eth.personal.unlockAccount(adminAccount, adminPassword, 600);
        await web3.eth.personal.unlockAccount(newAccount, password, 600);

        const amountToSend = web3.utils.toWei("30", "ether");
        await web3.eth.sendTransaction({
            from: adminAccount,
            to: newAccount,
            value: amountToSend,
            gas: 21000,
            gasPrice: await web3.eth.getGasPrice()
        });

        await contract.methods.changeOwner(newAccount, adminAccount).send({
            from: newAccount,
            gasPrice: await web3.eth.getGasPrice(),
            gas: 300000
        });

        const keystoreFile = await findKeystoreFile(newAccount);
        if (!keystoreFile) throw new Error("Keystore file not found");

        return keystoreFile;
    } catch (error) {
        console.error("Error creating DID account:", error);
        throw error;
    }
}

// Express 엔드포인트
app.use(express.json());

app.post('/create-did', async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    try {
        const keystoreFile = await createDidAccount(password);
        res.download(keystoreFile.path, keystoreFile.filename);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 서버 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`DID service running at http://0.0.0.0:${port}`);
});
