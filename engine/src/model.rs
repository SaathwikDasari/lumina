use serde::Deserialize;


#[derive(Debug, Clone, Deserialize)]
pub struct Currency {
    pub code: String,
    pub currency_type: String,
    pub country: String
}

#[derive(Debug, Clone, Deserialize)]
pub struct Rail {
    pub rail_id: String,
    pub rail_type: String,
    pub settlement_speed: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Route {
    pub from: String,
    pub to: String,
    pub rail_id: String,
    pub fee_pct: f64,
    pub slippage_pct: f64,
    pub fx_rate: f64,
    pub latency_sec: u32
}

#[derive(Debug, Clone, Deserialize)]
pub struct LiquidityCondition {
    pub rail_id: String,
    pub fee_multiplier: f64,
    pub slippage_multiplier: f64,
}
