use crate::model::{ExchangeRateResponse, RailData};
use std::fs::{self, File};
use csv::WriterBuilder;
use std::path::Path;
use std::collections::HashMap;

// The full list of currencies from your image
const CURRENCIES: &[&str] = &[
    "USD", "INR", "EUR", "GBP", "JPY", "AUD", 
    "CAD", "SGD", "AED", "BRL", "USDC", "USDT"
];

pub async fn generate_full_matrix() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Full Matrix Generation...");

    // 1. Setup paths
    let file_path = "../data/routes.csv";
    if let Some(parent) = Path::new(file_path).parent() {
        fs::create_dir_all(parent)?;
    }

    // 2. Fetch Base Rates (USD) ONCE
    // We use USD as the "Anchor" to calculate everything else.
    let api_key = "e5b6499e6fb58005550c0dfe"; 
    let url = format!("https://v6.exchangerate-api.com/v6/{}/latest/USD", api_key);
    
    let resp = reqwest::get(&url).await?;
    if !resp.status().is_success() {
        return Err(format!("API Error: {}", resp.status()).into());
    }
    let data: ExchangeRateResponse = resp.json().await?;
    let rates = data.conversion_rates;

    // 3. The Matrix Loop (All-to-All)
    let mut all_rows: Vec<RailData> = Vec::new();

    for source in CURRENCIES {
        for target in CURRENCIES {
            // Skip if source and target are the same (e.g. USD -> USD)
            if source == target { continue; }

            // --- CROSS RATE CALCULATION ---
            // Formula: Rate(Source->Target) = Rate(USD->Target) / Rate(USD->Source)
            
            let source_rate_usd = get_rate_relative_to_usd(&rates, source);
            let target_rate_usd = get_rate_relative_to_usd(&rates, target);

            let cross_rate = target_rate_usd / source_rate_usd;

            // --- GENERATE RAILS ---
            let rails = generate_rails_for_pair(source, target, cross_rate);
            all_rows.extend(rails);
        }
    }

    // 4. Write everything to CSV (Overwriting the old file)
    let file = File::create(file_path)?;
    let mut wtr = WriterBuilder::new().from_writer(file);
    
    for r in all_rows {
        wtr.serialize(r)?;
    }
    wtr.flush()?;
    
    println!("✅ Matrix Complete! Generated route data in '{}'", file_path);

    Ok(())
}

// --- HELPER 1: Handle Stablecoins & Missing Rates ---
fn get_rate_relative_to_usd(rates: &HashMap<String, f64>, currency: &str) -> f64 {
    match currency {
        // Hardcode Stablecoins to ~1.0 if not in API
        "USDC" | "USDT" => *rates.get("USD").unwrap_or(&1.0), 
        // Otherwise get from API, default to 1.0 if missing to prevent crash
        _ => *rates.get(currency).unwrap_or(&1.0), 
    }
}

// --- HELPER 2: The Rail Logic (Wise/Stripe/etc) ---
fn generate_rails_for_pair(from: &str, to: &str, real_rate: f64) -> Vec<RailData> {
    vec![
        // 1. WISE
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "WISE".to_string(),
            fee_pct: 1.4,
            slippage_pct: 0.4,
            fx_rate: real_rate, 
            latency_sec: 28800, // 8h
        },
        // 2. STRIPE
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "STRIPE".to_string(),
            fee_pct: 3.1,
            slippage_pct: 0.8,
            fx_rate: real_rate * 0.98, // 2% spread
            latency_sec: 172800, // 2 days
        },
        // 3. PAYPAL
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "PAYPAL".to_string(),
            fee_pct: 3.6,
            slippage_pct: 0.9,
            fx_rate: real_rate * 0.96, // 4% spread
            latency_sec: 7200, // Instant
        },
        // 4. SWIFT
        RailData {
            from: from.to_string(),
            to: to.to_string(),
            rail_id: "SWIFT".to_string(),
            fee_pct: 2.0,
            slippage_pct: 0.5,
            fx_rate: real_rate * 0.99, // 1% spread
            latency_sec: 345600, // 4 days
        },
    ]
}