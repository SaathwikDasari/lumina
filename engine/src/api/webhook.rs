use axum::{body::Bytes, http::HeaderMap};
use stripe::{Webhook, EventType, EventObject};
use ethers::prelude::*;
use std::convert::TryFrom;

const RPC_URL: &str = "https://1rpc.io/sepolia"; 

pub async fn stripe_webhook(headers: HeaderMap, body: Bytes) -> &'static str {
    let secret = std::env::var("STRIPE_WEBHOOK_SECRET").unwrap();
    let signature = headers.get("Stripe-Signature").unwrap().to_str().unwrap();

    let event = Webhook::construct_event(
        std::str::from_utf8(&body).unwrap(),
        signature,
        &secret
    ).expect("Invalid Stripe Signature");

    if let EventType::CheckoutSessionCompleted = event.type_ {
        if let EventObject::CheckoutSession(session) = event.data.object {
            if let Some(meta) = session.metadata {
                let receiver = meta.get("receiver_wallet").unwrap().clone();
                let amount_cents = session.amount_total.unwrap();
                
                println!("💰 PAYMENT CONFIRMED! Triggering Blockchain Transfer to: {}", receiver);
                
                // Spawn async task to send crypto
                tokio::spawn(async move {
                    trigger_crypto_transfer(&receiver, amount_cents).await;
                });
            }
        }
    }
    "Received"
}

async fn trigger_crypto_transfer(receiver: &str, _amount_cents: i64) {
    let private_key = std::env::var("TREASURY_PRIVATE_KEY").expect("Missing Private Key");
    let provider = Provider::<Http>::try_from(RPC_URL).unwrap();
    let wallet: LocalWallet = private_key.parse().unwrap();
    let client = SignerMiddleware::new(provider, wallet.with_chain_id(11155111u64)); 

    // Simple ETH transfer for Hackathon Demo
    let to_addr = receiver.parse::<Address>().unwrap();
    let tx = TransactionRequest::new()
        .to(to_addr)
        .value(U256::from(100000000000000u64)); // Small test amount

    match client.send_transaction(tx, None).await {
        Ok(tx) => println!("✅ CRYPTO SENT! Tx Hash: {:?}", tx.tx_hash()),
        Err(e) => eprintln!("❌ Blockchain Error: {:?}", e),
    }
}