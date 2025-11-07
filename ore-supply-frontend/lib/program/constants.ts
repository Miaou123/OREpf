import { PublicKey } from '@solana/web3.js'

// IMPORTANT: Replace this with your actual deployed program ID
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE')

// Use devnet for testing, mainnet for production
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'

// PDA Seeds (from your Rust program)
export const BOARD_SEED = 'board'
export const MINER_SEED = 'miner'
export const ROUND_SEED = 'round'
export const AUTOMATION_SEED = 'automation'
export const STAKE_SEED = 'stake'

// Constants
export const LAMPORTS_PER_SOL = 1_000_000_000
export const BOARD_SIZE = 25 // 5x5 grid

// Helper to convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL)
}

// Helper to convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}