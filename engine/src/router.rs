use std::collections::{HashMap, HashSet};
use crate::graph::Graph;
use crate::cost::apply_cost;
use crate::model::LiquidityCondition;

pub fn find_best_route(
    graph: &Graph,
    liquidity_map: &HashMap<String, LiquidityCondition>,
    start: &str,
    end: &str,
    start_amount: f64,
) -> (Vec<String>, f64) {

    let mut best_amount: HashMap<String, f64> = HashMap::new();
    let mut parent: HashMap<String, String> = HashMap::new();
    let mut visited: HashSet<String> = HashSet::new();

    best_amount.insert(start.to_string(), start_amount);

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

            let best_next = best_amount.get(&edge.to).copied().unwrap_or(0.0);

            if next_amount > best_next {
                best_amount.insert(edge.to.clone(), next_amount);
                parent.insert(edge.to.clone(), current.clone());
            }
        }
    }

    let mut path = Vec::new();
    let mut node = end.to_string();

    while let Some(p) = parent.get(&node) {
        path.push(node.clone());
        node = p.clone();
    }

    path.push(start.to_string());
    path.reverse();

    let final_amount = best_amount.get(end).copied().unwrap_or(0.0);

    (path, final_amount)
}


pub fn find_baseline_route(
    graph: &Graph,
    liquidity_map: &std::collections::HashMap<String, crate::model::LiquidityCondition>,
    start: &str,
    end: &str,
    start_amount: f64,
) -> f64 {

    if let Some(edges) = graph.get(start) {
        for edge in edges {
            if edge.to == end {
                return crate::cost::apply_cost(
                    start_amount,
                    edge.fee_pct,
                    edge.slippage_pct,
                    edge.fx_rate,
                    liquidity_map.get(&edge.rail_id),
                );
            }
        }
    }

    // fallback: no direct route found
    0.0
}
