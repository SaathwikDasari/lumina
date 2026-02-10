use axum::{Json};
use serde::{Deserialize, Serialize};
use stripe::{Client, CreateCheckoutSession, CheckoutSessionMode, CreateCheckoutSessionLineItems};

#[derive(Deserialize)]
pub struct CreateLinkRequest {
    pub amount: f64,
    pub currency: String,
    pub receiver_wallet: String,
}

#[derive(Serialize)]
pub struct LinkResponse {
    pub url: String,
}

pub async fn create_payment_link(
    Json(payload): Json<CreateLinkRequest>,
) -> Json<LinkResponse> {
    let secret_key = std::env::var("STRIPE_SECRET_KEY").expect("STRIPE_SECRET_KEY missing");
    let client = Client::new(secret_key);

    println!("🔔 Request: {} {}", payload.amount, payload.currency); // Debug log

    // --- 🛡️ ROBUST CLEANING START 🛡️ ---
    // 1. Split by space to handle "USD - United States" -> take "USD"
    // 2. Convert to lowercase -> "usd"
    // 3. Trim whitespace
    let raw_currency = payload.currency.split_whitespace().next().unwrap_or("usd");
    let lower_currency = raw_currency.to_lowercase();

    // 4. Check if it's a valid Stripe fiat currency
    let final_currency = match lower_currency.as_str() {
        "usd" | "eur" | "inr" | "gbp" | "aud" | "cad" | "sgd" | "aed" => lower_currency,
        _ => {
            println!("⚠️ Unsupported currency '{}'. Defaulting to 'usd'.", lower_currency);
            "usd".to_string()
        }
    };
    // --- 🛡️ ROBUST CLEANING END 🛡️ ---

    // Now it is safe to parse
    let currency_enum = final_currency
        .parse::<stripe::Currency>()
        .expect("Invalid Currency Code");

    let mut metadata = std::collections::HashMap::new();
    metadata.insert("receiver_wallet".to_string(), payload.receiver_wallet);

    let params = CreateCheckoutSession {
        mode: Some(CheckoutSessionMode::Payment),
        success_url: Some("http://localhost:3000/success"), 
        metadata: Some(metadata),
        line_items: Some(vec![CreateCheckoutSessionLineItems {
            quantity: Some(1),
            price_data: Some(stripe::CreateCheckoutSessionLineItemsPriceData {
                currency: currency_enum,
                
                // Ensure amount is in cents!
                unit_amount: Some((payload.amount * 100.0) as i64), 
                
                product_data: Some(stripe::CreateCheckoutSessionLineItemsPriceDataProductData {
                    name: "Lumina Transfer".to_string(),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            ..Default::default()
        }]),
        ..Default::default()
    };

    let session = stripe::CheckoutSession::create(&client, params).await.unwrap();
    Json(LinkResponse { url: session.url.unwrap() })
}