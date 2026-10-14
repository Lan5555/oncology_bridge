import type { AccountType, VerificationStatus } from "@/app/lib/accounts";

export type RegistryResult = "MATCH" | "NO_MATCH" | "UNAVAILABLE";

export interface MockInvoice {
  reference: string;
  pharmacy: string;
  status: "AWAITING_PAYMENT" | "PAID";
  items: Array<{
    description: string;
    quantity: number;
    unitPriceNaira: number;
  }>;
  paymentMethods: string[];
  isDemo: true;
}

export interface MockStockItem {
  id: string;
  drug: string;
  brand: string;
  location: string;
  availableQuantity: number;
  unitPriceNaira: number;
  batchNumber: string;
  expiresOn: string;
  status: "Available" | "Near expiry" | "Reserved";
}

export interface MockInventoryRecord {
  id: string;
  drug: string;
  gtin: string;
  lot: string;
  facility: string;
  qty: number;
  expiry: string;
  temp: string;
  status: string;
  statusStyle: string;
  actionLabel: string;
  actionClass: string;
  category: string;
}

export interface MockOrder {
  id: string;
  code: string;
  drug: string;
  insurer: string;
  pharmacy: string;
  status: string;
  order: string;
  statusClass: string;
  orderClass: string;
}

export interface MockVerificationApplication {
  id: string;
  name: string;
  accountType: AccountType;
  license: string;
  workplace: string;
  submitted: string;
  registryResult: RegistryResult;
  status: VerificationStatus;
}

export interface MockPartnershipInquiry {
  organization: string;
  representativeTitle: string;
  projectScope: string;
  email: string;
}

export const MOCK_INVOICES: MockInvoice[] = [
  {
    reference: "OB-89201",
    pharmacy: "Oncosourz Demo Pharmacy",
    status: "AWAITING_PAYMENT",
    items: [
      {
        description: "Trastuzumab 150 mg vial",
        quantity: 1,
        unitPriceNaira: 650000,
      },
    ],
    paymentMethods: ["Debit card", "Bank transfer", "USSD", "Apple Pay"],
    isDemo: true,
  },
];

export const MOCK_STOCK: MockStockItem[] = [
  {
    id: "stock-001",
    drug: "Trastuzumab",
    brand: "Herceptin",
    location: "Lagos Island GH, Lagos",
    availableQuantity: 8,
    unitPriceNaira: 650000,
    batchNumber: "TZ-2204-B",
    expiresOn: "2026-12-15",
    status: "Available",
  },
  {
    id: "stock-002",
    drug: "Trastuzumab",
    brand: "Herceptin",
    location: "UCH, Ibadan",
    availableQuantity: 3,
    unitPriceNaira: 650000,
    batchNumber: "TZ-2211-A",
    expiresOn: "2027-01-15",
    status: "Available",
  },
  {
    id: "stock-003",
    drug: "Rituximab",
    brand: "MabThera",
    location: "EKO Hospital, Lagos",
    availableQuantity: 5,
    unitPriceNaira: 420000,
    batchNumber: "RX-0912-A",
    expiresOn: "2026-11-30",
    status: "Near expiry",
  },
  {
    id: "stock-004",
    drug: "Bevacizumab",
    brand: "Avastin",
    location: "UCH, Ibadan",
    availableQuantity: 0,
    unitPriceNaira: 580000,
    batchNumber: "BV-1103-C",
    expiresOn: "2027-03-12",
    status: "Reserved",
  },
];

