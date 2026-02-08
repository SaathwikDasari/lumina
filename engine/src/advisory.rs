use serde::Deserialize;
use csv::Reader;

#[derive(Debug)]
pub enum Advisory {
    SendNow,
    Wait
}

#[derive(Debug, Deserialize)]
struct PriceRow {
    timestamp: String,
    price_usd_inr: f64
}

fn load_price_history(path: &str) -> Vec<f64> {
    let mut rdr = Reader::from_path(path).unwrap();
    rdr.deserialize::<PriceRow>()
        .map(|r| r.unwrap().price_usd_inr)
        .collect()
}

fn compute_trend(prices: &[f64]) -> f64 {
    if prices.len() < 2 {
        return 0.0;
    }
    let first = prices.first().unwrap();
    let last = prices.last().unwrap();
    (last - first) / first
}

fn compute_avg_volatility(prices: &[f64]) -> f64 {
    if prices.len() < 2 {
        return 0.0;
    }

    let mut deltas = Vec::new();
    for i in 1..prices.len() {
        deltas.push((prices[i] - prices[i - 1]).abs());
    }

    deltas.iter().sum::<f64>() / deltas.len() as f64
}

pub fn get_volatility_advisory(path: &str) -> Advisory {
    let prices = load_price_history(path);

    if prices.len() < 3 {
        return Advisory::Wait;
    }

    let trend = compute_trend(&prices);
    let volatility = compute_avg_volatility(&prices);

    let trend_threshold = 0.002;     
    let volatility_threshold = 0.15; 

    if trend > trend_threshold || volatility > volatility_threshold {
        Advisory::SendNow
    } else {
        Advisory::Wait
    }
}