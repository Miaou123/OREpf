# ORE Supply Frontend

A Next.js clone of the ore.supply website for mining ORE cryptocurrency on Solana.

## Features

- 🔐 Solana wallet integration (Phantom, Solflare, etc.)
- ⛏️ Mining interface 
- 📊 Real-time network statistics
- 🎨 Dark theme matching ore.supply aesthetic
- 📱 Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build Issue Resolution

If you encounter a Tailwind CSS error, the project is already configured with the new `@tailwindcss/postcss` plugin for Next.js 16 compatibility.

## Project Structure

```
ore-supply-frontend/
├── app/
│   ├── layout.tsx      # Root layout with wallet provider
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with Tailwind
├── components/
│   ├── Header.tsx      # Navigation with wallet connection
│   ├── Hero.tsx        # Landing section
│   ├── Stats.tsx       # Network statistics
│   ├── MiningInterface.tsx # Mining controls
│   ├── Features.tsx    # Feature cards
│   └── WalletContextProvider.tsx # Solana wallet setup
├── lib/
│   └── ore-program.ts  # ORE program integration
└── public/
```

## Integration with ORE Backend

The `lib/ore-program.ts` file contains the interface for connecting to the ORE Solana program. To fully integrate:

1. Update the program ID and addresses in `lib/ore-program.ts`
2. Implement the actual mining logic 
3. Connect to the Solana RPC endpoint
4. Add transaction signing and submission

## Technologies Used

- Next.js 16 (with Turbopack)
- TypeScript
- Tailwind CSS (with @tailwindcss/postcss)
- Solana Web3.js
- Solana Wallet Adapter
- Anchor Framework

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```