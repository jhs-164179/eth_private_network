nohup geth --datadir ./genesis \
            --networkid 1343 \
            --http --http.addr 0.0.0.0 \
            --http.port 8545 \
            --http.api personal,eth,web3,net,txpool,miner,admin \
            --mine \
            --miner.etherbase 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc \
            --unlock 0xe3fabefaea7717a386243c57f74af8bcce4ca3fc  \
            --allow-insecure-unlock \
            --password ./password.txt > geth.log 2>&1 &


nohup node did_service.js > did.log 2>&1 &