export const MOCK_INVENTORY_RECORDS: MockInventoryRecord[] = [
  {
    id: "1",
    drug: "Trastuzumab",
    gtin: "GTIN 0304817892",
    lot: "TZ-2204-B",
    facility: "LUTH",
    qty: 8,
    expiry: "Dec 15, 2026",
    temp: "2°C–8°C",
    status: "Near Expiry",
    statusStyle: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
    actionLabel: "Transfer",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "expiry",
  },
  {
    id: "2",
    drug: "Rituximab",
    gtin: "GTIN 0812944031",
    lot: "RX-0912-A",
    facility: "EKO Hospital",
    qty: 5,
    expiry: "Nov 30, 2026",
    temp: "2°C–8°C",
    status: "Critical Expiry",
    statusStyle: "bg-errl text-[#7f1d1d] dk:bg-[#4b0f0f] dk:text-[#fee2e2]",
    actionLabel: "Redistribute",
    actionClass: "bg-p text-white hover:bg-pd",
    category: "expiry",
  },
  {
    id: "3",
    drug: "Bevacizumab",
    gtin: "GTIN 0519273447",
    lot: "BV-1103-C",
    facility: "UCH Ibadan",
    qty: 12,
    expiry: "Mar 12, 2027",
    temp: "2°C–8°C",
    status: "Near Expiry",
    statusStyle: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
    actionLabel: "Transfer",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "expiry",
  },
  {
    id: "4",
    drug: "Trastuzumab",
    gtin: "GTIN 0304817893",
    lot: "TZ-2211-A",
    facility: "Lagos Island GH",
    qty: 20,
    expiry: "Jan 15, 2027",
    temp: "2°C–8°C",
    status: "In Stock",
    statusStyle: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
    actionLabel: "View",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "all",
  },
  {
    id: "5",
    drug: "Pertuzumab",
    gtin: "GTIN 0321847920",
    lot: "PT-0707-D",
    facility: "Lagos Island GH",
    qty: 3,
    expiry: "Sep 5, 2026",
    temp: "2°C–8°C",
    status: "Near Expiry",
    statusStyle: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
    actionLabel: "Transfer",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "expiry",
  },
  {
    id: "6",
    drug: "Rituximab",
    gtin: "GTIN 0812945002",
    lot: "RX-1044-E",
    facility: "LASUTH",
    qty: 7,
    expiry: "Jul 22, 2026",
    temp: "Breach — 11.2°C",
    status: "Quarantined",
    statusStyle: "bg-errl text-[#7f1d1d] dk:bg-[#4b0f0f] dk:text-[#fee2e2]",
    actionLabel: "Inspect",
    actionClass:
      "bg-errl text-[#991b1b] border border-[#fecaca] dk:text-w dk:border-err",
    category: "quarantine",
  },
  {
    id: "7",
    drug: "Cetuximab",
    gtin: "GTIN 0621847001",
    lot: "CE-0310-B",
    facility: "LUTH",
    qty: 9,
    expiry: "Mar 20, 2027",
    temp: "2°C–8°C",
    status: "In Stock",
    statusStyle: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
    actionLabel: "View",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "all",
  },
  {
    id: "8",
    drug: "Bevacizumab",
    gtin: "GTIN 0519273448",
    lot: "BV-1210-F",
    facility: "UCH Ibadan",
    qty: 15,
    expiry: "Feb 8, 2027",
    temp: "2°C–8°C",
    status: "In Stock",
    statusStyle: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
    actionLabel: "View",
    actionClass:
      "bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800",
    category: "all",
  },
];

export const MOCK_ORDERS: Record<
  "active" | "awaiting" | "completed",
  MockOrder[]
> = {
  active: [
    {
      id: "#0492",
      code: "C50.4",
      drug: "Trastuzumab ×2",
      insurer: "AXA Mansard",
      pharmacy: "Lagos Island GH",
      status: "Cleared",
      order: "In Transit",
      statusClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
      orderClass:
        "bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe]",
    },
    {
      id: "#0475",
      code: "C18.7",
      drug: "Bevacizumab ×3",
      insurer: "Hygeia HMO",
      pharmacy: "UCH Ibadan",
      status: "Cleared",
      order: "Dispensed",
      statusClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
      orderClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
    },
  ],
  awaiting: [
    {
      id: "#0481",
      code: "C85.1",
      drug: "Rituximab ×4",
      insurer: "NHIA",
      pharmacy: "LUTH Pharmacy",
      status: "Pending",
      order: "Held",
      statusClass: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
      orderClass: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
    },
    {
      id: "#0468",
      code: "C50.9",
      drug: "Pertuzumab ×2",
      insurer: "Reliance HMO",
      pharmacy: "EKO Hospital",
      status: "API Routing",
      order: "Waiting",
      statusClass: "bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]",
      orderClass: "bg-g100 text-g600",
    },
  ],
  completed: [
    {
      id: "#0460",
      code: "C34.1",
      drug: "Cetuximab ×1",
      insurer: "Cash Pay",
      pharmacy: "LASUTH",
      status: "Paid (demo)",
      order: "Ready",
      statusClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
      orderClass:
        "bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe]",
    },
    {
      id: "#0455",
      code: "C50.3",
      drug: "Pertuzumab ×1",
      insurer: "NHIA",
      pharmacy: "LUTH Pharmacy",
      status: "Cleared",
      order: "Delivered",
      statusClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
      orderClass: "bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]",
    },
  ],
};

