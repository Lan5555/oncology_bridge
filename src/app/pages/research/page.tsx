"use client";

import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Database,
  Dna,
  FileCheck2,
  Globe2,
  Loader2,
  Mail,
  Microscope,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "@/app/components/Landing/Footer";
import Nav from "@/app/components/Landing/Nav";
import MotionPage from "@/app/components/MotionPage";
import { BRIDGE_DATA_SERVICE } from "@/app/services/bridge-data/bridge-data-service";
import styles from "./ResearchPage.module.css";

const CAPABILITIES = [
  {
    icon: Database,
    eyebrow: "Clinical data",
    title: "Structured research information",
    body: "Discuss how clinical phenotype records, diagnosis coding and biomarker information can support a well-defined research programme.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Governance",
    title: "Consent and institutional oversight",
    body: "Start with the study's consent requirements, access responsibilities and ethics review needs when planning a collaboration.",
  },
  {
    icon: Dna,
    eyebrow: "Site operations",
    title: "Coordination across clinical sites",
    body: "Explore the practical needs of participating sites, sample tracking and follow-up workflows as part of your project scope.",
  },
];
const PARTNERS = [
  {
    title: "Biopharma & industry",
    body: "Discuss oncology programmes and clinical-site collaboration.",
    icon: Building2,
  },
  {
    title: "Academic institutions",
    body: "Explore research partnerships and biobank coordination.",
    icon: Microscope,
  },
  {
    title: "Clinical research teams",
    body: "Outline study operations and participating-site needs.",
    icon: Globe2,
  },
];
type Field = "organization" | "representativeName" | "email" | "projectScope";

