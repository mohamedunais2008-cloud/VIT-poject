// Risk Assessment Engine - CSI ORIGIN 2026 Hackathon
// Purpose: Simulates credit-risk modeling based on supplier, buyer, invoice, and verification confidence.

import { addLog } from "../db.js";

/**
 * Assesses risk scores for a financing opportunity.
 * @param {Object} invoice 
 * @param {Number} verificationConfidence (0-100)
 * @returns {Object} Risk analysis report
 */
export function assessRisk(invoice, verificationConfidence) {
  addLog("RISK_ASSESSMENT_START", `Analyzing risk matrices for Invoice ${invoice.id}`);

  // 1. Determine Supplier risk tier (based on mock credit scores)
  // Default to sensible numbers if not present
  const supplierCreditScore = invoice.riskBreakdown?.supplierCreditScore || 720;
  let supplierRisk = "LOW";
  let supplierRiskValue = 20;

  if (supplierCreditScore < 650) {
    supplierRisk = "HIGH";
    supplierRiskValue = 80;
  } else if (supplierCreditScore < 750) {
    supplierRisk = "MEDIUM";
    supplierRiskValue = 45;
  }

  // 2. Determine Buyer risk tier (Buyers are usually larger companies)
  const buyerCreditScore = invoice.riskBreakdown?.buyerCreditScore || 800;
  let buyerRisk = "LOW";
  let buyerRiskValue = 15;

  if (buyerCreditScore < 700) {
    buyerRisk = "HIGH";
    buyerRiskValue = 70;
  } else if (buyerCreditScore < 780) {
    buyerRisk = "MEDIUM";
    buyerRiskValue = 40;
  }

  // 3. Invoice size risk impact (Larger invoices pose higher exposure risk)
  // Max invoice size in mock is ₹15L. Let's normalize it.
  const amountRiskFactor = Math.min((invoice.amount / 1500000) * 100, 100);

  // 4. Verification Confidence Impact
  // High verification confidence reduces transaction fraud risk.
  const verificationRiskImpact = 100 - verificationConfidence;

  // 5. Aggregate Risk Score (0 - 100)
  // Low is low risk (good), High is high risk (bad)
  const overallRiskScore = Math.round(
    (verificationRiskImpact * 0.40) +  // 40% weight to trade verification audit
    (supplierRiskValue * 0.25) +       // 25% weight to Supplier credit standing
    (buyerRiskValue * 0.25) +          // 25% weight to Buyer credit standing
    (amountRiskFactor * 0.10)          // 10% weight to Invoice size exposure
  );

  const report = {
    supplierRisk,
    buyerRisk,
    invoiceVerificationConfidence: verificationConfidence,
    overallRiskScore: Math.max(5, Math.min(99, overallRiskScore)), // Clamp between 5 and 99
    breakdown: {
      supplierCreditScore,
      buyerCreditScore,
      amountRiskFactor: Math.round(amountRiskFactor),
      verificationRiskImpact
    }
  };

  addLog("RISK_ASSESSMENT_COMPLETE", `Risk scoring complete for ${invoice.id}: Score is ${report.overallRiskScore}/100.`);

  return report;
}
