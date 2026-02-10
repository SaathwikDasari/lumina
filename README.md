# Lumina: Autonomous Liquidity Optimization Engine

**Lumina** is a high-performance cross-chain liquidity router that treats the global financial landscape as a directed graph. By bridging legacy fiat rails (Wise, Stripe, SWIFT) with decentralized finance (DEXs, Stablecoins), Lumina finds the absolute cheapest and fastest path for value transfer in real-time.

## 🚀 The Core Innovation

Most payment routers are "Black Boxes." Lumina provides total transparency and execution through:
* **Rust-Powered Brain:** A multi-threaded engine using the **Bellman-Ford algorithm** to calculate multi-hop routes across fiat and crypto in microseconds.
* **Hybrid Data Sourcing:** Concurrent batch fetching that merges central bank FX rates with real-time on-chain spot prices.
* **Atomic Execution Layer:** A custom Solidity **LuminaRouter** that executes complex DeFi swaps with built-in slippage protection.

---

## 🏗️ Project Architecture

The project is organized into three primary modules:

### 1. The Engine (`/engine`)
The backend "Brain" written in **Rust**.
* **Graph Logic:** Models currencies as nodes and payment rails (DEXs, Wise, etc.) as edges.
* **Concurrency:** Leverages `Tokio` and `reqwest` for parallel API polling of Coinbase and ExchangeRate-API.
* **Path Reconstruction:** Backtracks from destination to source to reveal intermediate hops (e.g., `USD -> USDC -> INR`).

### 2. The Smart Contracts (`/contracts`)
The execution layer built with **Foundry**.
* **LuminaRouter.sol:** An atomic meta-router that interacts with Uniswap V2 to execute the optimal crypto legs of a calculated route.
* **Security:** Implements `minAmountOut` checks to protect users from front-running and high slippage.

### 3. The Dashboard (`/ui`)
A modern, reactive frontend built with **Next.js**.
* **Interactive Routing:** Visualizes the "Liquidity Route" (Currencies) and the "Execution Path" (Rails).
* **Web3 Integration:** Connects to MetaMask using `Wagmi` to trigger the LuminaRouter on-chain.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **System Language** | Rust ( Tokio, Serde) |
| **Blockchain** | Solidity, Foundry, Sepolia Testnet |
| **Frontend** | Next.js, Tailwind CSS |
| **APIs** | Coinbase Pro, ExchangeRate-API |

---

## 🚦 Getting Started

### Prerequisites
* **Rust** (Edition 2021)
* **Node.js** (v18+)
* **Foundry** (for WSL/Linux)

### Installation

1. **Clone the Repo**
   ```bash
   git clone [https://github.com/your-username/lumina.git](https://github.com/your-username/lumina.git)
   cd lumina

2. **Run the Engine**
   ```bash
   cd engine
   cargo run

2. **Deploy Contracts**
   ```bash
   cd contracts
   forge build
   forge create --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> src/LuminaRouter.sol:LuminaRouter

3. **Launch the UI**
   ```bash
   cd ui
   npm install
   npm run dev

