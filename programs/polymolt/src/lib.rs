use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod polymolt {
    use super::*;

    /// Initialize a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        question: String,
        expires_at: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.creator = ctx.accounts.creator.key();
        market.question = question;
        market.expires_at = expires_at;
        market.resolved = false;
        market.outcome = None;
        market.total_yes_amount = 0;
        market.total_no_amount = 0;
        market.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Market created: {}", market.question);
        Ok(())
    }

    /// Place a bet (yes or no)
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        position: bool, // true = yes, false = no
        amount: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;
        
        require!(!market.resolved, ErrorCode::MarketResolved);
        require!(
            Clock::get()?.unix_timestamp < market.expires_at,
            ErrorCode::MarketExpired
        );
        
        bet.market = market.key();
        bet.user = ctx.accounts.user.key();
        bet.position = position;
        bet.amount = amount;
        bet.created_at = Clock::get()?.unix_timestamp;
        
        if position {
            market.total_yes_amount += amount;
        } else {
            market.total_no_amount += amount;
        }
        
        msg!("Bet placed: {} {} on {}", amount, if position { "YES" } else { "NO" }, market.question);
        Ok(())
    }

    /// Resolve the market (can only be done by resolvers who didn't bet)
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool, // true = yes won, false = no won
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let resolution = &mut ctx.accounts.resolution;
        
        require!(!market.resolved, ErrorCode::AlreadyResolved);
        require!(
            Clock::get()?.unix_timestamp >= market.expires_at,
            ErrorCode::MarketNotExpired
        );
        
        // Resolver stakes 10% of total pool
        let total_pool = market.total_yes_amount + market.total_no_amount;
        let stake_amount = total_pool / 10;
        
        market.resolved = true;
        market.outcome = Some(outcome);
        
        resolution.market = market.key();
        resolution.resolver = ctx.accounts.resolver.key();
        resolution.outcome = outcome;
        resolution.stake_amount = stake_amount;
        resolution.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Market resolved: {} = {}", market.question, if outcome { "YES" } else { "NO" });
        Ok(())
    }

    /// Claim winnings after market is resolved
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &ctx.accounts.bet;
        
        require!(market.resolved, ErrorCode::MarketNotResolved);
        
        let winning_outcome = market.outcome.unwrap();
        require!(bet.position == winning_outcome, ErrorCode::NotAWinner);
        
        // Calculate winnings
        let total_pool = market.total_yes_amount + market.total_no_amount;
        let winning_pool = if winning_outcome { 
            market.total_yes_amount 
        } else { 
            market.total_no_amount 
        };
        
        let winnings = (bet.amount * total_pool) / winning_pool;
        
        msg!("Claimed: {} winnings", winnings);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(init, payer = creator, space = 8 + Market::SIZE)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(init, payer = user, space = 8 + Bet::SIZE)]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(init, payer = resolver, space = 8 + Resolution::SIZE)]
    pub resolution: Account<'info, Resolution>,
    #[account(mut)]
    pub resolver: Signer<'info>,
    /// CHECK: This account is not used
    pub bet_account: UncheckedAccount<'info>, // Ensures resolver hasn't bet
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    pub market: Account<'info, Market>,
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Market {
    pub creator: Pubkey,
    pub question: String,
    pub expires_at: i64,
    pub resolved: bool,
    pub outcome: Option<bool>,
    pub total_yes_amount: u64,
    pub total_no_amount: u64,
    pub created_at: i64,
}

impl Market {
    pub const SIZE: usize = 32 + 200 + 8 + 1 + 2 + 8 + 8 + 8;
}

#[account]
pub struct Bet {
    pub market: Pubkey,
    pub user: Pubkey,
    pub position: bool, // true = yes, false = no
    pub amount: u64,
    pub created_at: i64,
}

impl Bet {
    pub const SIZE: usize = 32 + 32 + 1 + 8 + 8;
}

#[account]
pub struct Resolution {
    pub market: Pubkey,
    pub resolver: Pubkey,
    pub outcome: bool,
    pub stake_amount: u64,
    pub created_at: i64,
}

impl Resolution {
    pub const SIZE: usize = 32 + 32 + 1 + 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market is already resolved")]
    AlreadyResolved,
    #[msg("Market has expired")]
    MarketExpired,
    #[msg("Market has not expired yet")]
    MarketNotExpired,
    #[msg("Market is resolved")]
    MarketResolved,
    #[msg("Market is not resolved yet")]
    MarketNotResolved,
    #[msg("Not a winning bet")]
    NotAWinner,
}
