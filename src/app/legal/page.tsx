import Link from "next/link";

export default function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] px-6 py-12 text-[#19332f]">
      <div className="mx-auto max-w-[760px]">
        <Link
          className="text-sm font-bold text-[#126b5d] hover:text-[#173b35]"
          href="/"
        >
          Oncosourz
        </Link>
        <h1 className="mt-10 font-display text-3xl font-extrabold text-[#173b35]">
          Legal information
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#53665f]">
          The policies below have not been published in this deployment. This
          page does not replace legal advice or a formal privacy notice.
        </p>
        <section
          className="mt-10 border-t border-[#ccd9d1] pt-6"
          id="privacy-policy"
        >
          <h2 className="font-display text-xl font-bold text-[#173b35]">
            Privacy Policy (NDPA 2023)
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#53665f]">
            The Oncosourz privacy policy is pending publication and review. Do
            not submit patient or other sensitive personal data through this
            preview.
          </p>
          <Link
            className="mt-3 inline-block text-sm font-semibold text-[#126b5d]"
            href="/research#partnership-inquiry"
          >
            <span id="dpo-contact">Contact the DPO</span>
          </Link>
        </section>
        <section
          className="mt-8 border-t border-[#ccd9d1] pt-6"
          id="terms-of-service"
        >
          <h2 className="font-display text-xl font-bold text-[#173b35]">
            Terms of Service
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#53665f]">
            The terms of service are pending publication and legal review.
            Portal data and actions in this deployment may be illustrative and
            are not a binding service offer.
          </p>
        </section>
      </div>
    </main>
  );
}
