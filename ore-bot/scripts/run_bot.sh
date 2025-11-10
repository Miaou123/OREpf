#!/bin/bash

# ORE Game - Individual Bot Runner
# This script runs a single bot that randomly deploys to game squares

set -euo pipefail

# Get script directory and bot root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load master config
if [ -f "$BOT_ROOT/master_config.env" ]; then
    source "$BOT_ROOT/master_config.env"
else
    echo "ERROR: Master config not found at $BOT_ROOT/master_config.env"
    exit 1
fi

# Override BOT_DIR to use current location
export BOT_DIR="$BOT_ROOT"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$BOT_ROOT/master_config.env" ]; then
    source "$BOT_ROOT/master_config.env"
else
    echo "ERROR: Master config not found. Run setup_bots.sh first."
    exit 1
fi

# Check if bot config is provided
if [ -z "$1" ]; then
    echo "Usage: ./run_bot.sh <bot_number>"
    echo "Example: ./run_bot.sh 1"
    exit 1
fi

BOT_NUM=$1
BOT_CONFIG="$BOT_DIR/configs/bot$BOT_NUM.env"

# Load bot config
if [ ! -f "$BOT_CONFIG" ]; then
    echo "ERROR: Bot config not found: $BOT_CONFIG"
    exit 1
fi

source "$BOT_CONFIG"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Get random number in range
random_in_range() {
    local min=$1
    local max=$2
    echo $(( RANDOM % (max - min + 1) + min ))
}

# Get random wait time
get_random_wait() {
    echo $(random_in_range $MIN_WAIT $MAX_WAIT)
}

# Generate random squares array (1-25)
generate_random_squares() {
    local num_squares=$1
    local squares=()
    
    # Generate array of available squares
    local available=($(seq 1 25))
    
    # Shuffle and select
    for i in $(seq 1 $num_squares); do
        local idx=$(( RANDOM % ${#available[@]} ))
        squares+=(${available[$idx]})
        # Remove selected square
        available=(${available[@]:0:$idx} ${available[@]:$((idx + 1))})
    done
    
    echo "${squares[@]}"
}

# Check board status
get_board_status() {
    cd "$CLI_PATH"
    local output=$(COMMAND=board RPC="$RPC" KEYPAIR="$KEYPAIR" cargo run --quiet --release 2>/dev/null)
    
    if [ -z "$output" ]; then
        return 1
    fi
    
    echo "$output"
}

# Get balance
get_balance() {
    solana balance "$KEYPAIR" --url "$RPC" 2>/dev/null | awk '{print $1}'
}

# Deploy to game
deploy_to_squares() {
    local amount=$1
    local square=$2
    
    cd "$CLI_PATH"
    
    log INFO "Deploying $amount SOL to square $square..."
    
    # Run deploy command
    local result=$(COMMAND=deploy AMOUNT=$(echo "$amount * 1000000000" | bc | cut -d'.' -f1) SQUARE=$square RPC="$RPC" KEYPAIR="$KEYPAIR" cargo run --quiet --release 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log SUCCESS "Successfully deployed to square $square!"
        return 0
    else
        log ERROR "Failed to deploy: $result"
        return 1
    fi
}

# Main bot loop
run_bot() {
    log INFO "🤖 Starting $BOT_NAME..."
    log INFO "Keypair: $KEYPAIR"
    log INFO "RPC: $RPC"
    echo ""
    
    # Check initial balance
    local balance=$(get_balance)
    log INFO "Initial balance: $balance SOL"
    
    if (( $(echo "$balance < 0.1" | bc -l) )); then
        log WARNING "Low balance! Please fund this bot."
    fi
    
    echo ""
    log INFO "Bot is now active and will deploy randomly to squares..."
    echo ""
    
    local round_count=0
    
    while true; do
        # Check if we have enough balance
        balance=$(get_balance)
        
        if (( $(echo "$balance < 0.05" | bc -l) )); then
            log WARNING "Balance too low ($balance SOL). Waiting for funding..."
            sleep 60
            continue
        fi
        
        # Get board status
        board_status=$(get_board_status)
        if [ $? -ne 0 ]; then
            log WARNING "Failed to get board status, retrying..."
            sleep $CHECK_INTERVAL
            continue
        fi
        
        # Extract round info
        round_id=$(echo "$board_status" | grep "Id:" | awk '{print $2}')
        time_remaining=$(echo "$board_status" | grep "Time remaining:" | awk '{print $3}')
        
        log INFO "Round #$round_id - Time remaining: ${time_remaining}s - Balance: $balance SOL"
        
        # Check if round is active (time > 0)
        if [[ "$time_remaining" =~ ^[0-9]+$ ]] && [ "$time_remaining" -gt 0 ]; then
            # Random deployment amount (in SOL)
            deploy_amount=$(echo "scale=4; ($RANDOM % 90 + 10) / 1000" | bc)
            
            # Ensure minimum
            if (( $(echo "$deploy_amount < $MIN_DEPLOY_AMOUNT" | bc -l) )); then
                deploy_amount=$MIN_DEPLOY_AMOUNT
            fi
            
            # Random number of squares (we'll deploy one at a time)
            num_squares=$(random_in_range $MIN_SQUARES $MAX_SQUARES)
            
            # Generate random squares
            squares=($(generate_random_squares $num_squares))
            
            log INFO "Planning to deploy $deploy_amount SOL to $num_squares squares: ${squares[@]}"
            
            # Deploy to each square
            for square_id in "${squares[@]}"; do
                # Convert square ID to 0-indexed (1-25 -> 0-24)
                square_idx=$((square_id - 1))
                
                deploy_to_squares "$deploy_amount" "$square_idx"
                
                # Small delay between deployments
                sleep 2
            done
            
            round_count=$((round_count + 1))
            log SUCCESS "Completed deployment #$round_count"
            
            # Random wait before next deployment
            wait_time=$(get_random_wait)
            log INFO "Waiting $wait_time seconds before next deployment..."
            sleep $wait_time
        else
            log INFO "Round waiting or ended. Checking again in $CHECK_INTERVAL seconds..."
            sleep $CHECK_INTERVAL
        fi
    done
}

# Handle interrupt signals
cleanup() {
    log WARNING "Received interrupt signal. Shutting down $BOT_NAME..."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Display banner
echo "╔══════════════════════════════════════════════════════╗"
echo "║           🤖 ORE Game Bot v1.0                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Bot Name: $BOT_NAME"
echo "Bot ID: $BOT_ID"
echo "Log File: $LOG_FILE"
echo ""

# Run the bot
run_bot