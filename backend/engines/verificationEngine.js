// Invoice Verification Engine - CSI ORIGIN 2026 Hackathon
// Purpose: Assesses raw invoices, validates trade evidence, and outputs status & confidence.

import { addLog } from "../db.js";

/**
 * Verifies an invoice based on trade documents and buyer status.
 * @param {Object} invoice 
 * @returns {Object} { status, confidence, details }
 */
export function verifyInvoice(invoice) {
  addLog("VERIFICATION_START", `Initiated verification audit for Invoice: ${invoice.id}`);

  let passedChecks = 0;
  let totalChecks = 4;
  
  const details = {
    gstVerified: false,
    poMatched: false,
    deliveryProof: "Missing",
    buyerConfirmed: false
  };

  // 1. GST Match check (simulated based on inputs)
  if (invoice.supplierName && invoice.buyerName) {
    passedChecks++;
    details.gstVerified = true;
    addLog("VERIFICATION_STEP", `GST tax record match found for ${invoice.supplierName}`);
  }

  // 2. Purchase Order (PO) Matching (simulated)
  if (invoice.amount > 0) {
    passedChecks++;
    details.poMatched = true;
    addLog("VERIFICATION_STEP", `PO verification complete. Matching amount matches PO terms.`);
  }

  // 3. Delivery Proof (POD / E-Way Bill) Check
  if (invoice.amount < 1000000) {
    passedChecks++;
    details.deliveryProof = "Delivered (POD Signed)";
    addLog("VERIFICATION_STEP", `Proof of Delivery checked: POD signed by buyer's warehouse.`);
  } else {
    // For large invoices over 10L, POD checks might be pending or in-transit
    details.deliveryProof = "In-Transit (E-way Bill Verified)";
    addLog("VERIFICATION_STEP", `E-way bill verified. Delivery in progress.`);
  }

  // 4. Buyer Digital Confirmation / Signature Check
  // We simulate that the buyer has auto-confirmed smaller invoices, 
  // but larger ones require active confirmation which might be pending.
  if (invoice.amount <= 500000) {
    passedChecks++;
    details.buyerConfirmed = true;
    addLog("VERIFICATION_STEP", `Buyer (smart-contract/portal) auto-confirmed liability.`);
  } else {
    details.buyerConfirmed = false;
    addLog("VERIFICATION_STEP", `Active buyer confirmation pending for invoice size > ₹5,00,000.`);
  }

  // Calculate verification confidence percentage
  const confidence = Math.round((passedChecks / totalChecks) * 100);
  
  let status = "DISPUTED";
  if (confidence >= 90) {
    status = "VERIFIED";
  } else if (confidence >= 60) {
    status = "PARTIALLY_VERIFIED";
  }

  addLog("VERIFICATION_COMPLETE", `Verification ended for ${invoice.id}: Status is ${status} with ${confidence}% confidence.`);

  return {
    status,
    confidence,
    details
  };
}
