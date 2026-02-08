use crate::model::Route;
use crate::model::LiquidityCondition;

pub fn load_routes(path: &str) -> Vec<Route> {
    let mut rdr = csv::Reader::from_path(path).unwrap();
    rdr.deserialize().map(|r| r.unwrap()).collect()
}

pub fn load_liquidity_conditions(path: &str) -> Vec<LiquidityCondition> {
    let mut rdr = csv::Reader::from_path(path).unwrap();
    rdr.deserialize().map(|r| r.unwrap()).collect()
}