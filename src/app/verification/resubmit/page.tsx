import type { Metadata } from "next";
import VerificationResubmission from "../../components/VerificationResubmission";

export const metadata: Metadata = {
  title: "Submit a new licence | Oncosourz",
  robots: { index: false, follow: false },
};

export default function VerificationResubmissionPage() {
  return <VerificationResubmission />;
}
