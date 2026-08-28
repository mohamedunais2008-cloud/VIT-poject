// Capital Provider Matching & Auto-Bid Engine - CSI ORIGIN 2026 Hackathon
// Purpose: Matches invoices with eligible funders and automates bid/offer creation.

import { addLog, data } from "../db.js";

/**
 * Checks matching compatibility and creates auto-bids for eligible providers.
 * @param {Object} invoice 
 */
export function matchAndGenerateOffers(invoice) {
  addLog("MATCHING_START", `Searching compatible capital providers for Invoice: ${invoice.id}`);
  
  const eligibleProviders = data.providers.filter(prov => {
    // 1. Check liquidity constraints
    const freeLiquidity = prov.liquidity - prov.allocatedCapital;
    if (freeLiquidity < invoice.amount) {
      addLog("MATCHING_COMPATIBILITY_FAIL", `${prov.name} rejected: Insufficient liquidity (Free: ₹${freeLiquidity.toLocaleString()})`);
      return false;
    }

    // 2. Check invoice size limits
    if (invoice.amount > prov.maxInvoiceSize) {
      addLog("MATCHING_COMPATIBILITY_FAIL", `${prov.name} rejected: Invoice size exceeds limit (Max: ₹${prov.maxInvoiceSize.toLocaleString()})`);
      return false;
    }

    // 3. Check tenor constraints
    if (invoice.tenor < prov.minTenor || invoice.tenor > prov.maxTenor) {
      addLog("MATCHING_COMPATIBILITY_FAIL", `${prov.name} rejected: Invoice tenor ${invoice.tenor} days out of bounds (${prov.minTenor}-${prov.maxTenor} days)`);
      return false;
    }

    // 4. Check general risk appetite matching
    if (prov.riskAppetite === "LOW" && invoice.riskScore > 35) {
      addLog("MATCHING_COMPATIBILITY_FAIL", `${prov.name} rejected: Invoice risk score (${invoice.riskScore}) too high for Low Appetite`);
      return false;
    }
    if (prov.riskAppetite === "MEDIUM" && invoice.riskScore > 65) {
      addLog("MATCHING_COMPATIBILITY_FAIL", `${prov.name} rejected: Invoice risk score (${invoice.riskScore}) too high for Medium Appetite`);
      return false;
    }

    return true;
  });

  addLog("MATCHING_COMPATIBILITY_SUCCESS", `Found ${eligibleProviders.length} compatible capital providers for ${invoice.id}.`);

  // Generate automated offers for matching providers who have Auto-Bid active
  eligibleProviders.forEach(prov => {
    if (prov.autoBidRules?.enabled) {
      // Make sure they haven't bid already
      const existingOffer = data.offers.find(o => o.invoiceId === invoice.id && o.providerId === prov.id);
      if (existingOffer) return;

      // Check if invoice falls inside their Auto-Bid specific rules
      if (invoice.riskScore > prov.autoBidRules.maxRiskScore) {
        addLog("AUTOBID_SKIP", `${prov.name} skipped auto-bid: risk ${invoice.riskScore} exceeds rule limit ${prov.autoBidRules.maxRiskScore}`);
        return;
      }
      if (invoice.amount > prov.autoBidRules.maxAmount) {
        addLog("AUTOBID_SKIP", `${prov.name} skipped auto-bid: amount exceeds auto-bid cap ₹${prov.autoBidRules.maxAmount.toLocaleString()}`);
        return;
      }

      // Calculate Bid Terms dynamically based on Risk
      const riskRatio = invoice.riskScore / 100;
      
      // Interest Rate (base range min + risk premium + markup)
      const calculatedRate = prov.targetRateRange.min + 
        (riskRatio * (prov.targetRateRange.max - prov.targetRateRange.min)) + 
        (prov.autoBidRules.markupRate || 0);
      const interestRate = parseFloat(calculatedRate.toFixed(2));

      // Advance Rate (higher risk leads to lower advance percentage, e.g. 95% down to 80%)
      const calculatedAdvance = 95 - (invoice.riskScore / 5);
      const advanceRate = Math.round(Math.max(80, Math.min(95, calculatedAdvance)));

      // Processing Fees
      const fees = Math.round(invoice.amount * prov.processingFeeRate);

      // Create Funder Offer object
      const offer = {
        id: `OFFER-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        invoiceId: invoice.id,
        providerId: prov.id,
        providerName: prov.name,
        providerType: prov.type,
        interestRate, // Per annum
        advanceRate,  // % of invoice funded immediately
        tenor: invoice.tenor,
        settlementSpeedDays: prov.settlementSpeedDays,
        processingFee: fees,
        suitabilityScore: 0, // Will be computed by the suitability engine
        status: "PENDING", // PENDING, ACCEPTED, REJECTED
        timestamp: new Date().toISOString()
      };

      data.offers.push(offer);
      addLog("AUTOBID_PLACED", `Auto-bid submitted by ${prov.name}: Rate ${interestRate}%, Advance ${advanceRate}%, Fees ₹${fees.toLocaleString()}`);
    }
  });
}
