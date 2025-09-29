# Suggested Commands

## Docker Operations
```bash
# Start main services
docker compose up -d

# Start Blockscout
docker compose -f docker-compose.blockscout.yml up -d

# Check service status
docker compose ps
docker compose -f docker-compose.blockscout.yml ps

# View logs
docker compose logs [service-name]
docker compose -f docker-compose.blockscout.yml logs [service-name]

# Restart specific service
docker compose restart [service-name]

# Stop all services
docker compose down
docker compose -f docker-compose.blockscout.yml down
```

## Development Commands
```bash
# Test endpoints
curl http://localhost:8080/explorer/
curl http://localhost:8080/rpc
curl http://localhost:4000  # Direct Blockscout access

# Git operations
git status
git add .
git commit -m "message"
```

## Directory Structure
- `1b/` - Main project directory
- `1b/caddy/` - Caddy configuration
- `1b/blockscout/` - Blockscout Docker setup
- `1b/geth/` - Geth configuration
- `1b/geth-init/` - Initialization scripts