#!/bin/bash

# ORE Game - Fund All Bots Script
# Quick script to fund all bots with the same amount

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if bots are set up
if [ ! -d "$BOT_DIR/keypairs" ]; then
    echo -e "${RED}Error: Bot keypairs not found.${NC}"
    echo -e "${YELLOW}Please run setup_bots.sh first to generate the bots.${NC}"
    exit 1
fi

# Check if amount provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./fund_all_bots.sh <amount_in_sol>${NC}"
    echo -e "${CYAN}Example: ./fund_all_bots.sh 2${NC}"
    echo ""
    echo "This will fund each bot with the specified amount of SOL."
    echo "Recommended: 1-5 SOL per bot for testing"
    exit 1
fi

AMOUNT=$1

# Validate amount is a number
if ! [[ "$AMOUNT" =~ ^[0-9]+\.?[0-9]*$ ]]; then
    echo -e "${RED}Error: Invalid amount. Please provide a number.${NC}"
    exit 1
fi

# Load config to get NUM_BOTS
if [ -f "$BOT_DIR/master_config.env" ]; then
    source "$BOT_DIR/master_config.env"
else
    # Default to 10 if config not found
    NUM_BOTS=10
fi

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║          Funding All Bots                            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}Amount per bot:${NC} $AMOUNT SOL"
echo -e "${CYAN}Total bots:${NC} $NUM_BOTS"
echo -e "${CYAN}Total cost:${NC} $(echo "$AMOUNT * $NUM_BOTS" | bc) SOL"
echo ""

read -p "Continue? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Funding bots...${NC}"
echo ""

success_count=0
fail_count=0

for i in $(seq 1 $NUM_BOTS); do
    KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
    
    if [ ! -f "$KEYPAIR" ]; then
        echo -e "${RED}✗ Bot $i: Keypair not found${NC}"
        fail_count=$((fail_count + 1))
        continue
    fi
    
    PUBKEY=$(solana-keygen pubkey "$KEYPAIR")
    
    echo -e "${CYAN}Funding Bot $i...${NC}"
    echo -e "  Address: $PUBKEY"
    
    # Try to fund
    if solana transfer "$PUBKEY" "$AMOUNT" --allow-unfunded-recipient --keypair ~/.config/solana/id.json 2>/dev/null; then
        echo -e "${GREEN}  ✓ Success!${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}  ✗ Failed${NC}"
        echo -e "${YELLOW}  Note: Make sure you have enough SOL in your main wallet${NC}"
        fail_count=$((fail_count + 1))
    fi
    
    echo ""
    
    # Small delay to avoid overwhelming RPC
    sleep 1
done

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Funding Summary                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Success:${NC} $success_count bots"
echo -e "  ${RED}Failed:${NC}  $fail_count bots"
echo ""

if [ $success_count -gt 0 ]; then
    echo -e "${GREEN}✓ Funded $success_count bot(s) successfully!${NC}"
    echo ""
    echo "Check balances with:"
    echo -e "  ${CYAN}./bot_status.sh${NC}"
    echo ""
fi

if [ $fail_count -gt 0 ]; then
    echo -e "${YELLOW}⚠ $fail_count bot(s) failed to fund${NC}"
    echo ""
    echo "Common issues:"
    echo "  • Not enough SOL in your main wallet"
    echo "  • RPC connection issues"
    echo "  • Wrong keypair path"
    echo ""
    echo "Try funding individually:"
    echo -e "  ${CYAN}solana transfer <bot_address> $AMOUNT --allow-unfunded-recipient${NC}"
    echo ""
fi

# Offer to check balances
if [ $success_count -gt 0 ]; then
    read -p "Would you like to check bot balances now? (y/N): " CHECK_BALANCE
    
    if [ "$CHECK_BALANCE" == "y" ] || [ "$CHECK_BALANCE" == "Y" ]; then
        echo ""
        echo -e "${BLUE}Bot Balances:${NC}"
        echo ""
        for i in $(seq 1 $NUM_BOTS); do
            KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
            if [ -f "$KEYPAIR" ]; then
                BALANCE=$(solana balance "$KEYPAIR" 2>/dev/null | awk '{print $1}')
                echo -e "  Bot $i: ${GREEN}$BALANCE SOL${NC}"
            fi
        done
        echo ""
    fi
fi