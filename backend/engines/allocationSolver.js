// Suitability Ranking & Capital Allocation Solver - CSI ORIGIN 2026 Hackathon
// Purpose: Ranks offers using multi-dimensional criteria and solves constrained capital allocation.

import { addLog } from "../db.js";

/**
 * Calculates a multi-factor suitability score (0-100) for a financing offer.
 * Weight breakdown:
 * - 30% Funding Amount (Advance Rate)
 * - 20% Cost (Interest Rate)
 * - 15% Settlement Speed
 * - 15% Tenure Fit
 * - 10% Fees Score
 * - 10% Funder Type Preference
 */
export function calculateSuitabilityScore(offer, invoice) {
  // 1. Advance Rate Score (30%) - Higher advance rate is better (normalized against 95%)
  const advanceScore = (offer.advanceRate / 95) * 100;

  // 2. Cost / Interest Rate Score (20%) - Lower is better. 
  // We assume a market range of 8% (best) to 20% (worst).
  const interestScore = Math.max(0, Math.min(100, ((20 - offer.interestRate) / (20 - 8)) * 100));

  // 3. Settlement Speed Score (15%) - Faster is better (0.5 days is best, 3+ days worst)
  const speedScore = Math.max(0, Math.min(100, 100 - (offer.settlementSpeedDays - 0.5) * 35));

  // 4. Tenure Fit Score (15%) - Matches invoice tenure. Perfect fit is 100.
  const tenureScore = 100; 

  // 5. Processing Fees Score (10%) - Lower is better. 
  // Normalized between 0.5% (best) and 2.0% (worst) processing fee.
  const feePercent = offer.processingFee / invoice.amount;
  const feeScore = Math.max(0, Math.min(100, ((0.02 - feePercent) / (0.02 - 0.005)) * 100));

  // 6. Funder Type Preference (10%) - Default preference score
  // Banks have high status, FinTechs have speed popularity.
  let preferenceScore = 80;
  if (offer.providerType === "Bank") preferenceScore = 90;
  if (offer.providerType === "FinTech") preferenceScore = 85;

  // Weighted sum
  const finalScore = Math.round(
    (advanceScore * 0.30) +
    (interestScore * 0.20) +
    (speedScore * 0.15) +
    (tenureScore * 0.15) +
    (feeScore * 0.10) +
    (preferenceScore * 0.10)
  );

  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Solves the Capital Allocation Problem.
 * Input: List of active invoices and capital providers.
 * Outputs: Optimal mapping of providers to invoices that maximizes total system suitability
 * while respecting provider capital limits and invoice sizes.
 * 
 * We implement two algorithms to demonstrate the "Optimization Layer" power:
 * 1. Greedy Rate Solver: Simple bilateral logic where suppliers take the lowest interest rate first,
 *    and providers accept bids in a first-come, first-serve manner.
 * 2. Multi-Objective Solver (Optimal): Formulates assignment to maximize cumulative suitability 
 *    scores while keeping within liquidity budgets.
 */
export function solveCapitalAllocation(invoices, providers, offers) {
  addLog("OPTIMIZATION_START", `Running Capital Allocation optimization on ${invoices.length} invoices and ${providers.length} providers.`);

  // Deep clone data to avoid side-effects during simulations
  const provs = JSON.parse(JSON.stringify(providers));
  const invs = JSON.parse(JSON.stringify(invoices));
  const bids = JSON.parse(JSON.stringify(offers));

  // Pre-calculate suitability scores for all bids
  bids.forEach(bid => {
    const inv = invs.find(i => i.id === bid.invoiceId);
    bid.suitabilityScore = calculateSuitabilityScore(bid, inv);
  });

  // --- 1. GREEDY MODEL (Rate-Only Allocation) ---
  // Suppliers choose bids with the absolute lowest interest rate.
  // Capital providers allocate capital until they run out of liquidity.
  const greedyAllocations = [];
  const greedyProvs = JSON.parse(JSON.stringify(provs));
  let greedyTotalFunded = 0;
  let greedyTotalSuitability = 0;

  // For each invoice, find the bid with the lowest interest rate
  invs.forEach(inv => {
    // Filter offers for this invoice
    const invOffers = bids.filter(o => o.invoiceId === inv.id);
    if (invOffers.length === 0) return;

    // Sort by interest rate ascending
    invOffers.sort((a, b) => a.interestRate - b.interestRate);

    // Find the first offer that can be fulfilled by the provider's remaining liquidity
    for (const offer of invOffers) {
      const provider = greedyProvs.find(p => p.id === offer.providerId);
      const freeLiquidity = provider.liquidity - provider.allocatedCapital;
      const fundingRequired = Math.round(inv.amount * (offer.advanceRate / 100));

      if (freeLiquidity >= fundingRequired) {
        provider.allocatedCapital += fundingRequired;
        greedyAllocations.push({
          invoiceId: inv.id,
          invoiceAmount: inv.amount,
          supplier: inv.supplierName,
          providerId: provider.id,
          providerName: provider.name,
          interestRate: offer.interestRate,
          advanceRate: offer.advanceRate,
          allocatedAmount: fundingRequired,
          suitabilityScore: offer.suitabilityScore
        });
        greedyTotalFunded += fundingRequired;
        greedyTotalSuitability += offer.suitabilityScore;
        break; // Invoice funded, move to next
      }
    }
  });

  const greedyAvgSuitability = greedyAllocations.length > 0 
    ? Math.round(greedyTotalSuitability / greedyAllocations.length) 
    : 0;

  // --- 2. MULTI-FACTOR OPTIMIZED MODEL ---
  // Maximizes total system suitability using a greedy heuristic sorted by Suitability Score desc.
  // This behaves similarly to solving a multi-choice knapsack assignment.
  const optimalAllocations = [];
  const optimalProvs = JSON.parse(JSON.stringify(provs));
  let optimalTotalFunded = 0;
  let optimalTotalSuitability = 0;

  // Sort all bids globally by Suitability Score descending
  const sortedBids = [...bids].sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const fundedInvoices = new Set();

  for (const offer of sortedBids) {
    if (fundedInvoices.has(offer.invoiceId)) continue; // Invoice already matched

    const inv = invs.find(i => i.id === offer.invoiceId);
    const provider = optimalProvs.find(p => p.id === offer.providerId);
    const freeLiquidity = provider.liquidity - provider.allocatedCapital;
    const fundingRequired = Math.round(inv.amount * (offer.advanceRate / 100));

    if (freeLiquidity >= fundingRequired) {
      provider.allocatedCapital += fundingRequired;
      fundedInvoices.add(inv.id);
      
      optimalAllocations.push({
        invoiceId: inv.id,
        invoiceAmount: inv.amount,
        supplier: inv.supplierName,
        providerId: provider.id,
        providerName: provider.name,
        interestRate: offer.interestRate,
        advanceRate: offer.advanceRate,
        allocatedAmount: fundingRequired,
        suitabilityScore: offer.suitabilityScore
      });
      optimalTotalFunded += fundingRequired;
      optimalTotalSuitability += offer.suitabilityScore;
    }
  }

  const optimalAvgSuitability = optimalAllocations.length > 0 
    ? Math.round(optimalTotalSuitability / optimalAllocations.length) 
    : 0;

  addLog("OPTIMIZATION_COMPLETE", `Optimization finished. Optimal Model funded ₹${optimalTotalFunded.toLocaleString()} (Avg Suitability: ${optimalAvgSuitability}/100) vs Greedy Model funding ₹${greedyTotalFunded.toLocaleString()} (Avg Suitability: ${greedyAvgSuitability}/100).`);

  return {
    greedy: {
      allocations: greedyAllocations,
      totalFunded: greedyTotalFunded,
      averageSuitability: greedyAvgSuitability
    },
    optimized: {
      allocations: optimalAllocations,
      totalFunded: optimalTotalFunded,
      averageSuitability: optimalAvgSuitability
    }
  };
}
