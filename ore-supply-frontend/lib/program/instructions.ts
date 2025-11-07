import { 
    PublicKey, 
    TransactionInstruction, 
    SystemProgram,
    SYSVAR_CLOCK_PUBKEY
  } from '@solana/web3.js'
  import { PROGRAM_ID, solToLamports } from './constants'
  import { findBoardPda, findMinerPda, findRoundPda, findAutomationPda } from './pdas'
  
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
  
    // Create instruction data
    const instructionData = Buffer.alloc(13)
    instructionData.writeUInt8(6, 0) // Deploy instruction discriminator
    instructionData.writeBigUInt64LE(BigInt(amount), 1)
    instructionData.writeUInt32LE(mask, 9)
  
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