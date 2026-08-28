# CSI ORIGIN 2026 - Problem Statement 5
## Building a Competitive Capital Market for Supply-Chain Working Capital

This project is an **Agentic Supply-Chain Financing Marketplace** that demonstrates an intelligent, multi-layered matching and capital allocation ecosystem connecting suppliers (MSMEs) with multiple capital providers (Banks, NBFCs, FinTechs, Funds).

It implements the full **Agentic Lifecycle Loop**:
$$\text{Invoice Submission} \rightarrow \text{Verification} \rightarrow \text{Risk Assessment} \rightarrow \text{Capital Discovery} \rightarrow \text{Bidding} \rightarrow \text{Suitability Scoring} \rightarrow \text{Optimal Capital Allocation} \rightarrow \text{Settlement} \rightarrow \text{Learning}$$

---

## Key Features

1. **Agentic Automation**: Automatically executes checks, evaluates risk levels, filters eligible capital providers, and triggers auto-bidding algorithms based on predefined risk policies.
2. **Multi-Factor Suitability Scoring**: Moves beyond simple "cheapest interest rate" sorting. Evaluates bids on:
   - Funding Amount Fit ($30\%$)
   - Cost/Interest Rate ($20\%$)
   - Tenure/Payment Terms ($15\%$)
   - Settlement Speed ($15\%$)
   - Processing Fees ($10\%$)
   - Supplier Preference ($10\%$)
3. **Constrained Capital Allocation Solver**: Uses mathematical knapsack/greedy optimization to distribute finite liquidity from multiple capital providers across competing invoices to maximize total supply chain liquidity.
4. **Three-Role Dashboard**:
   - **Supplier Workspace**: Submit invoices, monitor verification, view risk details, compare and accept offers.
   - **Capital Provider Workspace**: View matching invoices, set auto-bid rules, bid manually, and track active portfolio metrics.
   - **Admin Control Room**: Monitor the live agentic execution loop, view marketplace volume graphs, and run sandbox simulations of the optimization solver.

---

## Tech Stack

* **Backend**: Node.js & Express (API server and matching engine)
* **Frontend**: React + Tailwind CSS + Lucide Icons + Recharts (for charts)

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd c:\VIT
   ```

2. Install all dependencies for both frontend and backend:
   ```bash
   npm run install:all
   ```

3. Run the development server (runs both frontend and backend concurrently):
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
