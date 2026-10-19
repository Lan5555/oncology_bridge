import {
  ArrowDown,
  ArrowUpRight,
  Check,
  FileText,
  HelpCircle,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import styles from "./Landing.module.css";

const stockSteps = [
  {
    title: "Create the medicine record",
    body: "Start with the product identity, such as the generic name, brand and strength. This describes the medicine, independently of a seller's stock.",
  },
  {
    title: "Record the facility's stock",
    body: "Authorized staff add the inventory batch with its quantity and expiry. Scanning helps capture identifiers; staff still review the details and complete stock intake.",
  },
  {
    title: "Prepare a marketplace listing",
    body: "Eligible sellers select their inventory batch and add photographs, a price, selling unit and product information. The listing stays linked to that stock.",
  },
  {
    title: "Review, pay and fulfil",
    body: "The buyer selects a quantity and provides a prescription reference when required. Payment confirmation is followed by the facility's fulfilment and release checks.",
  },
];
const questions = [
  {
    question: "Who can use the Bridge Portal?",
    answer:
      "The portal supports doctors, pharmacists and pharmacy stores. Professional verification and facility membership are reviewed before access is granted. The tools you see depend on your account and assigned permissions.",
  },
  {
    question: "Does scanning a barcode automatically add stock?",
    answer:
      "A scan captures product identifiers and can be recorded in the scan ledger. It does not by itself establish available stock. Authorized staff must confirm the product and batch details and complete inventory intake with a quantity.",
  },
  {
    question: "Are a medicine record and a marketplace listing the same?",
    answer:
      "A medicine record describes the product. Inventory records describe a facility's stock batches. A marketplace listing links to an eligible inventory batch and adds the seller's photographs, price and selling information.",
  },
  {
    question: "Do patients need an account to pay?",
    answer:
      "No. Use the invoice reference supplied by your care team in Quick Pay. Review the invoice details before continuing to Paystack. Only payment methods supported and enabled for that checkout are offered.",
  },
  {
    question: "What happens after payment?",
    answer:
      "Payment is confirmed through the invoice service. The supplying facility then continues order processing and any required prescription, dispensing or release checks. A payment confirmation is separate from delivery confirmation.",
  },
  {
    question: "How can my organisation discuss a partnership?",
    answer:
      "Visit Enterprise & Research to explore the partnership areas and submit an inquiry about your organisation's needs. The team can discuss the appropriate scope and next steps with you.",
  },
];

export default function PracticalGuide() {
  return (
    <>
      <section
        className={styles.guideSection}
        id="stock-to-care"
        aria-labelledby="stock-guide-heading"
      >
        <div className={styles.guideGrid}>
          <div data-reveal className={styles.guideIntro}>
            <p className={styles.eyebrow}>
              <PackageCheck size={16} /> From stock to care
            </p>
            <h2 id="stock-guide-heading">
              One medicine.
              <br />A connected record
              <br />
              at every step.
            </h2>
            <p>
              Product identity, stock ownership and purchasing details serve
              different purposes. Keeping them connected gives teams a clearer
              picture of what they are working with.
            </p>
            <div className={styles.checklist}>
              <h3>
                <FileText size={17} /> Before listing stock
              </h3>
              {[
                "Confirm the correct medicine and batch",
                "Review quantity, expiry and selling unit",
                "Add clear photographs and product details",
                "Check your facility's listing permissions",
              ].map((item) => (
                <p key={item}>
                  <Check size={15} />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <ol className={styles.stockSteps}>
            {stockSteps.map((step, index) => (
              <li data-reveal key={step.title}>
                <span className={styles.stepNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {index < stockSteps.length - 1 ? (
                    <ArrowDown
                      className={styles.stepArrow}
                      size={17}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        className={styles.contentSection}
        id="frequently-asked"
        aria-labelledby="faq-heading"
      >
        <div data-reveal className={styles.faqGrid}>
          <div>
            <p className={styles.eyebrow}>
              <HelpCircle size={16} /> A little more clarity
            </p>
            <h2 id="faq-heading">
              Questions before
              <br />
              you get started?
            </h2>
            <p className={styles.sectionIntro}>
              Understand the steps, the people responsible and what happens
              next.
            </p>
            <Link
              className={styles.textLink}
              href="/research#partnership-inquiry"
            >
              Discuss your organisation's needs <ArrowUpRight size={17} />
            </Link>
          </div>
          <div>
            {questions.map(({ question, answer }) => (
              <details key={question} className={styles.faqItem}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section data-reveal className={styles.joinSection}>
        <div className={styles.sectionInner}>
          <ShieldCheck size={30} className={styles.joinIcon} />
          <p className={styles.eyebrow}>Your next step</p>
          <h2>
            Bring your team into
            <br />a more connected care network.
          </h2>
          <p>
            Register your professional account or sign in to continue in your
            facility workspace.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/register">
              Create a professional account <ArrowUpRight size={17} />
            </Link>
            <Link className={styles.secondary} href="/login">
              Log in to your workspace
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
