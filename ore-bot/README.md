# ORE Bot System

## Directory Structure

```
ore-bot/
├── keypairs/           # Bot wallet keypairs (bot1.json - bot10.json)
├── configs/            # Individual bot configurations
├── logs/               # Bot activity logs
├── scripts/            # All executable scripts
│   ├── bot_controller.sh    # Main control panel
│   ├── bot_status.sh        # Status dashboard
│   ├── fund_all_bots.sh     # Funding script
│   ├── run_bot.sh           # Individual bot runner
│   └── ...
├── master_config.env   # Global configuration
└── README.md          # This file
```

## Quick Start

1. Check/edit configuration:
   ```bash
   nano master_config.env
   ```

2. Run the control panel:
   ```bash
   ./scripts/bot_controller.sh
   ```

3. Check status:
   ```bash
   ./scripts/bot_status.sh
   ```

## Important Files

- **master_config.env** - Main configuration (RPC, paths, timing)
- **scripts/bot_controller.sh** - Interactive control panel
- **scripts/bot_status.sh** - Status dashboard
- **keypairs/** - Bot wallet files (keep secure!)
- **logs/** - Bot activity logs

