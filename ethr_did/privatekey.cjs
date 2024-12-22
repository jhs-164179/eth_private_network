const Wallet = require('ethereumjs-wallet').default;
const fs = require('fs');
const path = require('path');

// keystore 파일 경로 (절대 경로나 상대 경로로 지정)
const keystorePath = path.join("/home/latteisacat/ethr_did/genesis/keystore/UTC--2024-11-12T15-15-41.996551806Z--95758c2f8dbb1423c201ba5ddb1c4ed3ede0d23a");

// 비밀번호 입력
const password = '1234';  // keystore 파일 암호

// 파일에서 keystore 읽기
fs.readFile(keystorePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading keystore file:', err);
        return;
    }

    try {
        const keystore = JSON.parse(data);  // JSON 파싱
        Wallet.fromV3(keystore, password).then(wallet => {
            const privateKey = wallet.getPrivateKeyString();
            console.log('Private Key:', privateKey);
        }).catch(error => {
            console.error('Error decrypting keystore:', error);
        });
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});
