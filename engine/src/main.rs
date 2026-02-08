mod model;
mod config;
mod graph;
mod router;
mod cost;
mod output;

use output::{ResultOutput, write_result};
use std::collections::HashMap;

use crate::model::LiquidityCondition;

fn main() {
    let routes = config::load_routes("../data/routes.csv");
    let graph = graph::build_graph(routes);

    let liquidity = config::load_liquidity_conditions(
    "../data/liquidity_conditions.csv"
    );

    let liquidity_map: HashMap<String, LiquidityCondition> = liquidity
        .into_iter()
        .map(|l| (l.rail_id.clone(), l))
        .collect();

    let (path, amount) = router::find_best_route(
        &graph,
        &liquidity_map,
        "JPY",
        "INR",
        100.0,
    );

    println!("Best route: {:?}", path);
    println!("Final amount: {:2}", amount);

    let result = ResultOutput {
        route: path,
        final_amount: amount,
    };

    write_result(&result);

    
}
