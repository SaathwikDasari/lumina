mod model;
mod config;
mod graph;
mod router;
mod cost;
mod output;
mod advisory;
mod fee;

use output::{ResultOutput, write_result};
use std::collections::HashMap;

use crate::model::LiquidityCondition;

fn main() {
    let routes = config::load_routes("../data/routes.csv");
    let graph = graph::build_graph(routes);

    let liquidity = config::load_liquidity_conditions(
    "../data/liquidity_conditions.csv"
    );

    let advisory = advisory::get_volatility_advisory(
    "../data/price_history.csv"
    );

    println!("Advisory: {:?}", advisory);

    let liquidity_map: HashMap<String, LiquidityCondition> = liquidity
        .into_iter()
        .map(|l| (l.rail_id.clone(), l))
        .collect();

    let (path, amount) = router::find_best_route(
        &graph,
        &liquidity_map,
        "USD",
        "INR",
        100.0,
    );

    println!("Best route: {:?}", path);
    println!("Final amount: {:.2}", amount);

    let advisory_str = match advisory {
        advisory::Advisory::SendNow => "SEND_NOW",
        advisory::Advisory::Wait => "WAIT",
    };

    let baseline_amount = router::find_baseline_route(
        &graph,
        &liquidity_map,
        "USD",
        "INR",
        100.0,
    );

    let fee_breakdown = fee::compute_value_based_fee(
        amount,
        baseline_amount,
    );

    let result = ResultOutput {
        route: path,
        final_amount: amount,
        baseline_amount: fee_breakdown.baseline_amount,
        user_savings: fee_breakdown.user_savings,
        platform_fee: fee_breakdown.platform_fee,
        advisory: advisory_str.to_string(),
    };

    write_result(&result);

    
}
