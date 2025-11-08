import { 
  PublicKey, 
  TransactionInstruction, 
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js'
import { PROGRAM_ID, solToLamports } from './constants'
import { findBoardPda, findMinerPda, findRoundPda, findAutomationPda } from './pdas'

// ============================================
// BROWSER-COMPATIBLE BUFFER HELPERS
// ============================================

/**
 * Write a BigUInt64 in little-endian format (browser-compatible)
 */
function writeBigUInt64LE(buffer: Buffer, value: bigint, offset: number = 0): void {
  const bigIntValue = BigInt(value);
  for (let i = 0; i < 8; i++) {
    buffer[offset + i] = Number((bigIntValue >> BigInt(i * 8)) & BigInt(0xff));
  }
}

/**
 * Write a UInt32 in little-endian format (browser-compatible)
 */
function writeUInt32LE(buffer: Buffer, value: number, offset: number = 0): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
}

/**
 * Write a UInt8 (browser-compatible)
 */
function writeUInt8(buffer: Buffer, value: number, offset: number = 0): void {
  buffer[offset] = value & 0xff;
}

// ============================================
// INSTRUCTION BUILDERS
// ============================================

/**
 * Build a Deploy instruction
 * @param signer - The wallet signing the transaction
 * @param authority - The authority (usually same as signer)
 * @param amountSol - Amount in SOL to deploy per square
 * @param squares - Array of 25 booleans indicating which squares to deploy to
 * @param roundId - Current round ID
 */
export function createDeployInstruction(
  signer: PublicKey,
  authority: PublicKey,
  amountSol: number,
  squares: boolean[],
  roundId: number
): TransactionInstruction {
  if (squares.length !== 25) {
    throw new Error('Squares array must have exactly 25 elements')
  }

  // Convert SOL to lamports
  const amount = solToLamports(amountSol)

  // Convert boolean array to 32-bit mask
  let mask = 0
  for (let i = 0; i < 25; i++) {
    if (squares[i]) {
      mask |= (1 << i)
    }
  }

  // Find PDAs
  const [boardPda] = findBoardPda()
  const [minerPda] = findMinerPda(authority)
  const [roundPda] = findRoundPda(roundId)
  const [automationPda] = findAutomationPda(authority)

  // Entropy var PDA (if using entropy-api)
  // This is a placeholder - adjust based on your entropy implementation
  const entropyVarPda = PublicKey.default

  // Create instruction data: [u8 discriminator, u64 amount, u32 mask]
  const instructionData = Buffer.alloc(13)
  
  // Use browser-compatible write functions
  writeUInt8(instructionData, 6, 0)                    // Deploy instruction discriminator
  writeBigUInt64LE(instructionData, BigInt(amount), 1) // Amount in lamports (8 bytes)
  writeUInt32LE(instructionData, mask, 9)              // Square mask (4 bytes)

  return new TransactionInstruction({
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: authority, isSigner: false, isWritable: true },
      { pubkey: automationPda, isSigner: false, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: minerPda, isSigner: false, isWritable: true },
      { pubkey: roundPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: entropyVarPda, isSigner: false, isWritable: true },
      // Add entropy program ID if needed
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Helper to create a squares array from selected indices
 * @param selectedIndices - Array of selected square indices (0-24)
 */
export function createSquaresArray(selectedIndices: number[]): boolean[] {
  const squares = new Array(25).fill(false)
  selectedIndices.forEach(index => {
    if (index >= 0 && index < 25) {
      squares[index] = true
    }
  })
  return squares
}

/**
 * Build an Initialize instruction
 */
export function createInitializeInstruction(
  authority: PublicKey
): TransactionInstruction {
  const [boardPda] = findBoardPda()

  const instructionData = Buffer.alloc(1)
  writeUInt8(instructionData, 0, 0) // Initialize discriminator

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Build a Start Round instruction
 */
export function createStartRoundInstruction(
  authority: PublicKey,
  roundId: number
): TransactionInstruction {
  const [boardPda] = findBoardPda()
  const [roundPda] = findRoundPda(roundId)

  // [u8 discriminator, u64 round_id]
  const instructionData = Buffer.alloc(9)
  writeUInt8(instructionData, 1, 0)                      // StartRound discriminator
  writeBigUInt64LE(instructionData, BigInt(roundId), 1) // Round ID

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: roundPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Build a Reveal instruction
 */
export function createRevealInstruction(
  authority: PublicKey,
  roundId: number
): TransactionInstruction {
  const [boardPda] = findBoardPda()
  const [roundPda] = findRoundPda(roundId)

  const instructionData = Buffer.alloc(1)
  writeUInt8(instructionData, 2, 0) // Reveal discriminator

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: roundPda, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Build a Claim instruction
 */
export function createClaimInstruction(
  authority: PublicKey,
  roundId: number
): TransactionInstruction {
  const [boardPda] = findBoardPda()
  const [roundPda] = findRoundPda(roundId)
  const [minerPda] = findMinerPda(authority)

  const instructionData = Buffer.alloc(1)
  writeUInt8(instructionData, 3, 0) // Claim discriminator

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: roundPda, isSigner: false, isWritable: true },
      { pubkey: minerPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Build a Stake instruction
 */
export function createStakeInstruction(
  authority: PublicKey,
  amountSol: number
): TransactionInstruction {
  const [boardPda] = findBoardPda()
  const [minerPda] = findMinerPda(authority)

  const amount = solToLamports(amountSol)

  // [u8 discriminator, u64 amount]
  const instructionData = Buffer.alloc(9)
  writeUInt8(instructionData, 4, 0)                    // Stake discriminator
  writeBigUInt64LE(instructionData, BigInt(amount), 1) // Amount in lamports

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: minerPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}

/**
 * Build an Unstake instruction
 */
export function createUnstakeInstruction(
  authority: PublicKey,
  amountSol: number
): TransactionInstruction {
  const [boardPda] = findBoardPda()
  const [minerPda] = findMinerPda(authority)

  const amount = solToLamports(amountSol)

  // [u8 discriminator, u64 amount]
  const instructionData = Buffer.alloc(9)
  writeUInt8(instructionData, 5, 0)                    // Unstake discriminator
  writeBigUInt64LE(instructionData, BigInt(amount), 1) // Amount in lamports

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: boardPda, isSigner: false, isWritable: true },
      { pubkey: minerPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })
}