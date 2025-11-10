#!/bin/bash

# ORE Game - Test Scenario Runner
# Run specific test scenarios to validate game mechanics

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ ! -f "$BOT_DIR/master_config.env" ]; then
    echo -e "${RED}Error: Bots not set up. Run setup_bots.sh first.${NC}"
    exit 1
fi

source "$BOT_DIR/master_config.env"

show_menu() {
    clear
    echo -e "${MAGENTA}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║        ORE Game - Test Scenario Runner               ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}Test Scenarios:${NC}"
    echo ""
    echo -e "${YELLOW}1)${NC} Light Load Test (3 bots, slow pace)"
    echo -e "${YELLOW}2)${NC} Medium Load Test (5 bots, moderate pace)"
    echo -e "${YELLOW}3)${NC} Heavy Load Test (10 bots, fast pace)"
    echo -e "${YELLOW}4)${NC} Concentrated Attack (all bots, same squares)"
    echo -e "${YELLOW}5)${NC} Distributed Attack (all bots, random squares)"
    echo -e "${YELLOW}6)${NC} Single Square Focus (all bots, square #13)"
    echo -e "${YELLOW}7)${NC} Corner Strategy (bots focus on corners)"
    echo -e "${YELLOW}8)${NC} Edge Strategy (bots focus on edges)"
    echo -e "${YELLOW}9)${NC} Sequential Test (bots deploy one after another)"
    echo -e "${YELLOW}10)${NC} Stop all running tests"
    echo -e "${YELLOW}0)${NC} Exit"
    echo ""
}

wait_for_keypress() {
    echo ""
    read -p "Press Enter to continue..."
}

stop_all_tests() {
    echo -e "${BLUE}Stopping all test bots...${NC}"
    
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        screen -S "$SESSION_NAME" -X quit 2>/dev/null || true
        tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
    done
    
    echo -e "${GREEN}✓ All tests stopped${NC}"
}

run_light_load() {
    echo -e "${BLUE}Running Light Load Test...${NC}"
    echo -e "${CYAN}Configuration: 3 bots, 10-20s wait, 1-2 squares${NC}"
    echo ""
    
    export MIN_WAIT=10
    export MAX_WAIT=20
    export MIN_SQUARES=1
    export MAX_SQUARES=2
    
    for i in 1 2 3; do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Light load test started!${NC}"
    echo -e "${CYAN}Monitor with: ./bot_status.sh --watch${NC}"
}

run_medium_load() {
    echo -e "${BLUE}Running Medium Load Test...${NC}"
    echo -e "${CYAN}Configuration: 5 bots, 5-15s wait, 2-4 squares${NC}"
    echo ""
    
    export MIN_WAIT=5
    export MAX_WAIT=15
    export MIN_SQUARES=2
    export MAX_SQUARES=4
    
    for i in 1 2 3 4 5; do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Medium load test started!${NC}"
    echo -e "${CYAN}Monitor with: ./bot_status.sh --watch${NC}"
}

run_heavy_load() {
    echo -e "${BLUE}Running Heavy Load Test...${NC}"
    echo -e "${CYAN}Configuration: 10 bots, 3-10s wait, 3-5 squares${NC}"
    echo ""
    
    export MIN_WAIT=3
    export MAX_WAIT=10
    export MIN_SQUARES=3
    export MAX_SQUARES=5
    
    for i in $(seq 1 10); do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
            sleep 0.5
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Heavy load test started!${NC}"
    echo -e "${CYAN}Monitor with: ./bot_status.sh --watch${NC}"
    echo -e "${YELLOW}Warning: This will generate high transaction volume${NC}"
}

run_concentrated_attack() {
    echo -e "${BLUE}Running Concentrated Attack Test...${NC}"
    echo -e "${CYAN}Configuration: 10 bots, targeting squares 10-15${NC}"
    echo ""
    
    # Note: This requires modifying the bot script to target specific squares
    echo -e "${YELLOW}Note: This test requires custom square targeting${NC}"
    echo -e "${CYAN}For now, starting all bots with high concentration (1-2 squares)${NC}"
    
    export MIN_WAIT=5
    export MAX_WAIT=10
    export MIN_SQUARES=1
    export MAX_SQUARES=2
    
    for i in $(seq 1 10); do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
            sleep 0.3
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Concentrated attack started!${NC}"
}

