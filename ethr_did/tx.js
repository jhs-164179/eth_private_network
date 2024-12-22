const { Web3 }= require('web3');
const fs = require('fs');

// 로컬 노드 또는 Infura, Alchemy 같은 노드 제공 서비스에 연결
const web3 = new Web3('http://localhost:8545');  // 프라이빗 네트워크의 RPC URL

// ABI와 바이트코드 로드
const abi = JSON.parse(fs.readFileSync('abi.json', 'utf8'));
const bytecode = fs.readFileSync('bytecode.txt', 'utf8');

// 배포 계정 설정 (여기서는 개인 키를 사용하여 서명)
const account = '0x943c4442641611726D9b0a2463efC6C797f2FA05';  // 배포할 계정
const privateKey = '0xeab4ec1ffa8b192c6aa81e28f299c65d3788d925acf6f928e27d09b9c1aeceab';

// 스마트 컨트랙트 인스턴스 생성
const contract = new web3.eth.Contract(abi);

// 스마트 컨트랙트 배포
const deploy = contract.deploy({
    data: '0x' + bytecode,  // 바이트코드를 추가
});

// 트랜잭션 객체 생성
const deployTx = {
    from: account,
    gas: 2000000,
    gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei')),
    data: deploy.encodeABI(),
};

// 트랜잭션 서명 및 전송
web3.eth.accounts.signTransaction(deployTx, privateKey).then(signedTx => {
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)  // 배포 성공 시 출력
        .on('error', console.error); // 에러 발생 시 출력
});
