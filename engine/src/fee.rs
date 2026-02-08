pub struct FeeBreakdown {
    pub baseline_amount: f64,
    pub user_savings: f64,
    pub platform_fee: f64,
}

pub fn compute_value_based_fee(
    best_amount: f64,
    baseline_amount: f64,
) -> FeeBreakdown {

    let savings = best_amount - baseline_amount;

    if savings <= 0.0 {
        return FeeBreakdown {
            baseline_amount,
            user_savings: 0.0,
            platform_fee: 0.0,
        };
    }

    let fee_from_savings = savings * 0.12;          // 12% of savings
    let fee_cap = best_amount * 0.005;              // 0.5% cap

    let platform_fee = fee_from_savings.min(fee_cap);

    FeeBreakdown {
        baseline_amount,
        user_savings: savings,
        platform_fee,
    }
}