export default function ResearchPage() {
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<{
    success: boolean;
    text: string;
  } | null>(null);
  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = {
      organization: String(data.get("organization") ?? "").trim(),
      representativeName: String(data.get("representativeName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      projectScope: String(data.get("projectScope") ?? "").trim(),
    };
    const nextErrors: Partial<Record<Field, string>> = {};
    for (const key of Object.keys(fields) as Field[])
      if (!fields[key]) nextErrors[key] = "Please complete this field.";
    setErrors(nextErrors);
    setNotice(null);
    const invalid = (Object.keys(nextErrors) as Field[])[0];
    if (invalid) {
      form.querySelector<HTMLElement>('[name="' + invalid + '"]')?.focus();
      return;
    }
    submissionLock.current = true;
    setSubmitting(true);
    const toastId = toast.loading("Sending your partnership inquiry...");
    try {
      const result = await BRIDGE_DATA_SERVICE.submitPartnershipInquiry({
        organization: fields.organization,
        name: fields.representativeName,
        email: fields.email,
        projectScope: fields.projectScope,
      });
      const text = result.success
        ? result.reference
          ? "Inquiry submitted. Reference: " + result.reference + "."
          : result.message || "Your partnership inquiry has been submitted."
        : result.message ||
          "Your inquiry could not be sent. Your details are still here so you can try again.";
      setNotice({ success: result.success, text });
      if (result.success) {
        toast.success(text, { id: toastId });
        form.reset();
      } else toast.error(text, { id: toastId });
    } catch {
      const text =
        "Your inquiry could not be sent. Please try again. Your details have been kept.";
      setNotice({ success: false, text });
      toast.error(text, { id: toastId });
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };
  return (
    <MotionPage className={styles.page}>
      <Nav />
      <main>
        <section className={styles.hero}>
          <div data-reveal className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <Globe2 size={16} /> Enterprise &amp; Research
            </p>
            <h1>
              Connect local expertise.
              <br />
              <span>Build meaningful research partnerships.</span>
            </h1>
            <p className={styles.lead}>
              Bring your organisation's oncology research and clinical-site
              collaboration needs to Oncosourz. Start with a clear conversation
              about the people, processes and scope behind your programme.
            </p>
            <a href="#partnership-inquiry" className={styles.primary}>
              Discuss a partnership <ArrowRight size={17} />
            </a>
            <p className={styles.heroNote}>
              <ShieldCheck size={16} /> A focused starting point for
              institutional collaboration.
            </p>
          </div>
          <div data-reveal className={styles.researchVisual}>
            <div
              className={styles.image}
              role="img"
              aria-label="Laboratory equipment and clinical research setting"
            />
            <div className={styles.visualCaption}>
              <span className={styles.visualIcon}>
                <Microscope size={23} />
              </span>
              <div>
                <strong>West African Oncology Bridge</strong>
                <p>Connecting clinical sites and research conversations.</p>
              </div>
            </div>
          </div>
        </section>
        <section
          className={styles.section}
          aria-labelledby="collaboration-heading"
        >
          <div className={styles.inner}>
            <div data-reveal className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Areas for collaboration</p>
                <h2 id="collaboration-heading">
                  Built around the practical
                  <br />
                  needs of oncology research.
                </h2>
              </div>
              <p>
                Use the briefing to identify your project priorities and discuss
                an appropriate collaboration scope.
              </p>
            </div>
            <div className={styles.cardGrid}>
              {CAPABILITIES.map(({ icon: Icon, ...item }) => (
                <article
                  data-reveal
                  data-motion-card
                  key={item.title}
                  className={styles.card}
                >
                  <span className={styles.icon}>
                    <Icon size={24} />
                  </span>
                  <p className={styles.eyebrow}>{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className={styles.pathways} aria-labelledby="partner-heading">
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Partner pathways</p>
            <h2 id="partner-heading">
              Different organisations.
              <br />A shared interest in better oncology care.
            </h2>
            <div className={styles.partnerGrid}>
              {PARTNERS.map(({ title, body, icon: Icon }) => (
                <article data-reveal key={title}>
                  <Icon size={22} />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className={styles.inquiry}
          id="partnership-inquiry"
          aria-labelledby="inquiry-title"
        >
          <div className={styles.inquiryGrid}>
            <aside data-reveal className={styles.inquiryIntro}>
              <p className={styles.eyebrow}>Let's start a conversation</p>
              <h2 id="inquiry-title">
                Tell us what you'd
                <br />
                like to build together.
              </h2>
              <p>
                Share a little about your organisation and the project you have
                in mind. A clear overview helps frame the next conversation.
              </p>
              <div className={styles.briefing}>
                <h3>A useful starting point</h3>
                {[
                  "Your organisation and its role",
                  "The research question or operational need",
                  "The sites, region or collaboration scope",
                  "What you would like to discuss next",
                ].map((item) => (
                  <p key={item}>
                    <Check size={16} />
                    {item}
                  </p>
                ))}
              </div>
              <div className={styles.privacyNote}>
                <ShieldCheck size={20} />
                <p>
                  Use this form for business inquiries. Please leave out
                  participant names, patient records and other sensitive
                  personal information.
                </p>
              </div>
            </aside>
            <form
              data-reveal
              onSubmit={submitInquiry}
              className={styles.form}
              aria-busy={submitting}
            >
              <div className={styles.formHeader}>
                <span className={styles.icon}>
                  <Mail size={21} />
                </span>
                <div>
                  <h3>Partnership inquiry</h3>
                  <p>All fields are required.</p>
                </div>
              </div>
              <fieldset disabled={submitting} className={styles.fields}>
                <legend className="sr-only">
                  Organisation and project details
                </legend>
                <div className={styles.field}>
                  <label htmlFor="organization">
                    Organisation name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    autoComplete="organization"
                    placeholder="Your organisation"
                    required
                    maxLength={200}
                    aria-invalid={Boolean(errors.organization)}
                    aria-describedby={
                      errors.organization ? "organization-error" : undefined
                    }
                  />
                  {errors.organization ? (
                    <span id="organization-error" className={styles.fieldError}>
                      {errors.organization}
                    </span>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="representative-name">
                    Your full name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="representative-name"
                    name="representativeName"
                    autoComplete="name"
                    placeholder="First and last name"
                    required
                    maxLength={160}
                    aria-invalid={Boolean(errors.representativeName)}
                    aria-describedby={
                      errors.representativeName ? "name-error" : undefined
                    }
                  />
                  {errors.representativeName ? (
                    <span id="name-error" className={styles.fieldError}>
                      {errors.representativeName}
                    </span>
                  ) : null}
                </div>
                <div className={styles.fullField}>
                  <label htmlFor="contact-email">
                    Contact email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@organisation.com"
                    required
                    maxLength={254}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email ? (
                    <span id="email-error" className={styles.fieldError}>
                      {errors.email}
                    </span>
                  ) : null}
                </div>
                <div className={styles.fullField}>
                  <label htmlFor="project-scope">
                    What would you like to discuss?{" "}
                    <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="project-scope"
                    name="projectScope"
                    rows={6}
                    placeholder="Describe your project, goals and the collaboration you are looking for."
                    required
                    maxLength={4000}
                    aria-invalid={Boolean(errors.projectScope)}
                    aria-describedby={
                      errors.projectScope
                        ? "scope-help scope-error"
                        : "scope-help"
                    }
                  />
                  <span id="scope-help" className={styles.helper}>
                    A brief overview is enough. Up to 4,000 characters.
                  </span>
                  {errors.projectScope ? (
                    <span id="scope-error" className={styles.fieldError}>
                      {errors.projectScope}
                    </span>
                  ) : null}
                </div>
              </fieldset>
              {notice ? (
                <output
                  className={styles.result}
                  data-success={notice.success}
                  aria-live="polite"
                >
                  {notice.success ? <CheckCircle2 size={19} /> : null}
                  <span>{notice.text}</span>
                </output>
              ) : null}
              <div className={styles.formFooter}>
                <p>Your inquiry will be sent to the Oncosourz team.</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.primary}
                >
                  {submitting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : null}
                  {submitting ? "Sending inquiry..." : "Send inquiry"}
                  {!submitting ? <ArrowRight size={17} /> : null}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </MotionPage>
  );
}
