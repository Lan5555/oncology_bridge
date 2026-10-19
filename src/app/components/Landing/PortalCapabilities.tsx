import {
  ArrowRight,
  Boxes,
  CalendarClock,
  CreditCard,
  ScanLine,
  ShieldCheck,
  Snowflake,
  Users,
} from "lucide-react";
import Link from "next/link";
import styles from "./Landing.module.css";

const capabilities = [
  {
    icon: Boxes,
    title: "A clearer view of available medicines",
    body: "Explore oncology listings with product photographs, strength, selling unit, price, supplying facility, batch and expiry details. Check the listing before starting a purchase.",
    tag: "Medicine marketplace",
  },
  {
    icon: ScanLine,
    title: "Traceability starts with the batch",
    body: "Scan product identifiers or enter them manually. Review the decoded batch, expiry and serial details before recording a scan in the ledger.",
    tag: "GS1 scanning",
  },
  {
    icon: CalendarClock,
    title: "Make expiry part of everyday planning",
    body: "Review near-expiry stock alongside quantities and batch details. Authorized teams can request transfers to eligible recipient facilities.",
    tag: "Stock & redistribution",
  },
  {
    icon: Snowflake,
    title: "Keep storage records in view",
    body: "Review recorded temperatures, unit-specific target ranges and storage events. Use the history to follow up on readings that need attention.",
    tag: "Cold-chain monitoring",
  },
  {
    icon: Users,
    title: "Give each team member the right tools",
    body: "Facility administrators review join requests, invite colleagues and manage access. Inventory and other tools are available according to assigned permissions.",
    tag: "Facility workspaces",
  },
  {
    icon: CreditCard,
    title: "Make the next payment step clear",
    body: "Patients and families can enter an invoice reference, review the medicine cost and continue to Paystack without creating an Oncosourz account.",
    tag: "Guest checkout",
  },
];

export default function PortalCapabilities() {
  return (
    <section
      className={styles.contentSection}
      id="portal-capabilities"
      aria-labelledby="capabilities-heading"
    >
      <div className={styles.sectionInner}>
        <div data-reveal className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Inside the Bridge Portal</p>
            <h2 id="capabilities-heading">
              The details behind
              <br />
              better connected care.
            </h2>
          </div>
          <p className={styles.sectionIntro}>
            Bring medicine discovery, facility stock and patient payments into a
            shared workflow, with the right access for each professional.
          </p>
        </div>
        <div className={styles.capabilityGrid}>
          {capabilities.map(({ icon: Icon, title, body, tag }) => (
            <article
              data-reveal
              data-motion-card
              className={styles.capabilityCard}
              key={tag}
            >
              <div className={styles.capabilityTop}>
                <span className={styles.featureIcon}>
                  <Icon size={23} aria-hidden="true" />
                </span>
                <span className={styles.featureTag}>{tag}</span>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div data-reveal className={styles.accessNote}>
          <ShieldCheck size={23} aria-hidden="true" />
          <p>
            <strong>Professional access, with clear responsibilities.</strong>{" "}
            Account verification, facility membership and assigned permissions
            determine which actions are available. A registry lookup provides
            review evidence; membership and licence approval remain separate
            decisions.
          </p>
          <Link href="/register">
            Join the network <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
