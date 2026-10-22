import type { Metadata } from "next";
import PasswordRecovery from "../components/PasswordRecovery";

export const metadata: Metadata = {
  title: "Forgot password | Oncosourz",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <PasswordRecovery mode="request" />;
}
