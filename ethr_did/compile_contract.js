const solc = require('solc');
const fs = require('fs');

// Solidity 파일 읽기
const contractSource = fs.readFileSync('EthereumDIDRegistry.sol', 'utf8');

// Solidity 컴파일
const input = {
    language: 'Solidity',
    sources: {
        'EthereumDIDRegistry.sol': {
            content: contractSource,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// ABI와 바이트코드 추출
const abi = output.contracts['EthereumDIDRegistry.sol']['EthereumDIDRegistry'].abi;
const bytecode = output.contracts['EthereumDIDRegistry.sol']['EthereumDIDRegistry'].evm.bytecode.object;

// ABI와 바이트코드를 파일로 저장 (선택 사항)
fs.writeFileSync('abi.json', JSON.stringify(abi));
fs.writeFileSync('bytecode.txt', bytecode);
