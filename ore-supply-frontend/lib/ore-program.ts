import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'

// ORE Program ID from the backend
export const ORE_PROGRAM_ID = new PublicKey('oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp')

// Constants from the backend
export const TREASURY_ADDRESS = new PublicKey('6Zo1j1LqrwDMFbKJtH3m3XQPfFKwmtcvPpxEnAh8bxiH')
export const MINT_ADDRESS = new PublicKey('oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp')
export const CONFIG_ADDRESS = new PublicKey('Config1111111111111111111111111111111111111')

export interface MiningStats {
  totalMined: BN
  currentRound: number
  difficulty: BN
  reward: BN
}

export class OreProgram {
  connection: Connection
  
  constructor(connection: Connection) {
    this.connection = connection
  }

  async getMiningStats(): Promise<MiningStats> {
    // TODO: Fetch actual mining stats from the program
    return {
      totalMined: new BN(1234567),
      currentRound: 42,
      difficulty: new BN(987654),
      reward: new BN(1000000000000) // 1 ORE with 11 decimals
    }
  }

  async startMining(wallet: PublicKey): Promise<Transaction> {
    // TODO: Build actual mining transaction
    const transaction = new Transaction()
    
    // Placeholder - actual implementation would interact with the ORE program
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet,
        toPubkey: TREASURY_ADDRESS,
        lamports: 1000000, // 0.001 SOL for fees
      })
    )
    
    return transaction
  }

  async claimRewards(wallet: PublicKey): Promise<Transaction> {
    // TODO: Build actual claim transaction
    const transaction = new Transaction()
    
    return transaction
  }

  async getActiveMiners(): Promise<number> {
    // TODO: Fetch actual active miners count
    return 5432
  }

  async getTotalSupply(): Promise<BN> {
    // TODO: Fetch actual total supply
    return new BN(1234567000000000000) // with 11 decimals
  }
}