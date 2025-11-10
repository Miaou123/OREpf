#!/bin/bash

# ORE Game - Master Bot Controller
# Manages all 10 bots simultaneously

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if setup was run
if [ ! -f "$BOT_DIR/master_config.env" ]; then
    echo -e "${RED}Error: Bots not set up. Please run setup_bots.sh first.${NC}"
    exit 1
fi

source "$BOT_DIR/master_config.env"

# Check if run_bot.sh exists
if [ ! -f "$SCRIPT_DIR/run_bot.sh" ]; then
    echo -e "${RED}Error: run_bot.sh not found${NC}"
    exit 1
fi

chmod +x "$SCRIPT_DIR/run_bot.sh"

show_menu() {
    echo -e "${MAGENTA}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║        ORE Game - Bot Control Center                 ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}1)${NC} Start all bots (screen sessions)"
    echo -e "${CYAN}2)${NC} Start all bots (tmux sessions)"
    echo -e "${CYAN}3)${NC} Stop all bots"
    echo -e "${CYAN}4)${NC} Check bot status"
    echo -e "${CYAN}5)${NC} View bot balances"
    echo -e "${CYAN}6)${NC} Attach to bot session"
    echo -e "${CYAN}7)${NC} View bot logs (live)"
    echo -e "${CYAN}8)${NC} View bot logs (tail)"
    echo -e "${CYAN}9)${NC} Clear all logs"
    echo -e "${CYAN}0)${NC} Exit"
    echo ""
}

