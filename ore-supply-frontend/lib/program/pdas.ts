import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ID, BOARD_SEED, MINER_SEED, ROUND_SEED, AUTOMATION_SEED, STAKE_SEED } from './constants'

/**
 * Find the Board PDA
 */
export function findBoardPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BOARD_SEED)],
    PROGRAM_ID
  )
}

/**
 * Find the Miner PDA for a given authority
 */
export function findMinerPda(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MINER_SEED), authority.toBuffer()],
    PROGRAM_ID
  )
}

/**
 * Find the Round PDA for a given round ID
 */
export function findRoundPda(roundId: number): [PublicKey, number] {
  const roundIdBuffer = Buffer.alloc(8)
  roundIdBuffer.writeBigUInt64LE(BigInt(roundId))
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ROUND_SEED), roundIdBuffer],
    PROGRAM_ID
  )
}

/**
 * Find the Automation PDA for a given authority
 */
export function findAutomationPda(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(AUTOMATION_SEED), authority.toBuffer()],
    PROGRAM_ID
  )
}

/**
 * Find the Stake PDA for a given authority
 */
export function findStakePda(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKE_SEED), authority.toBuffer()],
    PROGRAM_ID
  )
}