#!/bin/bash

# ORE Auto-Reset Bot
# Automatically monitors and resets rounds when they end

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Configuration
CLI_PATH="${CLI_PATH:-$HOME/ore/cli}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"  # Seconds between checks
LOG_FILE="${LOG_FILE:-$HOME/ore-reset.log}"
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-5}"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if CLI exists and load .env if present
check_cli() {
    if [ ! -d "$CLI_PATH" ]; then
        log ERROR "CLI not found at $CLI_PATH"
        log ERROR "Please set CLI_PATH environment variable or update the script"
        exit 1
    fi
    log INFO "CLI found at $CLI_PATH"
    
    # Load .env file from CLI directory if it exists
    if [ -f "$CLI_PATH/.env" ]; then
        log INFO "Loading environment from $CLI_PATH/.env"
        source "$CLI_PATH/.env"
    fi
    
    # Verify required variables are set
    if [ -z "$RPC" ]; then
        log ERROR "RPC environment variable not set"
        log ERROR "Please set it in $CLI_PATH/.env or ~/.ore-bot.env"
        exit 1
    fi
    
    if [ -z "$KEYPAIR" ]; then
        log ERROR "KEYPAIR environment variable not set"
        log ERROR "Please set it in $CLI_PATH/.env or ~/.ore-bot.env"
        exit 1
    fi
    
    log INFO "Environment variables loaded successfully"
}

# Get board status with retry logic
get_board_status() {
    local retries=0
    local output=""
    
    while [ $retries -lt $MAX_RETRIES ]; do
        cd "$CLI_PATH"
        # Export environment variables and run CLI
        output=$(COMMAND=board RPC="$RPC" KEYPAIR="$KEYPAIR" cargo run --quiet --release 2>/dev/null) && break
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            log WARNING "Failed to get board status, retry $retries/$MAX_RETRIES in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    
    if [ -z "$output" ]; then
        log ERROR "Failed to get board status after $MAX_RETRIES attempts"
        return 1
    fi
    
    echo "$output"
}

# Parse board output
parse_board() {
    local output="$1"
    
    # Extract values using grep and awk
    local round_id=$(echo "$output" | grep "Id:" | awk '{print $2}')
    local time_remaining=$(echo "$output" | grep "Time remaining:" | awk '{print $3}')
    
    # Return as space-separated values
    echo "$round_id $time_remaining"
}

# Reset round with retry logic
reset_round() {
    local round_id=$1
    local retries=0
    
    log INFO "Attempting to reset round $round_id..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        cd "$CLI_PATH"
        
        # Run reset command and capture both stdout and stderr
        local reset_output=$(COMMAND=reset RPC="$RPC" KEYPAIR="$KEYPAIR" cargo run --quiet --release 2>&1)
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log SUCCESS "Round $round_id reset successfully!"
            local next_round=$((round_id + 1))
            log SUCCESS "Started round $next_round"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            log WARNING "Reset failed (attempt $retries/$MAX_RETRIES): $reset_output"
            log WARNING "Retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        else
            log ERROR "Reset failed after $MAX_RETRIES attempts: $reset_output"
            return 1
        fi
    done
}

# Check if time is past intermission (14 seconds = 35 slots)
should_reset() {
    local time_remaining=$1
    
    # Check if time_remaining is negative (round ended)
    if [[ "$time_remaining" =~ ^-([0-9]+\.?[0-9]*)$ ]]; then
        local seconds_past=${BASH_REMATCH[1]}
        
        # Convert to integer for comparison (remove decimal if present)
        seconds_past=${seconds_past%.*}
        
        # Must be at least 14 seconds past end (INTERMISSION_SLOTS = 35 slots * 0.4 sec/slot)
        if [ "$seconds_past" -ge 14 ]; then
            return 0  # Should reset
        fi
    fi
    
    return 1  # Should not reset yet
}