start_bots_screen() {
    echo -e "${BLUE}Starting all $NUM_BOTS bots in screen sessions...${NC}"
    echo ""
    
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        
        # Check if session already exists
        if screen -list | grep -q "$SESSION_NAME"; then
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        else
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Bot $i started (session: $SESSION_NAME)${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}All bots started!${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo "  View sessions: ${GREEN}screen -ls${NC}"
    echo "  Attach to bot: ${GREEN}screen -r ore-bot1${NC}"
    echo "  Detach: Press ${GREEN}Ctrl+A then D${NC}"
    echo ""
}

start_bots_tmux() {
    echo -e "${BLUE}Starting all $NUM_BOTS bots in tmux sessions...${NC}"
    echo ""
    
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        
        # Check if session already exists
        if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        else
            tmux new-session -d -s "$SESSION_NAME" "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Bot $i started (session: $SESSION_NAME)${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}All bots started!${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo "  View sessions: ${GREEN}tmux ls${NC}"
    echo "  Attach to bot: ${GREEN}tmux attach -t ore-bot1${NC}"
    echo "  Detach: Press ${GREEN}Ctrl+B then D${NC}"
    echo ""
}

stop_bots() {
    echo -e "${BLUE}Stopping all bots...${NC}"
    echo ""
    
    local stopped=0
    
    # Try screen first
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        if screen -list | grep -q "$SESSION_NAME"; then
            screen -S "$SESSION_NAME" -X quit
            echo -e "${GREEN}✓ Stopped bot $i (screen)${NC}"
            stopped=$((stopped + 1))
        fi
    done
    
    # Try tmux
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
            tmux kill-session -t "$SESSION_NAME"
            echo -e "${GREEN}✓ Stopped bot $i (tmux)${NC}"
            stopped=$((stopped + 1))
        fi
    done
    
    echo ""
    if [ $stopped -eq 0 ]; then
        echo -e "${YELLOW}No running bots found${NC}"
    else
        echo -e "${GREEN}Stopped $stopped bot(s)${NC}"
    fi
    echo ""
}

check_status() {
    echo -e "${BLUE}Bot Status:${NC}"
    echo ""
    
    local running=0
    
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        local status="${RED}●${NC} Stopped"
        
        if screen -list | grep -q "$SESSION_NAME"; then
            status="${GREEN}●${NC} Running (screen)"
            running=$((running + 1))
        elif tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
            status="${GREEN}●${NC} Running (tmux)"
            running=$((running + 1))
        fi
        
        echo -e "  Bot $i: $status"
    done
    
    echo ""
    echo -e "${CYAN}Total: $running/$NUM_BOTS running${NC}"
    echo ""
}

check_balances() {
    echo -e "${BLUE}Checking bot balances...${NC}"
    echo ""
    
    for i in $(seq 1 $NUM_BOTS); do
        KEYPAIR="$BOT_DIR/keypairs/bot$i.json"
        PUBKEY=$(solana-keygen pubkey "$KEYPAIR")
        BALANCE=$(solana balance "$KEYPAIR" --url "$RPC" 2>/dev/null | awk '{print $1}')
        
        # Color code balance
        if (( $(echo "$BALANCE < 0.1" | bc -l) )); then
            COLOR=$RED
        elif (( $(echo "$BALANCE < 0.5" | bc -l) )); then
            COLOR=$YELLOW
        else
            COLOR=$GREEN
        fi
        
        echo -e "  Bot $i: ${COLOR}${BALANCE} SOL${NC} ($PUBKEY)"
    done
    
    echo ""
}

attach_to_bot() {
    echo ""
    read -p "Enter bot number (1-$NUM_BOTS): " BOT_NUM
    
    if [ -z "$BOT_NUM" ] || [ "$BOT_NUM" -lt 1 ] || [ "$BOT_NUM" -gt "$NUM_BOTS" ]; then
        echo -e "${RED}Invalid bot number${NC}"
        return
    fi
    
    SESSION_NAME="ore-bot$BOT_NUM"
    
    if screen -list | grep -q "$SESSION_NAME"; then
        echo -e "${BLUE}Attaching to bot $BOT_NUM (screen)...${NC}"
        echo -e "${YELLOW}Press Ctrl+A then D to detach${NC}"
        sleep 2
        screen -r "$SESSION_NAME"
    elif tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        echo -e "${BLUE}Attaching to bot $BOT_NUM (tmux)...${NC}"
        echo -e "${YELLOW}Press Ctrl+B then D to detach${NC}"
        sleep 2
        tmux attach -t "$SESSION_NAME"
    else
        echo -e "${RED}Bot $BOT_NUM is not running${NC}"
    fi
}

view_logs_live() {
    echo ""
    read -p "Enter bot number (1-$NUM_BOTS) or 'all': " BOT_INPUT
    
    if [ "$BOT_INPUT" == "all" ]; then
        echo -e "${BLUE}Viewing all bot logs (press Ctrl+C to exit)...${NC}"
        sleep 1
        tail -f "$BOT_DIR"/logs/*.log
    elif [ -n "$BOT_INPUT" ] && [ "$BOT_INPUT" -ge 1 ] && [ "$BOT_INPUT" -le "$NUM_BOTS" ]; then
        LOG_FILE="$BOT_DIR/logs/bot$BOT_INPUT.log"
        if [ -f "$LOG_FILE" ]; then
            echo -e "${BLUE}Viewing bot $BOT_INPUT log (press Ctrl+C to exit)...${NC}"
            sleep 1
            tail -f "$LOG_FILE"
        else
            echo -e "${RED}Log file not found${NC}"
        fi
    else
        echo -e "${RED}Invalid input${NC}"
    fi
}

view_logs_tail() {
    echo ""
    read -p "Enter bot number (1-$NUM_BOTS): " BOT_NUM
    
    if [ -z "$BOT_NUM" ] || [ "$BOT_NUM" -lt 1 ] || [ "$BOT_NUM" -gt "$NUM_BOTS" ]; then
        echo -e "${RED}Invalid bot number${NC}"
        return
    fi
    
    LOG_FILE="$BOT_DIR/logs/bot$BOT_NUM.log"
    
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}Last 50 lines of bot $BOT_NUM log:${NC}"
        echo ""
        tail -n 50 "$LOG_FILE"
        echo ""
    else
        echo -e "${RED}Log file not found${NC}"
    fi
}

clear_logs() {
    echo ""
    read -p "Are you sure you want to clear all logs? (y/N): " CONFIRM
    
    if [ "$CONFIRM" == "y" ] || [ "$CONFIRM" == "Y" ]; then
        rm -f "$BOT_DIR"/logs/*.log
        echo -e "${GREEN}✓ All logs cleared${NC}"
    else
        echo "Cancelled"
    fi
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Select option: " CHOICE
    echo ""
    
    case $CHOICE in
        1)
            start_bots_screen
            read -p "Press Enter to continue..."
            ;;
        2)
            start_bots_tmux
            read -p "Press Enter to continue..."
            ;;
        3)
            stop_bots
            read -p "Press Enter to continue..."
            ;;
        4)
            check_status
            read -p "Press Enter to continue..."
            ;;
        5)
            check_balances
            read -p "Press Enter to continue..."
            ;;
        6)
            attach_to_bot
            ;;
        7)
            view_logs_live
            ;;
        8)
            view_logs_tail
            read -p "Press Enter to continue..."
            ;;
        9)
            clear_logs
            read -p "Press Enter to continue..."
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            sleep 1
            ;;
    esac
done