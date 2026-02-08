use std::collections::HashMap;
use crate::model::Route;

pub type Graph = HashMap<String, Vec<Route>>;

pub fn build_graph(routes: Vec<Route>) -> Graph {
    let mut graph = HashMap::new();
    for route in routes {
        graph.entry(route.from.clone())
            .or_insert(Vec::new())
            .push(route)
    }

    graph
}