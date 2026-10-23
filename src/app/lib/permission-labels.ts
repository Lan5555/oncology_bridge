type PermissionDetails = { label: string; description: string };

const labels: Record<string, PermissionDetails> = {
  "prescription.review": {
    label: "Review prescription authorization",
    description:
      "Approve or reject eligible prescriptions and record an audited reason.",
  },
  "order.read": {
    label: "View orders",
    description:
      "Track purchase, payment and fulfillment details within the authorized scope.",
  },
  "order.manage": {
    label: "Manage order fulfillment",
    description:
      "Update allowed fulfillment stages and shipping details. Payment status is verified separately.",
  },
  "dashboard.read": {
    label: "View dashboard",
    description: "See dashboard summaries and activity.",
  },
  "verification.review": {
    label: "Review registrations",
    description: "Review licence checks and approve or reject registrations.",
  },
  "user.read": {
    label: "View users",
    description: "See user profiles and account status.",
  },
  "user.manage": {
    label: "Manage users",
    description: "Manage user accounts within the permitted scope.",
  },
  "role.manage": {
    label: "Manage roles and permissions",
    description: "Create roles and change which actions each role can perform.",
  },
  "facility.read": {
    label: "View facilities",
    description: "See facility profiles and status.",
  },
  "facility.update": {
    label: "Update facilities",
    description: "Change facility details and status where authorized.",
  },
  "facility.users.manage": {
    label: "Manage facility team",
    description:
      "Invite staff, review join requests, and manage facility members.",
  },
  "inventory.read": {
    label: "View inventory",
    description: "See stock batches, quantities, and expiry information.",
  },
  "inventory.manage": {
    label: "Manage inventory",
    description:
      "Add stock and manage inventory batches for authorized facilities.",
  },
  "medicine.read": {
    label: "View medicine catalogue",
    description: "Browse medicine names, identifiers, and product details.",
  },
  "medicine.manage": {
    label: "Manage medicine catalogue",
    description: "Create and update catalogue records where authorized.",
  },
  "marketplace.read": {
    label: "View marketplace listings",
    description: "See medicine listings and seller details.",
  },
  "marketplace.listings.manage": {
    label: "Manage marketplace listings",
    description:
      "Create and manage listings for eligible facility stock, subject to seller requirements.",
  },
  "prescription.read": {
    label: "View prescriptions",
    description: "See prescription records within the permitted scope.",
  },
  "prescription.manage": {
    label: "Manage prescriptions",
    description: "Manage prescription records where authorized.",
  },
  "invoice.read": {
    label: "View invoices and payments",
    description: "See invoices and payment records.",
  },
  "transfer.read": {
    label: "View stock transfers",
    description: "See redistribution requests and transfer records.",
  },
  "transfer.manage": {
    label: "Manage stock transfers",
    description: "Manage redistribution of eligible stock between facilities.",
  },
  "scan.read": {
    label: "View scan records",
    description: "See recorded product scans and verification results.",
  },
  "coldchain.read": {
    label: "View cold-chain monitoring",
    description:
      "See storage units, temperature readings, and cold-chain events.",
  },
  "coldchain.manage": {
    label: "Manage cold-chain monitoring",
    description: "Manage storage and cold-chain records where authorized.",
  },
  "network.read": {
    label: "View network directory",
    description: "Browse facilities in the care network.",
  },
  "audit.read": {
    label: "View activity history",
    description: "Review recorded account actions and changes.",
  },
  "settlement.read": {
    label: "View settlements",
    description: "See settlement summaries and payment distribution records.",
  },
  "integration.read": {
    label: "View integrations",
    description: "See connection health and integration status.",
  },
  "integration.manage": {
    label: "Configure integrations",
    description: "Update integration settings and test connections.",
  },
  "integration.sync": {
    label: "Run integration sync",
    description: "Start a manual sync with connected services.",
  },
  "research.read": {
    label: "View research inquiries",
    description: "See submitted research inquiries.",
  },
};

/** Labels are display text only. Always submit the original permission key. */
export function permissionDetails(key: string): PermissionDetails {
  if (Object.hasOwn(labels, key)) return labels[key];
  const words = key.split(/[._\s-]+/).filter(Boolean);
  const action = words.pop() ?? "";
  const verbs: Record<string, string> = {
    read: "View",
    view: "View",
    manage: "Manage",
    create: "Create",
    update: "Update",
    delete: "Delete",
    list: "View",
    approve: "Approve",
    review: "Review",
    export: "Export",
    publish: "Publish",
  };
  const text =
    verbs[action] && words.length
      ? `${verbs[action]} ${words.join(" ")}`
      : [...words, action].join(" ");
  return {
    label: text ? text[0].toUpperCase() + text.slice(1) : key,
    description: "Access is defined by the permission’s server-side rules.",
  };
}
