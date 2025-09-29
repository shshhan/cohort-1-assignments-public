#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting blockchain infrastructure...${NC}"

# Step 1: Start Geth node
echo -e "${YELLOW}[1/4] Starting Geth node...${NC}"
docker compose up -d geth geth-init caddy graph-node graph-ipfs graph-postgres graph-redis
echo "Waiting for Geth to initialize..."
sleep 10

# Step 2: Check if Blockscout directory exists
BLOCKSCOUT_DIR="./blockscout"
if [ -d "$BLOCKSCOUT_DIR" ]; then
    echo -e "${YELLOW}[2/4] Starting Blockscout...${NC}"
    cd $BLOCKSCOUT_DIR
    docker compose -f docker-compose.blockscout.yml up -d
    cd - > /dev/null
    echo "Waiting for Blockscout to start indexing..."
    sleep 20
else
    echo -e "${YELLOW}[2/4] Blockscout directory not found, creating network only...${NC}"
    docker network create blockscout_blockscout-network 2>/dev/null || true
fi

# Step 3: Login to GitHub Container Registry
echo -e "${YELLOW}[3/5] Logging in to GitHub Container Registry...${NC}"
if [ -f "$HOME/dev/tokens/ghcr_login_token.txt" ]; then
    cat $HOME/dev/tokens/ghcr_login_token.txt | docker login ghcr.io -u shshhan --password-stdin
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully logged in to ghcr.io${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to login to ghcr.io. sc-deployer might fail.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Token file not found at ~/dev/tokens/ghcr_login_token.txt${NC}"
    echo "Please ensure the token file exists or sc-deployer might fail."
fi

# Step 4: Start remaining services
echo -e "${YELLOW}[4/5] Starting application services...${NC}"
docker compose up -d sc-deployer sc-deployment-server

# Step 5: Wait for contract deployment
echo -e "${YELLOW}[5/5] Waiting for smart contract deployment...${NC}"
sleep 15

# Check deployment status
if [ -f "sc-deployer/deployment.json" ]; then
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo "Contract addresses:"
    cat sc-deployer/deployment.json | jq '.'
else
    echo -e "${YELLOW}⚠️  Deployment file not found yet. Check 'docker logs sc-deployer' for status.${NC}"
fi

echo -e "${GREEN}All services started!${NC}"
echo ""
echo "Access points:"
echo "  - Geth RPC: http://localhost:8545"
echo "  - Blockscout Explorer: http://localhost:3000 (if running)"
echo "  - Caddy Proxy: http://localhost:8082"
echo ""
echo "To check status: docker ps"
echo "To view logs: docker compose logs -f [service-name]"
