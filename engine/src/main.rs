mod model;
mod config;
mod graph;
mod router;
mod cost;
mod output;
mod advisory;
mod fee;
mod fetch_api;

use output::{ResultOutput, write_result};
use std::collections::HashMap;
use std::env;

use crate::model::LiquidityCondition;

#[tokio::main]
async fn main() {
    if let Err(e) = fetch_api::generate_full_matrix().await {
        eprintln!("Error generating matrix: {}", e);
    }
    
    let args: Vec<String> = env::args().collect();

    let from = args
        .get(1)
        .map(|s| s.trim().to_uppercase())
        .unwrap_or_else(|| "USD".to_string());

    let to = args
        .get(2)
        .map(|s| s.trim().to_uppercase())
        .unwrap_or_else(|| "INR".to_string());

    let amount_input: f64 = args
        .get(3)
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(100.0);

    

    let routes = config::load_routes("../data/routes.csv");
    let graph = graph::build_graph(routes);

    let liquidity = config::load_liquidity_conditions("../data/liquidity_conditions.csv");
    let liquidity_map: HashMap<String, LiquidityCondition> = liquidity
        .into_iter()
        .map(|l| (l.rail_id.clone(), l))
        .collect();

    let advisory = advisory::get_volatility_advisory("../data/price_history.csv");
    let advisory_str = match advisory {
        advisory::Advisory::SendNow => "SEND_NOW",
        advisory::Advisory::Wait => "WAIT",
    };

    // Compute best + baseline
    let (path, method, final_amount) = router::find_best_route(
        &graph,
        &liquidity_map,
        from.as_str(),
        to.as_str(),
        amount_input,
    );

    let baseline_amount = router::find_baseline_route(
        &graph,
        &liquidity_map,
        from.as_str(),
        to.as_str(),
        amount_input,
    );

    let fee_breakdown = fee::compute_value_based_fee(final_amount, baseline_amount);

    println!("\n================= LUMINA ROUTE RESULT =================");
    println!("From: {}   To: {}   Input Amount: {:.2}", from, to, amount_input);
    println!("Advisory: {}", advisory_str);
    println!("-------------------------------------------------------");
    println!("Best Route: {:?}", path);
    println!("Method: {:?}", method);
    println!("Final Amount (best): {:.4}", final_amount);
    println!("Baseline Amount:     {:.4}", baseline_amount);
    println!("User Savings:        {:.4}", fee_breakdown.user_savings);
    println!("Platform Fee:        {:.4}", fee_breakdown.platform_fee);
    println!("=======================================================\n");

    let result = ResultOutput {
        route: path,
        method: method,
        final_amount,
        baseline_amount: fee_breakdown.baseline_amount,
        user_savings: fee_breakdown.user_savings,
        platform_fee: fee_breakdown.platform_fee,
        advisory: advisory_str.to_string(),
    };

    write_result(&result);
}