export const MOCK_VERIFICATION_APPLICATIONS: MockVerificationApplication[] = [
  {
    id: "a1",
    name: "Dr. Chidinma Okafor",
    accountType: "DOCTOR",
    license: "MDCN/R/48211",
    workplace: "LUTH, Lagos",
    submitted: "12m ago",
    registryResult: "MATCH",
    status: "MANUAL_REVIEW",
  },
  {
    id: "a2",
    name: "Ph. Tunde Balogun",
    accountType: "PHARMACIST",
    license: "PCN/20987",
    workplace: "UCH, Ibadan",
    submitted: "1h ago",
    registryResult: "MATCH",
    status: "MANUAL_REVIEW",
  },
  {
    id: "a3",
    name: "HealthPlus Ikeja",
    accountType: "PHARMACY_STORE",
    license: "PCN/PREM/5543",
    workplace: "Ikeja, Lagos",
    submitted: "3h ago",
    registryResult: "UNAVAILABLE",
    status: "MANUAL_REVIEW",
  },
  {
    id: "a4",
    name: "Dr. Aisha Bello",
    accountType: "DOCTOR",
    license: "MDCN/R/51034",
    workplace: "EKO Hospital, Lagos",
    submitted: "5h ago",
    registryResult: "NO_MATCH",
    status: "MANUAL_REVIEW",
  },
  {
    id: "a5",
    name: "Ph. Emeka Eze",
    accountType: "PHARMACIST",
    license: "PCN/18842",
    workplace: "LASUTH, Lagos",
    submitted: "Yesterday",
    registryResult: "MATCH",
    status: "VERIFIED",
  },
  {
    id: "a6",
    name: "Greenfield Pharmacy",
    accountType: "PHARMACY_STORE",
    license: "PCN/PREM/3021",
    workplace: "Ibadan North",
    submitted: "Yesterday",
    registryResult: "MATCH",
    status: "VERIFIED",
  },
  {
    id: "a7",
    name: "Dr. Samuel Ade",
    accountType: "DOCTOR",
    license: "MDCN/R/00012",
    workplace: "Unknown clinic",
    submitted: "2d ago",
    registryResult: "NO_MATCH",
    status: "REJECTED",
  },
];

export const MOCK_SETTLEMENT_SUMMARY = {
  isDemo: true,
  currency: "NGN",
  transactionCount: 6,
  transactionVolumeNaira: 2450000,
  platformFeesNaira: 36750,
  payoutsQueued: 2,
};

class BridgeMockService {
  async findInvoiceByReference(reference: string): Promise<MockInvoice | null> {
    const invoice = MOCK_INVOICES.find(
      (item) => item.reference.toLowerCase() === reference.toLowerCase(),
    );
    if (invoice) {
      return { ...invoice, items: invoice.items.map((item) => ({ ...item })) };
    }

    const match = reference.match(/^OB-DEMO-(stock-\d{3})-([1-9]\d?)$/);
    if (!match) return null;
    const stockItem = MOCK_STOCK.find((item) => item.id === match[1]);
    const quantity = Number(match[2]);
    if (!stockItem || quantity > stockItem.availableQuantity) return null;

    return {
      reference,
      pharmacy: stockItem.location,
      status: "AWAITING_PAYMENT",
      items: [
        {
          description: `${stockItem.drug} (${stockItem.brand}) · batch ${stockItem.batchNumber}`,
          quantity,
          unitPriceNaira: stockItem.unitPriceNaira,
        },
      ],
      paymentMethods: ["Debit card", "Bank transfer", "USSD", "Apple Pay"],
      isDemo: true,
    };
  }

  createDemoInvoiceReference(stockId: string, quantity = 1): string | null {
    const stockItem = MOCK_STOCK.find((item) => item.id === stockId);
    if (
      !stockItem ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > stockItem.availableQuantity
    ) {
      return null;
    }
    return `OB-DEMO-${stockItem.id}-${quantity}`;
  }

  async searchStock(query: string, location = ""): Promise<MockStockItem[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();
    return MOCK_STOCK.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.drug.toLowerCase().includes(normalizedQuery) ||
        item.brand.toLowerCase().includes(normalizedQuery);
      const matchesLocation =
        !normalizedLocation ||
        item.location.toLowerCase().includes(normalizedLocation);
      return matchesQuery && matchesLocation;
    }).map((item) => ({ ...item }));
  }

  async submitPartnershipInquiry(
    _inquiry: MockPartnershipInquiry,
  ): Promise<{ reference: string; isDemo: true }> {
    return { reference: `WAOB-DEMO-${Date.now()}`, isDemo: true };
  }
}

export const BRIDGE_DATA_SERVICE = new BridgeMockService();
