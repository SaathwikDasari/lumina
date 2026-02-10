use std::collections::HashMap;

use crate::cost::apply_cost;
use crate::graph::Graph;
use crate::model::LiquidityCondition;


pub fn find_best_route(
    graph: &HashMap<String, Vec<crate::model::Route>>, 
    liquidity_map: &HashMap<String, crate::model::LiquidityCondition>,
    start: &str,
    end: &str,
    start_amount: f64,
) -> (Vec<String>, Vec<String>, f64) {
    let start_node = start.trim().to_uppercase();
    let end_node = end.trim().to_uppercase();

    let mut best_amount: HashMap<String, f64> = HashMap::new();
    let mut parent: HashMap<String, String> = HashMap::new();
    let mut parent_edge: HashMap<String, String> = HashMap::new();

    best_amount.insert(start_node.clone(), start_amount);

    let nodes: Vec<String> = graph.keys().cloned().collect();
    let max_iterations = nodes.len();

    for _ in 0..max_iterations {
        let mut updated = false;

        let snapshot: Vec<(String, f64)> = best_amount
            .iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();

        for (current, current_amount) in snapshot {
            if let Some(edges) = graph.get(&current) {
                for edge in edges {
                    let liquidity = liquidity_map.get(&edge.rail_id);

                    let next_amount = crate::router::apply_cost(
                        current_amount,
                        edge.fee_pct,
                        edge.slippage_pct,
                        edge.fx_rate,
                        liquidity,
                    );

                    let to_norm = edge.to.trim().to_uppercase();
                    let best_next = *best_amount.get(&to_norm).unwrap_or(&0.0);

                    if next_amount > best_next {
                        best_amount.insert(to_norm.clone(), next_amount);
                        parent.insert(to_norm.clone(), current.clone());
                        parent_edge.insert(to_norm.clone(), edge.rail_id.clone());
                        updated = true;
                    }
                }
            }
        }

        if !updated {
            break;
        }
    }

    let mut route_path: Vec<String> = Vec::new();
    let mut method_path: Vec<String> = Vec::new();

    if best_amount.contains_key(&end_node) {
        let mut curr = end_node.clone();
        route_path.push(curr.clone());

        while let Some(p) = parent.get(&curr) {
            if let Some(rail) = parent_edge.get(&curr) {
                method_path.push(rail.clone());
            }
            
            curr = p.clone();
            route_path.push(curr.clone());
        }

        route_path.reverse();
        method_path.reverse();
    } else {
        route_path.push(start_node.clone());
        route_path.push(end_node.clone());
    }

    let final_amount = *best_amount.get(&end_node).unwrap_or(&0.0);

    (route_path, method_path, final_amount)
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
