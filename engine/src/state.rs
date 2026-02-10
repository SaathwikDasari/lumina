use std::sync::Arc;
use std::collections::HashMap;
use crate::model::{Route, LiquidityCondition};

// This struct holds the data that every API request needs access to
#[derive(Clone)]
pub struct AppState {
    // We use 'Route' because that's what your graph.rs uses
    pub graph: Arc<HashMap<String, Vec<Route>>>,
    pub liquidity: Arc<HashMap<String, LiquidityCondition>>,
}