# Main monitoring loop
monitor_rounds() {
    log INFO "Starting ORE auto-reset monitor..."
    log INFO "Check interval: ${CHECK_INTERVAL}s"
    log INFO "Log file: $LOG_FILE"
    echo ""
    
    local last_round_id=""
    local consecutive_errors=0
    local max_consecutive_errors=10
    local zero_time_count=0  # Track how many times we've seen 0 sec
    local zero_time_threshold=1  # Reset after seeing 0 sec this many times (14s / 30s check = ~1 check)
    
    while true; do
        local timestamp=$(date '+%H:%M:%S')
        
        # Get board status
        local board_output=$(get_board_status)
        if [ $? -ne 0 ]; then
            consecutive_errors=$((consecutive_errors + 1))
            log WARNING "Failed to get board status ($consecutive_errors consecutive errors)"
            
            if [ $consecutive_errors -ge $max_consecutive_errors ]; then
                log ERROR "Too many consecutive errors, exiting..."
                exit 1
            fi
            
            sleep $CHECK_INTERVAL
            continue
        fi
        
        # Reset error counter on success
        consecutive_errors=0
        
        # Parse board data
        read round_id time_remaining <<< $(parse_board "$board_output")
        
        # Check if we got valid data
        if [ -z "$round_id" ] || [ -z "$time_remaining" ]; then
            log WARNING "Failed to parse board data, retrying..."
            sleep $CHECK_INTERVAL
            continue
        fi
        
        # Log status based on time remaining
        if should_reset "$time_remaining"; then
            # Extract the negative number
            seconds_past=${time_remaining#-}
            seconds_past=${seconds_past%.*}
            
            log INFO "Round $round_id ended ${seconds_past}s ago - resetting now!"
            
            if reset_round "$round_id"; then
                last_round_id=$((round_id + 1))
                log SUCCESS "Successfully transitioned from round $round_id to $last_round_id"
                zero_time_count=0  # Reset counter
                echo ""
            else
                log ERROR "Failed to reset round $round_id"
            fi
            
        elif [[ "$time_remaining" =~ ^-([0-9]+\.?[0-9]*)$ ]]; then
            # Round ended but still in intermission
            seconds_past=${BASH_REMATCH[1]%.*}
            log INFO "[$timestamp] Round $round_id in intermission - ${seconds_past}s past end (need 14s)"
            zero_time_count=0  # Reset counter
            
        elif [[ "$time_remaining" == "0" ]] || [[ "$time_remaining" =~ ^0\.?0*$ ]]; then
            # Time remaining is exactly 0 - round has ended but CLI uses saturating_sub
            zero_time_count=$((zero_time_count + 1))
            local waited_seconds=$((zero_time_count * CHECK_INTERVAL))
            
            if [ $zero_time_count -ge $zero_time_threshold ]; then
                log INFO "Round $round_id at 0 sec for ${waited_seconds}s (>14s intermission) - attempting reset..."
                
                if reset_round "$round_id"; then
                    last_round_id=$((round_id + 1))
                    log SUCCESS "Successfully transitioned from round $round_id to $last_round_id"
                    zero_time_count=0  # Reset counter
                    echo ""
                else
                    log WARNING "Reset attempt failed - will retry next cycle"
                fi
            else
                log INFO "[$timestamp] Round $round_id at 0 sec (waiting ${waited_seconds}s, need ~14s for intermission)"
            fi
            
        elif [[ "$time_remaining" =~ ^[0-9]+\.?[0-9]*$ ]]; then
            # Round is active
            # Remove decimal for cleaner display
            time_display=${time_remaining%.*}
            log INFO "[$timestamp] Round $round_id active - ${time_display}s remaining"
            zero_time_count=0  # Reset counter
            
        else
            # Round waiting for first deploy
            log INFO "[$timestamp] Round $round_id waiting for first deploy..."
            zero_time_count=0  # Reset counter
        fi
        
        # Wait before next check
        sleep $CHECK_INTERVAL
    done
}

# Handle interrupt signals gracefully
cleanup() {
    log WARNING "Received interrupt signal, shutting down..."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Display banner
echo "╔════════════════════════════════════════════════════════╗"
echo "║       🤖 ORE Auto-Reset Bot v2.0                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Configuration:"
echo "  CLI Path: $CLI_PATH"
echo "  Check Interval: ${CHECK_INTERVAL}s"
echo "  Log File: $LOG_FILE"
echo "  Max Retries: $MAX_RETRIES"
echo ""

# Run checks and start monitoring
check_cli
monitor_rounds