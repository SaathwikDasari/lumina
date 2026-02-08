use crate::model::LiquidityCondition;

pub fn apply_cost(
    amount: f64,
    fee_pct: f64,
    slippage_pct: f64,
    fx_rate: f64,
    liquidity: Option<&LiquidityCondition>,
) -> f64 {

    let fee_mult = liquidity.map(|l| l.fee_multiplier).unwrap_or(1.0);
    let slip_mult = liquidity.map(|l| l.slippage_multiplier).unwrap_or(1.0);

    let effective_fee = fee_pct * fee_mult;
    let effective_slippage = slippage_pct * slip_mult;

    let after_fee = amount * (1.0 - effective_fee / 100.0);
    let after_slip = after_fee * (1.0 - effective_slippage / 100.0);

    after_slip * fx_rate
}