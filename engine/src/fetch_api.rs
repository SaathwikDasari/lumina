use crate::model::RailData; 
use serde::Deserialize;
use std::collections::HashMap;
use std::fs::{self, File};
use csv::WriterBuilder;
use std::path::Path;
use std::error::Error;
use std::time::Duration;

// --- 1. API RESPONSE STRUCTURES ---

#[derive(Debug, Deserialize)]
struct ExchangeRateResponse {
    conversion_rates: HashMap<String, f64>,
}

#[derive(Debug, Deserialize)]
struct CoinbaseExchangeResponse {
    data: CoinbaseData,
}

#[derive(Debug, Deserialize)]
struct CoinbaseData {
    rates: HashMap<String, String>, 
}

// --- 2. CONFIGURATION ---

const FIAT_CURRENCIES: &[&str] = &[
    "USD", "INR", "EUR", "GBP", "JPY", "AUD", 
    "CAD", "SGD", "AED", "BRL"
];

const CRYPTO_CURRENCIES: &[&str] = &[
    "USDC", "USDT", "ETH", "BTC"
];

// --- 3. MAIN MATRIX GENERATOR ---

pub async fn generate_full_matrix() -> Result<(), Box<dyn Error>> {
    println!("🚀 Starting Optimized Matrix Generation...");

    let file_path = "../data/routes.csv";
    if let Some(parent) = Path::new(file_path).parent() {
        fs::create_dir_all(parent)?;
    }

    // Build a client with a timeout to prevent the .exe from hanging forever on bad networks
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()?;

    let api_key = "e5b6499e6fb58005550c0dfe"; 
    let fiat_url = format!("https://v6.exchangerate-api.com/v6/{}/latest/USD", api_key);
    let crypto_url = "https://api.coinbase.com/v2/exchange-rates?currency=USD";

    println!("📡 Fetching Fiat and Crypto data concurrently...");
    
    // Batch Fetching with the custom client
    let (fiat_res, crypto_res) = tokio::join!(
        client.get(&fiat_url).send(),
        client.get(crypto_url).send()
    );

    let fiat_data: ExchangeRateResponse = fiat_res?.json().await?;
    let crypto_data: CoinbaseExchangeResponse = crypto_res?.json().await?;

    // Merge into Master Map
    let mut master_rates: HashMap<String, f64> = fiat_data.conversion_rates;
    for (code, rate_str) in crypto_data.data.rates {
        if let Ok(rate) = rate_str.parse::<f64>() {
            master_rates.insert(code, rate);
        }
    }

    // Explicitly ensure USD is 1.0
    master_rates.insert("USD".to_string(), 1.0);

    let mut all_rows: Vec<RailData> = Vec::new();
    let all_currencies = [FIAT_CURRENCIES, CRYPTO_CURRENCIES].concat();

    println!("⚡ Calculating cross-rates for {} currencies...", all_currencies.len());

    for source in &all_currencies {
        for target in &all_currencies {
            if source == target { continue; }

            let source_usd_rate = master_rates.get(*source).copied().unwrap_or(1.0);
            let target_usd_rate = master_rates.get(*target).copied().unwrap_or(1.0);
            
            let fx_rate = target_usd_rate / source_usd_rate;

            let rails = if is_crypto(source) || is_crypto(target) {
                generate_crypto_rails(source, target, fx_rate)
            } else {
                generate_fiat_rails(source, target, fx_rate)
            };
            all_rows.extend(rails);
        }
    }

    // Create file - this will fail with "Access Denied" if another engine.exe is running
    let file = File::create(file_path)?;
    let mut wtr = WriterBuilder::new().from_writer(file);
    
    for r in all_rows {
        wtr.serialize(r)?;
    }
    
    wtr.flush()?;
    println!("✅ Matrix Complete! Data written to '{}'", file_path);

    Ok(())
}

fn is_crypto(currency: &str) -> bool {
    CRYPTO_CURRENCIES.contains(&currency)
}

fn generate_fiat_rails(from: &str, to: &str, rate: f64) -> Vec<RailData> {
    vec![
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "WISE".to_string(),
            fee_pct: 1.4,
            slippage_pct: 0.4,
            fx_rate: rate,
            latency_sec: 28800,
        },
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "STRIPE".to_string(),
            fee_pct: 3.1,
            slippage_pct: 0.8,
            fx_rate: rate * 0.98,
            latency_sec: 172800,
        },
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "PAYPAL".to_string(),
            fee_pct: 3.6,
            slippage_pct: 0.9,
            fx_rate: rate * 0.96,
            latency_sec: 7200,
        },
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "SWIFT".to_string(),
            fee_pct: 2.0,
            slippage_pct: 0.5,
            fx_rate: rate * 0.99,
            latency_sec: 259200,
        },
    ]
}

fn generate_crypto_rails(from: &str, to: &str, rate: f64) -> Vec<RailData> {
    vec![
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "CEX_SPOT".to_string(),
            fee_pct: 1.0, 
            slippage_pct: 0.1,
            fx_rate: rate,
            latency_sec: 600,
        },
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "DEFI_POOL".to_string(),
            fee_pct: 0.3, 
            slippage_pct: 0.5,
            fx_rate: rate,
            latency_sec: 30,
        }
    ]
}