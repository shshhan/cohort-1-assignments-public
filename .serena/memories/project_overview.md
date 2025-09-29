# Project Overview

This is Assignment 1B from a blockchain cohort, focused on setting up a local blockchain development environment using Docker Compose.

## Project Purpose
Set up a local development environment comprising:
- Caddy reverse proxy for routing multiple services
- Smart contracts deployer (ephemeral container)
- Smart contracts deployment server (JSON API)
- EVM node (Geth) running local blockchain
- Geth initialization script for account prefunding
- Explorer (Blockscout) for blockchain visualization
- Graph stack for blockchain data indexing (future)
- Ngrok tunnel for external access

## Tech Stack
- Docker Compose for orchestration
- Geth (Ethereum client) for blockchain node
- Caddy for reverse proxy and web server
- Blockscout for blockchain explorer
- Nginx for Blockscout proxy
- PostgreSQL and Redis for Blockscout backend
- Custom shell scripts for initialization

## Key Services
1. **Main stack** (docker-compose.yml):
   - caddy: Reverse proxy on port 8080
   - geth: Ethereum node on ports 8545/8546
   - sc-deployer: Contract deployment
   - sc-deployment-server: Contract info API on port 8081
   - geth-init: Account prefunding

2. **Blockscout stack** (docker-compose.blockscout.yml):
   - Complete Blockscout setup with frontend, backend, databases
   - Nginx proxy exposing on port 4000
   - Connected to main geth network

## Network Architecture
All services communicate via `geth-network` Docker bridge network.
External access through Caddy routes:
- /rpc → Geth RPC
- /explorer → Blockscout
- /deployment.json → Contract deployment info