run_distributed_attack() {
    echo -e "${BLUE}Running Distributed Attack Test...${NC}"
    echo -e "${CYAN}Configuration: 10 bots, maximum square coverage${NC}"
    echo ""
    
    export MIN_WAIT=5
    export MAX_WAIT=15
    export MIN_SQUARES=5
    export MAX_SQUARES=5
    
    for i in $(seq 1 10); do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
            sleep 0.3
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Distributed attack started!${NC}"
    echo -e "${CYAN}Bots will spread across maximum squares${NC}"
}

run_single_square() {
    echo -e "${BLUE}Running Single Square Focus Test...${NC}"
    echo -e "${CYAN}Testing game behavior with all bots on square #13${NC}"
    echo ""
    
    echo -e "${YELLOW}This test requires CLI manual commands:${NC}"
    echo ""
    echo "For each bot, run:"
    echo -e "${GREEN}cd $CLI_PATH${NC}"
    echo -e "${GREEN}COMMAND=deploy AMOUNT=10000000 SQUARE=12 RPC=\$RPC KEYPAIR=~/ore-game-bots/keypairs/bot1.json cargo run --release${NC}"
    echo ""
    echo "(Square 12 = #13 in 0-indexed array)"
}

run_corner_strategy() {
    echo -e "${BLUE}Running Corner Strategy Test...${NC}"
    echo -e "${CYAN}Corners: squares 1, 5, 21, 25 (indices 0, 4, 20, 24)${NC}"
    echo ""
    
    echo -e "${YELLOW}Manual deployment recommended:${NC}"
    echo "Split bots to target each corner"
}

run_edge_strategy() {
    echo -e "${BLUE}Running Edge Strategy Test...${NC}"
    echo -e "${CYAN}Testing edge square behavior${NC}"
    echo ""
    
    echo -e "${YELLOW}Edge squares: 1-5, 21-25, 1/6/11/16/21, 5/10/15/20/25${NC}"
}

run_sequential() {
    echo -e "${BLUE}Running Sequential Test...${NC}"
    echo -e "${CYAN}Starting bots one by one with 10s delay${NC}"
    echo ""
    
    export MIN_WAIT=10
    export MAX_WAIT=20
    export MIN_SQUARES=2
    export MAX_SQUARES=3
    
    for i in $(seq 1 $NUM_BOTS); do
        SESSION_NAME="ore-bot$i"
        if ! screen -list | grep -q "$SESSION_NAME"; then
            screen -dmS "$SESSION_NAME" bash -c "source $BOT_DIR/master_config.env && $SCRIPT_DIR/run_bot.sh $i"
            echo -e "${GREEN}✓ Started bot $i${NC}"
            if [ $i -lt $NUM_BOTS ]; then
                echo "  Waiting 10 seconds before next bot..."
                sleep 10
            fi
        else
            echo -e "${YELLOW}⚠ Bot $i already running${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Sequential test started!${NC}"
}

# Main loop
while true; do
    show_menu
    read -p "Select test scenario: " CHOICE
    echo ""
    
    case $CHOICE in
        1)
            run_light_load
            wait_for_keypress
            ;;
        2)
            run_medium_load
            wait_for_keypress
            ;;
        3)
            run_heavy_load
            wait_for_keypress
            ;;
        4)
            run_concentrated_attack
            wait_for_keypress
            ;;
        5)
            run_distributed_attack
            wait_for_keypress
            ;;
        6)
            run_single_square
            wait_for_keypress
            ;;
        7)
            run_corner_strategy
            wait_for_keypress
            ;;
        8)
            run_edge_strategy
            wait_for_keypress
            ;;
        9)
            run_sequential
            wait_for_keypress
            ;;
        10)
            stop_all_tests
            wait_for_keypress
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