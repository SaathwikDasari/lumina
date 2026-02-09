use std::collections::{HashMap, HashSet};

use crate::cost::apply_cost;
use crate::graph::Graph;
use crate::model::LiquidityCondition;

pub fn find_best_route(
    graph: &Graph,
    liquidity_map: &HashMap<String, LiquidityCondition>,
    start: &str,
    end: &str,
    start_amount: f64,
) -> (Vec<String>, Vec<String>, f64) {
    let start = start.trim().to_uppercase();
    let end = end.trim().to_uppercase();

    let mut best_amount: HashMap<String, f64> = HashMap::new();
    let mut parent: HashMap<String, String> = HashMap::new();
    let mut parent_edge: HashMap<String, String> = HashMap::new();
    let mut visited: HashSet<String> = HashSet::new();

    best_amount.insert(start.clone(), start_amount);

    loop {
        let current = best_amount
            .iter()
            .filter(|(k, _)| !visited.contains(*k))
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(k, _)| k.clone());

        let current = match current {
            Some(c) => c,
            None => break,
        };

        if current == end {
            break;
        }

        visited.insert(current.clone());

        let edges = match graph.get(&current) {
            Some(e) => e,
            None => continue,
        };

        let current_amount = best_amount[&current];

        for edge in edges {
            let liquidity = liquidity_map.get(&edge.rail_id);
            let next_amount = apply_cost(
                current_amount,
                edge.fee_pct,
                edge.slippage_pct,
                edge.fx_rate,
                liquidity,
            );

            let to_norm = edge.to.trim().to_uppercase();
            let best_next = best_amount.get(&to_norm).copied().unwrap_or(0.0);

            if next_amount > best_next {
                best_amount.insert(to_norm.clone(), next_amount);
                parent.insert(to_norm.clone(), current.clone());
                parent_edge.insert(to_norm, edge.rail_id.clone());
            }

        }
    }

    let mut path = Vec::new();
    let mut node = end.clone();

    while let Some(p) = parent.get(&node) {
        path.push(node.clone());
        node = p.clone();
    }

    path.push(start.clone());
    path.reverse();


    let mut execution_path: Vec<String> = Vec::new();
    let mut node = end.clone();

    let mut display_path = vec![start.clone()];

    for rail in &execution_path {
        if rail.contains("USDC") {
            display_path.push("USDC".to_string());
        } else if rail.contains("USDT") {
            display_path.push("USDT".to_string());
        }
    }

    display_path.push(end.clone());

    while let Some(p) = parent.get(&node) {
        if let Some(rail) = parent_edge.get(&node) {
            execution_path.push(rail.clone());
        }
        node = p.clone();
    }

    execution_path.reverse();

    let final_amount = best_amount.get(&end).copied().unwrap_or(0.0);
    (display_path, execution_path, final_amount)
}


pub fn find_baseline_route(
    graph: &Graph,
    liquidity_map: &HashMap<String, LiquidityCondition>,
    start: &str,
    end: &str,
    start_amount: f64,
) -> f64 {
    let start = start.trim().to_uppercase();
    let end = end.trim().to_uppercase();

    const BASELINE_EXTRA_FEE_PCT: f64 = 0.75;      // +0.75% fee
    const BASELINE_EXTRA_SLIPPAGE_PCT: f64 = 0.25; // +0.25% slippage
    const MIN_GAP: f64 = 0.0001;                   // prevents equality due to rounding

    let mut direct = 0.0;
    if let Some(edges) = graph.get(&start) {
        for edge in edges {
            let to_norm = edge.to.trim().to_uppercase();
            if to_norm == end {
                direct = apply_cost(
                    start_amount,
                    edge.fee_pct,
                    edge.slippage_pct,
                    edge.fx_rate,
                    liquidity_map.get(&edge.rail_id),
                );
                break;
            }
        }
    }

    if direct <= 0.0 {
        return 0.0;
    }

    let baseline = apply_cost(
        direct,
        BASELINE_EXTRA_FEE_PCT,
        BASELINE_EXTRA_SLIPPAGE_PCT,
        1.0,  
        None, 
    );

    if baseline >= direct {
        (direct - MIN_GAP).max(0.0)
    } else {
        baseline
    }
}
