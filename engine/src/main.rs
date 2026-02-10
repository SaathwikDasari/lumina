mod model;
mod config;
mod graph;
mod router;
mod cost;
mod output;
mod advisory;
mod fee;
mod fetch_api;
mod state; // New
mod api;   // New

use axum::{routing::{get, post}, Router};
use std::sync::Arc;
use std::collections::HashMap;
use crate::model::LiquidityCondition;
use crate::state::AppState;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    println!("🚀 Lumina Engine Starting...");

    // 1. Fetch Latest Data (Your existing logic)
    if let Err(e) = fetch_api::generate_full_matrix().await {
        eprintln!("⚠️ API Fetch failed, using cached data: {}", e);
    }

    // 2. Load Data (Your existing logic)
    println!("📂 Loading routes and liquidity maps...");
    let routes = config::load_routes("../data/routes.csv");
    let graph = graph::build_graph(routes);

    let liquidity = config::load_liquidity_conditions("../data/liquidity_conditions.csv");
    let liquidity_map: HashMap<String, LiquidityCondition> = liquidity
        .into_iter()
        .map(|l| (l.rail_id.clone(), l))
        .collect();

    // 3. Create Shared State
    let shared_state = AppState {
        graph: Arc::new(graph),
        liquidity: Arc::new(liquidity_map),
    };

    // 4. Define Server Routes
    let app = Router::new()
        .route("/optimize", post(api::optimize::optimize_route))      // The Route Calculator
        .route("/create-payment-link", post(api::payment::create_payment_link)) // Stripe
        .route("/webhook", post(api::webhook::stripe_webhook))        // Treasury Trigger
        .layer(CorsLayer::permissive()) // Allows Next.js to call this
        .with_state(shared_state);

    // 5. Start Server
    println!("🌍 Lumina Server listening on http://0.0.0.0:4000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:4000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}