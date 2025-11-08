use ore_api::prelude::*;
use steel::*;

/// Initializes the program by creating Board, Config, Treasury, and Round 0 accounts.
pub fn process_initialize(accounts: &[AccountInfo<'_>], _data: &[u8]) -> ProgramResult {
    let [signer_info, board_info, config_info, treasury_info, treasury_tokens_info, mint_info, round_info, system_program, token_program, associated_token_program] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    
    signer_info.is_signer()?;
    mint_info.has_address(&MINT_ADDRESS)?.as_mint()?;
    system_program.is_program(&system_program::ID)?;
    token_program.is_program(&spl_token::ID)?;
    associated_token_program.is_program(&spl_associated_token_account::ID)?;
    
    // Create Board account
    if board_info.data_is_empty() {
        create_program_account::<Board>(
            board_info,
            system_program,
            signer_info,
            &ore_api::ID,
            &[BOARD],
        )?;
        let board = board_info.as_account_mut::<Board>(&ore_api::ID)?;
        board.round_id = 0;
        board.start_slot = u64::MAX;
        board.end_slot = u64::MAX;
    }
    
    // Create Config account
    if config_info.data_is_empty() {
        create_program_account::<Config>(
            config_info,
            system_program,
            signer_info,
            &ore_api::ID,
            &[CONFIG],
        )?;
        let config = config_info.as_account_mut::<Config>(&ore_api::ID)?;
        config.admin = *signer_info.key;
        config.bury_authority = *signer_info.key;
        config.fee_collector = *signer_info.key;
        config.swap_program = Pubkey::default();
        config.var_address = Pubkey::default();
        config.buffer = 0;
    }
    
    // Create Treasury account
    if treasury_info.data_is_empty() {
        create_program_account::<Treasury>(
            treasury_info,
            system_program,
            signer_info,
            &ore_api::ID,
            &[TREASURY],
        )?;
        let treasury = treasury_info.as_account_mut::<Treasury>(&ore_api::ID)?;
        treasury.balance = 0;
        treasury.motherlode = 0;
        treasury.miner_rewards_factor = Numeric::ZERO;
        treasury.stake_rewards_factor = Numeric::ZERO;
        treasury.total_staked = 0;
        treasury.total_unclaimed = 0;
        treasury.total_refined = 0;
    }
    
    // Create Treasury tokens account (for holding ORE)
    if treasury_tokens_info.data_is_empty() {
        create_associated_token_account(
            signer_info,
            treasury_info,
            treasury_tokens_info,
            mint_info,
            system_program,
            token_program,
            associated_token_program,
        )?;
    }
    
    // Create Round 0 account
    if round_info.data_is_empty() {
        create_program_account::<Round>(
            round_info,
            system_program,
            signer_info,
            &ore_api::ID,
            &[ROUND, &0u64.to_le_bytes()],
        )?;
        let round = round_info.as_account_mut::<Round>(&ore_api::ID)?;
        round.id = 0;
        round.deployed = [0; 25];
        round.slot_hash = [0; 32];
        round.count = [0; 25];
        round.expires_at = u64::MAX;
        round.rent_payer = *signer_info.key;
        round.motherlode = 0;
        round.top_miner = Pubkey::default();
        round.top_miner_reward = 0;
        round.total_deployed = 0;
        round.total_vaulted = 0;
        round.total_winnings = 0;
    }
    
    Ok(())
}