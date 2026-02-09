use crate::model::ExchangeRateResponse;


pub async fn get(currency: &str) -> Result<(), Box<dyn std::error::Error>> {
    let resp:ExchangeRateResponse = reqwest::get(format!("https://v6.exchangerate-api.com/v6/e5b6499e6fb58005550c0dfe/latest/{}", currency.trim()).as_str())
        .await?
        .json()
        .await?;

    println!("{resp:?}");

    Ok(())
}