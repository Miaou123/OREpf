#!/bin/bash

# ORE Auto-Reset Bot - Easy Installer
# This script sets up the bot with all necessary configurations

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║       ORE Auto-Reset Bot - Quick Installer            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running from correct location
if [ ! -f "ore-auto-reset.sh" ]; then
    echo -e "${RED}Error: ore-auto-reset.sh not found in current directory${NC}"
    echo "Please run this installer from the directory containing ore-auto-reset.sh"
    exit 1
fi

echo -e "${BLUE}Step 1: Making bot script executable...${NC}"
chmod +x ore-auto-reset.sh
echo -e "${GREEN}✓ Done${NC}"
echo ""

# Prompt for RPC endpoint
echo -e "${BLUE}Step 2: Configuring environment...${NC}"
echo ""

read -p "Enter your Solana RPC endpoint (e.g., https://api.mainnet-beta.solana.com): " RPC_ENDPOINT
if [ -z "$RPC_ENDPOINT" ]; then
    echo -e "${RED}Error: RPC endpoint is required${NC}"
    exit 1
fi

# Default keypair location
DEFAULT_KEYPAIR="$HOME/.config/solana/id.json"
read -p "Enter path to your keypair [$DEFAULT_KEYPAIR]: " KEYPAIR_PATH
KEYPAIR_PATH=${KEYPAIR_PATH:-$DEFAULT_KEYPAIR}

if [ ! -f "$KEYPAIR_PATH" ]; then
    echo -e "${YELLOW}Warning: Keypair file not found at $KEYPAIR_PATH${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Default CLI location
DEFAULT_CLI_PATH="$HOME/ore/cli"
read -p "Enter path to your ORE CLI directory [$DEFAULT_CLI_PATH]: " CLI_PATH
CLI_PATH=${CLI_PATH:-$DEFAULT_CLI_PATH}

if [ ! -d "$CLI_PATH" ]; then
    echo -e "${YELLOW}Warning: CLI directory not found at $CLI_PATH${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Create or update environment file
ENV_FILE="$HOME/.ore-bot.env"
echo -e "${BLUE}Creating environment file at $ENV_FILE${NC}"

cat > "$ENV_FILE" << EOF
# ORE Auto-Reset Bot Configuration
# Source this file before running the bot: source ~/.ore-bot.env

# Required
export RPC="$RPC_ENDPOINT"
export KEYPAIR="$KEYPAIR_PATH"

# Optional (with defaults)
export CLI_PATH="$CLI_PATH"
export CHECK_INTERVAL="30"
export LOG_FILE="$HOME/ore-reset.log"
export MAX_RETRIES="3"
export RETRY_DELAY="5"
EOF

echo -e "${GREEN}✓ Environment file created${NC}"
echo ""

# Add to .bashrc if not already there
if ! grep -q ".ore-bot.env" "$HOME/.bashrc" 2>/dev/null; then
    echo -e "${BLUE}Step 3: Adding to .bashrc for automatic loading...${NC}"
    echo "" >> "$HOME/.bashrc"
    echo "# ORE Bot environment variables" >> "$HOME/.bashrc"
    echo "if [ -f ~/.ore-bot.env ]; then" >> "$HOME/.bashrc"
    echo "    source ~/.ore-bot.env" >> "$HOME/.bashrc"
    echo "fi" >> "$HOME/.bashrc"
    echo -e "${GREEN}✓ Added to .bashrc${NC}"
else
    echo -e "${YELLOW}Note: .ore-bot.env already referenced in .bashrc${NC}"
fi
echo ""

# Ask about systemd service
echo -e "${BLUE}Step 4: Systemd service setup (optional)${NC}"
read -p "Would you like to set up the bot as a systemd service? (y/n): " SETUP_SERVICE

if [ "$SETUP_SERVICE" = "y" ]; then
    # Create systemd user directory if it doesn't exist
    mkdir -p "$HOME/.config/systemd/user"
    
    # Copy and update service file
    SERVICE_FILE="$HOME/.config/systemd/user/ore-auto-reset.service"
    
    # Create service file with current user's settings
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=ORE Auto-Reset Bot
After=network.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$HOME
ExecStart=/bin/bash $PWD/ore-auto-reset.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Environment variables
Environment="CLI_PATH=$CLI_PATH"
Environment="CHECK_INTERVAL=30"
Environment="LOG_FILE=$HOME/ore-reset.log"
Environment="MAX_RETRIES=3"
Environment="RETRY_DELAY=5"
Environment="RPC=$RPC_ENDPOINT"
Environment="KEYPAIR=$KEYPAIR_PATH"

[Install]
WantedBy=default.target
EOF
    
    echo -e "${GREEN}✓ Service file created${NC}"
    
    # Reload systemd
    systemctl --user daemon-reload
    echo -e "${GREEN}✓ Systemd reloaded${NC}"
    
    # Ask if they want to enable and start now
    read -p "Enable and start the service now? (y/n): " START_NOW
    if [ "$START_NOW" = "y" ]; then
        systemctl --user enable ore-auto-reset.service
        systemctl --user start ore-auto-reset.service
        echo -e "${GREEN}✓ Service enabled and started${NC}"
        echo ""
        echo "Check status with: systemctl --user status ore-auto-reset.service"
        echo "View logs with: journalctl --user -u ore-auto-reset.service -f"
    else
        echo ""
        echo "To start the service later, run:"
        echo "  systemctl --user enable ore-auto-reset.service"
        echo "  systemctl --user start ore-auto-reset.service"
    fi
else
    echo ""
    echo "You can set up the service later by running:"
    echo "  cp ore-auto-reset.service ~/.config/systemd/user/"
    echo "  systemctl --user daemon-reload"
    echo "  systemctl --user enable ore-auto-reset.service"
    echo "  systemctl --user start ore-auto-reset.service"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Installation Complete! 🎉                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Load environment variables:"
echo "   ${YELLOW}source ~/.ore-bot.env${NC}"
echo ""
echo "2. Test the bot:"
echo "   ${YELLOW}./ore-auto-reset.sh${NC}"
echo ""
echo "3. Or run in screen session:"
echo "   ${YELLOW}screen -S ore-bot${NC}"
echo "   ${YELLOW}./ore-auto-reset.sh${NC}"
echo "   (Detach with Ctrl+A then D)"
echo ""

if [ "$SETUP_SERVICE" = "y" ] && [ "$START_NOW" = "y" ]; then
    echo "Your bot is already running as a service!"
    echo ""
    echo "Useful commands:"
    echo "  Status:  ${YELLOW}systemctl --user status ore-auto-reset.service${NC}"
    echo "  Logs:    ${YELLOW}journalctl --user -u ore-auto-reset.service -f${NC}"
    echo "  Stop:    ${YELLOW}systemctl --user stop ore-auto-reset.service${NC}"
    echo "  Restart: ${YELLOW}systemctl --user restart ore-auto-reset.service${NC}"
fi

echo ""
echo "For more information, see README.md"
echo ""