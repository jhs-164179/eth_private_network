#!/bin/bash

# modified
PROJECT_DIR="/root/eth_private_network/ethr_did"
GETH_LOG="$PROJECT_DIR/geth.log"
NODE_LOG="$PROJECT_DIR/did.log"
PASSWORD_FILE="$PROJECT_DIR/password.txt"

cd "$PROJECT_DIR" || { echo "Fail to move: $PROJECT_DIR"; exit 1; }
echo "Working in: $(pwd)"

# Geth 실행
echo "Starting Geth..."
nohup geth --datadir ./genesis \
    --networkid 1343 \
    --http --http.addr 0.0.0.0 \
    --http.port 8545 \
    --http.api personal,eth,web3,net,txpool,miner,admin \
    --mine \
    --miner.etherbase 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc \
    --unlock 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc \
    --allow-insecure-unlock \
    --password "$PASSWORD_FILE" > "$GETH_LOG" 2>&1 &


# Geth 준비 상태 확인 (최대 30초 대기)
echo "Waiting for Geth RPC (localhost:8545)..."
for i in {1..30}; do
    nc -z localhost 8545 && echo "Geth RPC is ready!" && break
    sleep 1
done

# 포트가 열리지 않았다면 종료
if ! nc -z localhost 8545; then
    echo "Geth RPC did not start within timeout. Check geth.log for issues."
    exit 1
fi

# Node 서버 실행
echo "Starting Node DID Service..."
nohup node did_service.js > "$NODE_LOG" 2>&1 &

echo "All services started successfully."


# origin
# nohup geth --datadir ./genesis \
#             --networkid 1343 \
#             --http --http.addr 0.0.0.0 \
#             --http.port 8545 \
#             --http.api personal,eth,web3,net,txpool,miner,admin \
#             --mine \
#             --miner.etherbase 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc \
#             --unlock 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc  \
#             --allow-insecure-unlock \
#             --password ./password.txt > geth.log 2>&1 &
# nohup node did_service.js > did.log 2>&1 &