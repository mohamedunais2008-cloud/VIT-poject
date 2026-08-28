// Express Server entry point - CSI ORIGIN 2026 Hackathon
// Purpose: REST API endpoints exposed to the frontend dashboards and coordinates engines.

import express from "express";
import cors from "cors";
import { data, addLog } from "./db.js";
import { verifyInvoice } from "./engines/verificationEngine.js";
import { assessRisk } from "./engines/riskEngine.js";
import { matchAndGenerateOffers } from "./engines/matchingEngine.js";
import { calculateSuitabilityScore, solveCapitalAllocation } from "./engines/allocationSolver.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- ENDPOINTS ---

// 1. Get all invoices
app.get("/api/invoices", (req, res) => {
  res.json(data.invoices);
});

// 2. Submit new invoice (Supplier Portal)
// Triggers the automated Agentic loop: Submit -> Verify -> Risk Score -> Match -> Auto Bid
app.post("/api/invoices", (req, res) => {
  const { supplierName, buyerName, amount, dueInDays } = req.body;

  if (!supplierName || !buyerName || !amount || !dueInDays) {
    return res.status(400).json({ error: "Missing required invoice fields" });
  }

  const invoiceAmount = parseFloat(amount);
  const tenor = parseInt(dueInDays);
  
  // Calculate due date based on days
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + tenor);
  const dueDateStr = due.toISOString().split("T")[0];

  const newInvoice = {
    id: `INV-2026-00${data.invoices.length + 1}`,
    supplierName,
    buyerName,
    amount: invoiceAmount,
    dueDate: dueDateStr,
    tenor,
    issueDate: today.toISOString().split("T")[0],
    verificationStatus: "PENDING",
    verificationDetails: {},
    riskScore: 0,
    riskBreakdown: {
      supplierCreditScore: Math.floor(Math.random() * (850 - 600) + 600), // Random realistic score
      buyerCreditScore: Math.floor(Math.random() * (850 - 700) + 700),
      invoiceAgeDays: 0,
      verificationConfidence: 0
    },
    status: "MARKETPLACE",
    acceptedOfferId: null
  };

  // Add to database
  data.invoices.unshift(newInvoice);
  addLog("INVOICE_SUBMITTED", `Invoice ${newInvoice.id} submitted for ₹${invoiceAmount.toLocaleString()} to ${buyerName}.`);

  // --- RUN AGENTIC LOOP STEPS ---
  
  // Step 1: Verification
  const verResult = verifyInvoice(newInvoice);
  newInvoice.verificationStatus = verResult.status;
  newInvoice.verificationDetails = verResult.details;
  newInvoice.riskBreakdown.verificationConfidence = verResult.confidence;

  // Step 2: Risk Scoring
  const riskResult = assessRisk(newInvoice, verResult.confidence);
  newInvoice.riskScore = riskResult.overallRiskScore;
  newInvoice.supplierRisk = riskResult.supplierRisk;
  newInvoice.buyerRisk = riskResult.buyerRisk;
  newInvoice.riskBreakdown.supplierCreditScore = riskResult.breakdown.supplierCreditScore;
  newInvoice.riskBreakdown.buyerCreditScore = riskResult.breakdown.buyerCreditScore;

  // Step 3: Match & Auto-Bid
  matchAndGenerateOffers(newInvoice);

  res.status(201).json(newInvoice);
});

// 3. Get all capital providers
app.get("/api/providers", (req, res) => {
  res.json(data.providers);
});

// 4. Update Auto-bid rules for a capital provider
app.post("/api/providers/:id/rules", (req, res) => {
  const provider = data.providers.find(p => p.id === req.params.id);
  if (!provider) {
    return res.status(404).json({ error: "Funder not found" });
  }

  const { enabled, maxRiskScore, maxAmount } = req.body;
  provider.autoBidRules.enabled = enabled;
  provider.autoBidRules.maxRiskScore = parseInt(maxRiskScore);
  provider.autoBidRules.maxAmount = parseFloat(maxAmount);

  addLog("PROVIDER_RULES_UPDATED", `Auto-bid configuration modified for ${provider.name}.`);
  res.json(provider);
});

// 5. Get all offers, adding dynamic suitability calculations
app.get("/api/offers", (req, res) => {
  const calculatedOffers = data.offers.map(offer => {
    const inv = data.invoices.find(i => i.id === offer.invoiceId);
    if (inv) {
      offer.suitabilityScore = calculateSuitabilityScore(offer, inv);
    }
    return offer;
  });
  res.json(calculatedOffers);
});

