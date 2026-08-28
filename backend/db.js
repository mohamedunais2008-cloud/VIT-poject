// In-memory data store for supply-chain marketplace

export const data = {
  invoices: [
    {
      id: "INV-2026-001",
      supplierName: "ABC Manufacturing Ltd",
      buyerName: "Reliance Retail Ltd",
      amount: 800000, // ₹8,00,000
      dueDate: "2026-10-28", // 60 days
      tenor: 60,
      issueDate: "2026-08-28",
      verificationStatus: "VERIFIED",
      verificationDetails: {
        gstVerified: true,
        buyerConfirmed: true,
        poMatched: true,
        deliveryProof: "Delivered (POD Signed)"
      },
      riskScore: 18, // 18/100 (Low Risk)
      riskBreakdown: {
        supplierCreditScore: 780,
        buyerCreditScore: 850,
        invoiceAgeDays: 0,
        verificationConfidence: 96
      },
      status: "MARKETPLACE", // MARKETPLACE, FINANCED, SETTLED
      acceptedOfferId: null
    },
    {
      id: "INV-2026-002",
      supplierName: "Spark Components Pvt Ltd",
      buyerName: "Tata Motors Ltd",
      amount: 1200000, // ₹12,00,000
      dueDate: "2026-11-26", // 90 days
      tenor: 90,
      issueDate: "2026-08-28",
      verificationStatus: "PARTIALLY_VERIFIED",
      verificationDetails: {
        gstVerified: true,
        buyerConfirmed: false, // Buyer confirmation pending
        poMatched: true,
        deliveryProof: "In-Transit (E-way Bill Generated)"
      },
      riskScore: 45, // 45/100 (Medium Risk)
      riskBreakdown: {
        supplierCreditScore: 680,
        buyerCreditScore: 820,
        invoiceAgeDays: 0,
        verificationConfidence: 75
      },
      status: "MARKETPLACE",
      acceptedOfferId: null
    },
    {
      id: "INV-2026-003",
      supplierName: "Nexus Logistics",
      buyerName: "Zomato Ltd",
      amount: 400000, // ₹4,00,000
      dueDate: "2026-10-12", // 45 days
      tenor: 45,
      issueDate: "2026-08-28",
      verificationStatus: "VERIFIED",
      verificationDetails: {
        gstVerified: true,
        buyerConfirmed: true,
        poMatched: true,
        deliveryProof: "Delivered (POD Signed)"
      },
      riskScore: 22, // 22/100 (Low Risk)
      riskBreakdown: {
        supplierCreditScore: 740,
        buyerCreditScore: 790,
        invoiceAgeDays: 0,
        verificationConfidence: 92
      },
      status: "MARKETPLACE",
      acceptedOfferId: null
    }
  ],

  providers: [
    {
      id: "PROV-001",
      name: "Bank of Baroda (SME Division)",
      type: "Bank",
      liquidity: 5000000, // ₹50L
      allocatedCapital: 0,
      riskAppetite: "LOW", // LOW, MEDIUM, HIGH
      maxInvoiceSize: 1500000, // ₹15L
      minTenor: 30, // days
      maxTenor: 120, // days
      targetRateRange: { min: 9.5, max: 12.0 },
      processingFeeRate: 0.015, // 1.5%
      settlementSpeedDays: 2,
      autoBidRules: {
        enabled: true,
        maxRiskScore: 30,
        maxAmount: 1000000,
        markupRate: 0.5 // base target + markup
      }
    },
    {
      id: "PROV-002",
      name: "Groww Capital NBFC",
      type: "NBFC",
      liquidity: 3000000, // ₹30L
      allocatedCapital: 0,
      riskAppetite: "MEDIUM", // LOW, MEDIUM, HIGH
      maxInvoiceSize: 1000000, // ₹10L
      minTenor: 15,
      maxTenor: 90,
      targetRateRange: { min: 11.5, max: 14.0 },
      processingFeeRate: 0.01, // 1.0%
      settlementSpeedDays: 1,
      autoBidRules: {
        enabled: true,
        maxRiskScore: 60,
        maxAmount: 800000,
        markupRate: 0.8
      }
    },
    {
      id: "PROV-003",
      name: "KredX Supply Chain Fund",
      type: "Fund",
      liquidity: 2000000, // ₹20L
      allocatedCapital: 0,
      riskAppetite: "HIGH", // LOW, MEDIUM, HIGH
      maxInvoiceSize: 800000, // ₹8L
      minTenor: 15,
      maxTenor: 90,
      targetRateRange: { min: 13.5, max: 17.0 },
      processingFeeRate: 0.005, // 0.5%
      settlementSpeedDays: 1,
      autoBidRules: {
        enabled: true,
        maxRiskScore: 80,
        maxAmount: 500000,
        markupRate: 1.0
      }
    },
    {
      id: "PROV-004",
      name: "Falcon FinTech",
      type: "FinTech",
      liquidity: 1500000, // ₹15L
      allocatedCapital: 0,
      riskAppetite: "HIGH", // LOW, MEDIUM, HIGH
      maxInvoiceSize: 500000, // ₹5L
      minTenor: 10,
      maxTenor: 60,
      targetRateRange: { min: 14.5, max: 19.0 },
      processingFeeRate: 0.005, // 0.5%
      settlementSpeedDays: 0.5, // 12 hours
      autoBidRules: {
        enabled: true,
        maxRiskScore: 90,
        maxAmount: 400000,
        markupRate: 1.2
      }
    }
  ],

  offers: [], // Store generated and manual financing offers
  logs: []    // Store marketplace action logs for real-time console
};

// Add helper functions to query/update state
export const addLog = (action, details) => {
  const log = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action,
    details
  };
  data.logs.unshift(log);
  if (data.logs.length > 100) data.logs.pop(); // Keep last 100 logs
  return log;
};

// Seed some initial offers using a simplified manual generation
addLog("SYSTEM_INIT", "Supply-Chain Capital Marketplace initialized with seed data.");
