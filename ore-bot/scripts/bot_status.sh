#!/bin/bash

# ORE Game - Quick Bot Status Checker
# Quick overview of all bot statuses, balances, and activity

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Check if setup was run
if [ ! -f "$BOT_DIR/master_config.env" ]; then
    echo -e "${RED}Error: Bots not set up. Run setup_bots.sh first.${NC}"
    exit 1
fi

source "$BOT_DIR/master_config.env"

clear

echo -e "${MAGENTA}${BOLD}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║              ORE Game - Bot Status Dashboard                       ║"
echo "║                $(date '+%Y-%m-%d %H:%M:%S')                              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Summary counters
running_count=0
total_balance=0
total_deployments=0

echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}${BOLD}│  Bot Status & Balances                                          │${NC}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

for i in $(seq 1 $NUM_BOTS); do
    KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
    SESSION_NAME="ore-bot$i"
    
    # Check if running
    if screen -list 2>/dev/null | grep -q "$SESSION_NAME" || tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        status="${GREEN}●${NC} Running"
        running_count=$((running_count + 1))
    else
        status="${RED}●${NC} Stopped"
    fi
    
    # Get balance
    if [ -f "$KEYPAIR" ]; then
        balance=$(solana balance "$KEYPAIR" --url "$RPC" 2>/dev/null | awk '{print $1}')
        
        # Color code balance
        if (( $(echo "$balance < 0.1" | bc -l) )); then
            balance_color=$RED
        elif (( $(echo "$balance < 0.5" | bc -l) )); then
            balance_color=$YELLOW
        else
            balance_color=$GREEN
        fi
        
        # Add to total
        total_balance=$(echo "$total_balance + $balance" | bc)
        
        balance_display="${balance_color}${balance} SOL${NC}"
    else
        balance_display="${RED}N/A${NC}"
        balance=0
    fi
    
    # Get deployment count from logs
    if [ -f "$BOT_DIR/logs/bot$i.log" ]; then
        deployments=$(grep -c "Successfully deployed" "$BOT_DIR/logs/bot$i.log" 2>/dev/null || echo 0)
        total_deployments=$((total_deployments + deployments))
    else
        deployments=0
    fi
    
    # Get last activity
    if [ -f "$BOT_DIR/logs/bot$i.log" ]; then
        last_activity=$(tail -n 1 "$BOT_DIR/logs/bot$i.log" 2>/dev/null | cut -d']' -f1 | cut -d'[' -f2 || echo "N/A")
    else
        last_activity="N/A"
    fi
    
    # Print bot info
    printf "  ${BOLD}Bot %2d${NC} │ %b │ %b │ ${CYAN}%4d deploys${NC}\n" \
        "$i" "$status" "$balance_display" "$deployments"
done

echo ""
echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}${BOLD}│  Summary Statistics                                             │${NC}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

# Calculate percentages
running_percent=$((running_count * 100 / NUM_BOTS))

echo -e "  ${BOLD}Running Bots:${NC}       ${GREEN}$running_count${NC}/${NUM_BOTS} (${running_percent}%)"
echo -e "  ${BOLD}Total Balance:${NC}      ${CYAN}$(printf "%.4f" $total_balance) SOL${NC}"
echo -e "  ${BOLD}Avg Balance/Bot:${NC}    ${CYAN}$(echo "scale=4; $total_balance / $NUM_BOTS" | bc) SOL${NC}"
echo -e "  ${BOLD}Total Deployments:${NC}  ${MAGENTA}$total_deployments${NC}"

echo ""
echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}${BOLD}│  Recent Activity (Last 5 actions across all bots)              │${NC}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

# Show last 5 successful deployments across all bots
if ls "$BOT_DIR"/logs/*.log > /dev/null 2>&1; then
    grep "SUCCESS.*deployed" "$BOT_DIR"/logs/*.log 2>/dev/null | tail -n 5 | while IFS= read -r line; do
        # Extract bot number from filename
        bot_num=$(echo "$line" | grep -oP 'bot\K[0-9]+')
        # Extract timestamp and message
        timestamp=$(echo "$line" | cut -d']' -f1 | cut -d'[' -f2)
        message=$(echo "$line" | cut -d']' -f3-)
        
        echo -e "  ${GREEN}[Bot $bot_num]${NC} ${CYAN}$timestamp${NC} $message"
    done
else
    echo -e "  ${YELLOW}No activity logs found${NC}"
fi

echo ""
echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}${BOLD}│  Warnings & Alerts                                              │${NC}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

# Check for warnings
warnings_found=false

# Low balance warnings
for i in $(seq 1 $NUM_BOTS); do
    KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
    if [ -f "$KEYPAIR" ]; then
        balance=$(solana balance "$KEYPAIR" --url "$RPC" 2>/dev/null | awk '{print $1}')
        if (( $(echo "$balance < 0.1" | bc -l) )); then
            echo -e "  ${RED}⚠${NC} Bot $i has low balance: ${RED}$balance SOL${NC}"
            warnings_found=true
        fi
    fi
done

# Stopped bots
stopped_count=$((NUM_BOTS - running_count))
if [ $stopped_count -gt 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} $stopped_count bot(s) are stopped"
    warnings_found=true
fi

# Recent errors in logs
error_count=$(grep -c "ERROR" "$BOT_DIR"/logs/*.log 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
if [ "$error_count" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} $error_count error(s) found in logs"
    warnings_found=true
fi

if [ "$warnings_found" = false ]; then
    echo -e "  ${GREEN}✓${NC} No warnings - all systems operational!"
fi

echo ""
echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}${BOLD}│  Quick Actions                                                  │${NC}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  ${BOLD}Full Controller:${NC}      ${GREEN}./bot_controller.sh${NC}"
echo -e "  ${BOLD}View Live Logs:${NC}       ${GREEN}tail -f ~/ore-game-bots/logs/*.log${NC}"
echo -e "  ${BOLD}Check Balance:${NC}        ${GREEN}solana balance ~/ore-game-bots/keypairs/bot1.json${NC}"
echo -e "  ${BOLD}Attach to Bot:${NC}        ${GREEN}screen -r ore-bot1${NC}"
echo ""

# Option to auto-refresh
if [ "$1" == "--watch" ] || [ "$1" == "-w" ]; then
    echo -e "${YELLOW}Refreshing in 5 seconds... (Press Ctrl+C to stop)${NC}"
    sleep 5
    exec "$0" --watch
fi