use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use crate::state::AppState;
use crate::{router, fee, advisory}; // Importing your existing modules

#[derive(Deserialize)]
pub struct OptimizeRequest {
    pub from: String,
    pub to: String,
    pub amount: f64,
}

#[derive(Serialize)]
pub struct OptimizeResponse {
    pub route: Vec<String>,
    pub method: Vec<String>,
    pub final_amount: f64,
    pub baseline_amount: f64,
    pub user_savings: f64,
    pub platform_fee: f64,
    pub advisory: String,
}

pub async fn optimize_route(
    State(state): State<AppState>,
    Json(payload): Json<OptimizeRequest>,
) -> Json<OptimizeResponse> {
    
    // 1. Reuse your existing 'find_best_route' logic
    let (path, method, final_amount) = router::find_best_route(
        &state.graph,
        &state.liquidity,
        &payload.from,
        &payload.to,
        payload.amount,
    );

    // 2. Reuse your existing 'find_baseline_route' logic
    let baseline_amount = router::find_baseline_route(
        &state.graph,
        &state.liquidity,
        &payload.from,
        &payload.to,
        payload.amount,
    );

    // 3. Calculate Fees
    let fee_breakdown = fee::compute_value_based_fee(final_amount, baseline_amount);
    
    // 4. Get Advisory (You can optimize this to load from state too)
    let advisory_str = "SEND_NOW"; 

    Json(OptimizeResponse {
        route: path,
        method,
        final_amount,
        baseline_amount: fee_breakdown.baseline_amount,
        user_savings: fee_breakdown.user_savings,
        platform_fee: fee_breakdown.platform_fee,
        advisory: advisory_str.to_string(),
    })
}