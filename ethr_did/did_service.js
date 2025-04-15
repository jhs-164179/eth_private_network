import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { ethers } from 'ethers';

const app = express();
const port = 80; // 포트포워딩에 따라 상이

const web3 = new Web3('http://localhost:8545');

// 관리자 계정 및 비밀번호
const adminAccount = "0xe3FaBefAEA7717A386243c57f74Af8BCCe4CA3fC"; // geth에 포함된 계정 (메뉴얼 참고) | 변경시 genesis.json -> extradata, alloc 수정해야 함
const adminPassword = "1234";

// 컨트랙트 초기화
const contractAddress = "0xc21f81d790C538C10E09c1d46BCA2AFb4cA427d2"; // 최초 실행 시 truffle 배포된 주소 (메뉴얼 참고)
const contractABI = JSON.parse(fs.readFileSync('./truffle/build/contracts/EthereumDIDRegistry.json', 'utf-8')).abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);

const keystoreDir = './genesis/keystore';
const chainNameOrId = 1343;
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

// DID 검증
async function isDidRegistered(identifier) {
    try {
        const owner = await contract.methods.identityOwner(identifier).call();
        if (owner.toUpperCase() === invalidOwner.toUpperCase()) return false;

        const pastEvents = await contract.getPastEvents('DIDOwnerChanged', {
            filter: { identity: identifier },
            fromBlock: 0,
            toBlock: 'latest',
        });

        return pastEvents.length > 0;
    } catch (error) {
        console.error("Error verifying DID:", error);
        return false;
    }
}

// DID 문서 확인
async function resolveDidDocument(did) {
    const ethrDidResolver = getResolver({
        networks: [{
            name: "devnet",
            rpcUrl: rpcUrl,
            chainId: chainNameOrId,
            registry: contractAddress,
        }]
    });
    const didResolver = new Resolver(ethrDidResolver);

    try {
        const result = await didResolver.resolve(did);
        return result?.didDocument || null;
    } catch (error) {
        console.error("Error resolving DID document:", error);
        return null;
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

app.get('/verify-did', async (req, res) => {
    const { did } = req.query;
    if (!did) return res.status(400).json({ error: 'DID is required' });

    try {
        const identifier = did.split(':').pop(); // DID에서 identifier 추출
        const isRegistered = await isDidRegistered(identifier);
        const didDocument = await resolveDidDocument(did);

        res.status(200).json({
            did,
            isRegistered,
            didDocument
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 서버 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`DID service running at http://0.0.0.0:${port}`);
});
