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
  const roundIdBigInt = BigInt(roundId);
  const roundIdArray = new Uint8Array(8);
  
  // Write the BigInt in little-endian format (8 bytes)
  for (let i = 0; i < 8; i++) {
    roundIdArray[i] = Number((roundIdBigInt >> BigInt(i * 8)) & BigInt(0xff));
  }
  
  const roundIdBuffer = Buffer.from(roundIdArray);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ROUND_SEED), roundIdBuffer],
    PROGRAM_ID
  );
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