// 6. Manual Bid Placement (Capital Provider Portal)
app.post("/api/offers", (req, res) => {
  const { invoiceId, providerId, interestRate, advanceRate, processingFee } = req.body;

  const inv = data.invoices.find(i => i.id === invoiceId);
  const prov = data.providers.find(p => p.id === providerId);

  if (!inv || !prov) {
    return res.status(404).json({ error: "Invoice or Capital Provider not found" });
  }

  const newOffer = {
    id: `OFFER-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    invoiceId,
    providerId,
    providerName: prov.name,
    providerType: prov.type,
    interestRate: parseFloat(interestRate),
    advanceRate: parseInt(advanceRate),
    tenor: inv.tenor,
    settlementSpeedDays: prov.settlementSpeedDays,
    processingFee: parseFloat(processingFee),
    status: "PENDING",
    timestamp: new Date().toISOString()
  };

  newOffer.suitabilityScore = calculateSuitabilityScore(newOffer, inv);
  data.offers.push(newOffer);

  addLog("MANUAL_BID_PLACED", `Manual bid submitted by ${prov.name} for ${invoiceId}: ${interestRate}% rate.`);
  res.status(201).json(newOffer);
});

// 7. Accept a bidding offer (Supplier Portal)
app.post("/api/offers/:id/accept", (req, res) => {
  const offer = data.offers.find(o => o.id === req.params.id);
  if (!offer) {
    return res.status(404).json({ error: "Offer not found" });
  }

  const invoice = data.invoices.find(i => i.id === offer.invoiceId);
  const provider = data.providers.find(p => p.id === offer.providerId);

  if (!invoice || !provider) {
    return res.status(404).json({ error: "Invoice or Capital Provider mismatch" });
  }

  if (invoice.status !== "MARKETPLACE") {
    return res.status(400).json({ error: "Invoice is already financed or settled" });
  }

  const financingAmount = Math.round(invoice.amount * (offer.advanceRate / 100));

  // Check if provider has enough remaining liquidity
  const freeLiquidity = provider.liquidity - provider.allocatedCapital;
  if (freeLiquidity < financingAmount) {
    return res.status(400).json({ error: "Funder has insufficient available liquidity to complete transfer." });
  }

  // Update status and allocate capital
  offer.status = "ACCEPTED";
  invoice.status = "FINANCED";
  invoice.acceptedOfferId = offer.id;
  provider.allocatedCapital += financingAmount;

  // Reject all other offers for this invoice
  data.offers.forEach(o => {
    if (o.invoiceId === invoice.id && o.id !== offer.id) {
      o.status = "REJECTED";
    }
  });

  addLog("OFFER_ACCEPTED", `${invoice.supplierName} accepted bid from ${provider.name} for ${invoice.id}. ₹${financingAmount.toLocaleString()} funded.`);
  res.json({ invoice, offer });
});

// 8. Settle an invoice (Repayment complete)
app.post("/api/invoices/:id/settle", (req, res) => {
  const invoice = data.invoices.find(i => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  if (invoice.status !== "FINANCED") {
    return res.status(400).json({ error: "Invoice is not in financed state" });
  }

  const offer = data.offers.find(o => o.id === invoice.acceptedOfferId);
  const provider = data.providers.find(p => p.id === offer.providerId);

  const financedAmt = Math.round(invoice.amount * (offer.advanceRate / 100));

  // Settle invoice and release allocated capital back to provider
  invoice.status = "SETTLED";
  provider.allocatedCapital = Math.max(0, provider.allocatedCapital - financedAmt);

  addLog("INVOICE_SETTLED", `Invoice ${invoice.id} settled. Buyer repaid ₹${invoice.amount.toLocaleString()} to ${provider.name}.`);
  res.json(invoice);
});

// 9. Get live console logs
app.get("/api/logs", (req, res) => {
  res.json(data.logs);
});

// 10. Run mathematical optimization solver sandbox
app.get("/api/optimize", (req, res) => {
  const result = solveCapitalAllocation(data.invoices, data.providers, data.offers);
  res.json(result);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  addLog("SYSTEM_ONLINE", `Express HTTP API server online on port ${PORT}`);
});
