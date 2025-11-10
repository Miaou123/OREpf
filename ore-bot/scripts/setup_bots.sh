#!/bin/bash

# ORE Game - 10 Bot Setup Script
# This script creates 10 bots with unique keypairs for testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║          ORE Game - 10 Bot Setup Script             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
NUM_BOTS=10
BOT_DIR="$HOME/ore-game-bots"
CLI_PATH="${CLI_PATH:-$HOME/ore/cli}"

# Check for solana CLI
if ! command -v solana &> /dev/null; then
    echo -e "${RED}Error: Solana CLI not found. Please install it first:${NC}"
    echo "  sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

echo -e "${BLUE}Step 1: Creating bot directory structure...${NC}"
mkdir -p "$BOT_DIR"
mkdir -p "$BOT_DIR/keypairs"
mkdir -p "$BOT_DIR/logs"
mkdir -p "$BOT_DIR/configs"

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Prompt for RPC endpoint
echo -e "${BLUE}Step 2: Configuration${NC}"
read -p "Enter your Solana RPC endpoint: " RPC_ENDPOINT
if [ -z "$RPC_ENDPOINT" ]; then
    echo -e "${RED}Error: RPC endpoint is required${NC}"
    exit 1
fi

# CLI path verification
if [ ! -d "$CLI_PATH" ]; then
    echo -e "${YELLOW}Warning: CLI not found at $CLI_PATH${NC}"
    read -p "Enter path to your ORE CLI directory: " CLI_PATH
    if [ ! -d "$CLI_PATH" ]; then
        echo -e "${RED}Error: CLI directory not found${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 3: Generating $NUM_BOTS bot keypairs...${NC}"
echo ""

# Array to store public keys for funding instructions
declare -a BOT_PUBKEYS

for i in $(seq 1 $NUM_BOTS); do
    BOT_NAME="bot$i"
    KEYPAIR_PATH="$BOT_DIR/keypairs/$BOT_NAME.json"
    
    # Generate keypair
    solana-keygen new --no-bip39-passphrase --silent --outfile "$KEYPAIR_PATH" > /dev/null 2>&1
    
    # Get public key
    PUBKEY=$(solana-keygen pubkey "$KEYPAIR_PATH")
    BOT_PUBKEYS[$i]=$PUBKEY
    
    echo -e "${GREEN}✓ Bot $i${NC}"
    echo -e "  ${CYAN}Pubkey:${NC} $PUBKEY"
    echo -e "  ${CYAN}Keypair:${NC} $KEYPAIR_PATH"
    echo ""
done

echo -e "${GREEN}✓ All keypairs generated${NC}"
echo ""

# Create master config file
echo -e "${BLUE}Step 4: Creating configuration files...${NC}"

# Master config
cat > "$BOT_DIR/master_config.env" << EOF
# Master Configuration for ORE Game Bots
# Generated: $(date)

# RPC Configuration
export RPC="$RPC_ENDPOINT"

# CLI Path
export CLI_PATH="$CLI_PATH"

# Bot Configuration
export NUM_BOTS=$NUM_BOTS
export BOT_DIR="$BOT_DIR"

# Game Settings
export MIN_DEPLOY_AMOUNT=0.01
export MAX_DEPLOY_AMOUNT=0.1
export MIN_SQUARES=1
export MAX_SQUARES=5

# Timing (in seconds)
export MIN_WAIT=5
export MAX_WAIT=30
export CHECK_INTERVAL=10
EOF

# Individual bot configs
for i in $(seq 1 $NUM_BOTS); do
    BOT_NAME="bot$i"
    cat > "$BOT_DIR/configs/$BOT_NAME.env" << EOF
# Configuration for $BOT_NAME
export BOT_NAME="$BOT_NAME"
export BOT_ID=$i
export KEYPAIR="$BOT_DIR/keypairs/$BOT_NAME.json"
export LOG_FILE="$BOT_DIR/logs/$BOT_NAME.log"
EOF
done

echo -e "${GREEN}✓ Configuration files created${NC}"
echo ""

# Display funding instructions
echo -e "${YELLOW}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║              FUNDING INSTRUCTIONS                     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}Please fund the following addresses:${NC}"
echo ""

for i in $(seq 1 $NUM_BOTS); do
    echo -e "${GREEN}Bot $i:${NC} ${BOT_PUBKEYS[$i]}"
done

echo ""
echo -e "${YELLOW}Recommended: 1-5 SOL per bot for testing${NC}"
echo ""
echo -e "${CYAN}Example funding command:${NC}"
echo "  solana transfer ${BOT_PUBKEYS[1]} 2 --allow-unfunded-recipient"
echo ""

# Create quick funding script
cat > "$BOT_DIR/fund_all_bots.sh" << 'EOF'
#!/bin/bash
# Quick script to fund all bots with the same amount

if [ -z "$1" ]; then
    echo "Usage: ./fund_all_bots.sh <amount_in_sol>"
    echo "Example: ./fund_all_bots.sh 2"
    exit 1
fi

AMOUNT=$1
source master_config.env

echo "Funding $NUM_BOTS bots with $AMOUNT SOL each..."
echo ""

for i in $(seq 1 $NUM_BOTS); do
    KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
    PUBKEY=$(solana-keygen pubkey "$KEYPAIR")
    
    echo "Funding Bot $i ($PUBKEY)..."
    solana transfer "$PUBKEY" "$AMOUNT" --allow-unfunded-recipient
    echo ""
done

echo "✓ All bots funded!"
EOF

chmod +x "$BOT_DIR/fund_all_bots.sh"

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║             Setup Complete! 🎉                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}Bot directory:${NC} $BOT_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Fund all bots using the quick script:"
echo "   ${GREEN}cd $BOT_DIR && ./fund_all_bots.sh 2${NC}"
echo ""
echo "2. Or fund individually:"
echo "   ${GREEN}solana transfer <bot_pubkey> <amount> --allow-unfunded-recipient${NC}"
echo ""
echo "3. After funding, proceed to create the bot runners:"
echo "   ${GREEN}Run the create_bot_runners.sh script${NC}"
echo ""
echo -e "${BLUE}Keypairs location:${NC} $BOT_DIR/keypairs/"
echo -e "${BLUE}Config location:${NC} $BOT_DIR/configs/"
echo -e "${BLUE}Logs location:${NC} $BOT_DIR/logs/"
echo ""