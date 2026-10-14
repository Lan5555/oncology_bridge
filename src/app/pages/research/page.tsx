"use client";

import {
  ArrowRight,
  Database,
  Dna,
  FileCheck2,
  Globe2,
  Microscope,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { BRIDGE_DATA_SERVICE } from "@/app/services/bridge-data/bridge-mock-service";

const CAPABILITIES = [
  {
    icon: Database,
    eyebrow: "01 / Clinical data",
    title: "Structured phenotype capture",
    body: "Translate clinical notes into standardized ICD-10 diagnoses, TNM staging, and biomarker profiles linked to coded biological sample IDs.",
  },
  {
    icon: FileCheck2,
    eyebrow: "02 / Governance",
    title: "Data sovereignty and ethics",
    body: "Design for NDPA 2023 handling of sensitive personal data, local hosting requirements, auditable consent, and institution-led access controls.",
  },
  {
    icon: Dna,
    eyebrow: "03 / Site operations",
    title: "Longitudinal site coordination",
    body: "Coordinate recruitment, baseline sampling, liquid biopsy tracking, and 12-month follow-up cycles across regional teaching hospitals.",
  },
];

const PARTNERS = [
  "Biopharma consortiums",
  "Academic biobanks",
  "Clinical trial organizations",
];

export default function ResearchPage() {
  const [notice, setNotice] = useState("");

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await BRIDGE_DATA_SERVICE.submitPartnershipInquiry({
      organization: String(formData.get("organization") ?? ""),
      representativeTitle: String(formData.get("representativeTitle") ?? ""),
      projectScope: String(formData.get("projectScope") ?? ""),
      email: String(formData.get("email") ?? ""),
    });
    setNotice(
      `Demo inquiry ${result.reference} accepted in this page only. No email was sent and the details were not stored.`,
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#16312d]">
      <header className="border-b border-[#dce5df] bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-7 py-4 max-[600px]:px-5">
          <Link
            href="/"
            className="font-display text-lg font-extrabold text-[#173b35]"
          >
            Oncosourz
          </Link>
          <nav
            className="flex items-center gap-6 text-sm font-medium text-[#53665f] max-[600px]:gap-3 max-[600px]:text-xs"
            aria-label="Main navigation"
          >
            <Link href="/" className="hover:text-[#126b5d]">
              Home
            </Link>
            <Link href="/portal" className="hover:text-[#126b5d]">
              Bridge Portal
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-[#173b35] px-4 py-2 font-bold text-white hover:bg-[#126b5d]"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1200px] grid-cols-[1fr_0.84fr] items-center gap-14 px-7 pb-20 pt-16 max-[800px]:grid-cols-1 max-[600px]:px-5 max-[600px]:pt-10">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#a04f2a]">
            <Globe2 className="size-4" aria-hidden="true" /> West African
            Oncology Bridge (WAOB)
          </p>
          <h1 className="max-w-[700px] font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[1.07] text-[#173b35]">
            WAOB Infrastructure: Bridging African Clinical Sites with Global
            Genomic Research.
          </h1>
          <p className="mt-6 max-w-[660px] text-base leading-8 text-[#52665f]">
            Compliant digital site coordination, dynamic consent management, and
            FHIR-structured clinical phenotype data pipelines across West
            Africa.
          </p>
          <a
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#a04f2a] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7e3c20]"
            href="#partnership-inquiry"
          >
            Request a partnership briefing{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div
          aria-label="Researcher reviewing clinical laboratory samples"
          className="relative min-h-[360px] overflow-hidden border border-[#d3ded7] bg-[#dce9e2] bg-cover bg-center max-[800px]:min-h-[280px]"
          role="img"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=85&w=1100)",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 bg-[#173b35]/90 px-5 py-4 text-sm font-semibold text-white">
            Clinical sites connected to consent-led, structured research data
          </div>
          <div className="absolute right-4 top-4 flex size-12 items-center justify-center bg-white/90 text-[#a04f2a]">
            <Microscope className="size-6" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce5df] bg-white px-7 py-16 max-[600px]:px-5">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-3 text-xs font-bold uppercase text-[#a04f2a]">
            Research infrastructure
          </p>
          <h2 className="max-w-[600px] font-display text-3xl font-extrabold leading-tight text-[#173b35]">
            Built for the realities of multi-site oncology research.
          </h2>
          <div className="mt-9 grid grid-cols-3 gap-8 max-[760px]:grid-cols-1">
            {CAPABILITIES.map(({ icon: Icon, ...item }) => (
              <article
                className="border-t border-[#ccd9d1] pt-5"
                key={item.title}
              >
                <Icon
                  className="mb-6 size-6 text-[#a04f2a]"
                  aria-hidden="true"
                />
                <p className="mb-2 text-[11px] font-bold uppercase text-[#73847b]">
                  {item.eyebrow}
                </p>
                <h3 className="mb-3 font-display text-lg font-bold text-[#173b35]">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-[#53665f]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf0eb] px-7 py-14 max-[600px]:px-5">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[0.7fr_1fr] gap-10 max-[760px]:grid-cols-1">
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-[#a04f2a]">
              Partner pathways
            </p>
            <h2 className="font-display text-2xl font-extrabold leading-tight text-[#173b35]">
              Designed for collaboration across the research lifecycle.
            </h2>
          </div>
          <ul className="grid grid-cols-3 gap-4 max-[600px]:grid-cols-1">
            {PARTNERS.map((partner) => (
              <li
                className="border-l-2 border-[#a04f2a] py-2 pl-4 text-sm font-semibold leading-6 text-[#314d45]"
                key={partner}
              >
                {partner}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-7 py-20 max-[600px]:px-5" id="partnership-inquiry">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[0.8fr_1fr] gap-14 max-[800px]:grid-cols-1">
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-[#a04f2a]">
              Partnership inquiry
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-[#173b35]">
              Start with a focused briefing.
            </h2>
            <p className="mt-4 max-w-[440px] text-sm leading-7 text-[#53665f]">
              Tell us about your organization and research scope. Please do not
              include participant names, health records, or other sensitive
              personal data.
            </p>
          </div>
          <form
            className="grid grid-cols-2 gap-x-5 gap-y-4 border border-[#d6e0d9] bg-white p-6 max-[560px]:grid-cols-1"
            onSubmit={submitInquiry}
          >
            <label
              className="text-xs font-bold text-[#314d45]"
              htmlFor="organization"
            >
              Organization name
              <input
                className="mt-2 rounded-md border border-[#cbd7d0] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#126b5d] focus:ring-2 focus:ring-[#126b5d]/15"
                id="organization"
                name="organization"
                required
              />
            </label>
            <label
              className="text-xs font-bold text-[#314d45]"
              htmlFor="representative-title"
            >
              Representative title
              <input
                className="mt-2 rounded-md border border-[#cbd7d0] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#126b5d] focus:ring-2 focus:ring-[#126b5d]/15"
                id="representative-title"
                name="representativeTitle"
                required
              />
            </label>
            <label
              className="col-span-2 text-xs font-bold text-[#314d45] max-[560px]:col-span-1"
              htmlFor="project-scope"
            >
              Project scope
              <textarea
                className="mt-2 min-h-32 resize-y rounded-md border border-[#cbd7d0] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#126b5d] focus:ring-2 focus:ring-[#126b5d]/15"
                id="project-scope"
                name="projectScope"
                required
              />
            </label>
            <label
              className="col-span-2 text-xs font-bold text-[#314d45] max-[560px]:col-span-1"
              htmlFor="contact-email"
            >
              Direct contact email
              <input
                className="mt-2 rounded-md border border-[#cbd7d0] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#126b5d] focus:ring-2 focus:ring-[#126b5d]/15"
                id="contact-email"
                name="email"
                required
                type="email"
              />
            </label>
            <div className="col-span-2 max-[560px]:col-span-1">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[#173b35] px-5 py-3 text-sm font-bold text-white hover:bg-[#126b5d]"
                type="submit"
              >
                Send inquiry{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              {notice ? (
                <p aria-live="polite" className="mt-3 text-sm text-[#8d3d25]">
                  {notice}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#dce5df] bg-[#173b35] px-7 py-6 text-sm text-white/75 max-[600px]:px-5">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
          <span>Oncosourz Ltd. · WAOB research infrastructure</span>
          <Link
            href="/"
            className="font-semibold text-white hover:text-[#bee7d7]"
          >
            Return to Oncosourz
          </Link>
        </div>
      </footer>
    </main>
  );
}
