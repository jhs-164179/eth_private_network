# eth_private_network

## requirements
- Node v20.17.0
- Truffle v5.11.5
- go1.23.2 linux/amd64
- geth 1.13.15- stable- c5ba367e (1.14미만의 버전을 사용해야함)

## install 
✅ 1. Node.js (v20.17.0)
✔ 설치 여부 확인
```bash
node -v
npm -v
```
✔ 설치 방법
```bash
# nvm 설치 (만약 아직 없다면)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Node.js 20.17.0 설치 및 사용
nvm install 20.17.0
nvm use 20.17.0
nvm alias default 20.17.0
```

✅ 2. Truffle (v5.11.5)
✔ 설치 여부 확인
```bash
truffle version
```
✔ 설치 방법
```bash
npm install -g truffle@5.11.5
```

✅ 3. Go (go1.23.2)
✔ 설치 여부 확인
```bash
go version
```
✔ 설치 방법 (수동 설치 추천)
```bash
# Go 1.23.2 다운로드
wget https://go.dev/dl/go1.23.2.linux-amd64.tar.gz

# 기존 Go 제거 (기존 버전 있는 경우)
sudo rm -rf /usr/local/go

# 압축 해제 및 설치
sudo tar -C /usr/local -xzf go1.23.2.linux-amd64.tar.gz

# 환경변수 설정 (bash 기준)
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

✅ 4. Geth (v1.13.15, 반드시 1.14 미만)
✔ 설치 여부 확인
```bash
geth version

```
✔ 설치 방법
```bash
# 1. 다운로드 (1.13.15 기준)
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.13.15-c5ba367e.tar.gz

# 2. 압축 해제
tar -xvzf geth-linux-amd64-1.13.15-c5ba367e.tar.gz

# 3. 이동 및 설치
cd geth-linux-amd64-1.13.15-c5ba367e
sudo cp geth /usr/local/bin/

# 4. 확인
geth version
```

### install node packages
```bash
mkdir ethr_did
cd ethr_did
npm init -y
```
```bash
# install automatically (based on package.json file)
npm install
# install manually
npm install did-jwt@^8.0.4 \
            did-resolver@^4.1.0 \
            ethereumjs-wallet@^1.0.2 \
            ethers@^6.13.4 \
            ethr-did@^3.0.21 \
            ethr-did-resolver@^11.0.2 \
            express@^5.1.0
            hardhat@^2.22.15 \
            solc@^0.8.28 \
            web3@^4.13.0 \
```


# run (assuming that already smart contract is deployed)
```bash
chmod +x /root/eth_private_network/ethr_did/run.sh
bash /root/eth_private_network/ethr_did/run.sh
```