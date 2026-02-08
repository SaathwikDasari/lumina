use serde::Serialize;
use std::fs;

#[derive(Serialize)]
pub struct ResultOutput {
    pub route: Vec<String>,
    pub final_amount: f64,
}

pub fn write_result(result: &ResultOutput) {
    fs::create_dir_all("../output").unwrap();

    let json = serde_json::to_string_pretty(result).unwrap();
    fs::write("../output/result.json", json).unwrap();
}
