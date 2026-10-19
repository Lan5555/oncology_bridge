import { ArrowRight, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import styles from "./Landing.module.css";
import MedicalIllustration from "./MedicalIllustration";
export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div data-reveal>
          <p className={styles.eyebrow}>
            <HeartPulse size={17} /> A stronger connection to care
          </p>
          <h1>
            Transforming Oncology Care &amp; Supply Chains{" "}
            <span>in West Africa.</span>
          </h1>
          <p className={styles.description}>
            Connecting verified doctors, licensed pharmacies, and global
            research partners on a secure, NDPA 2023-compliant platform.
          </p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primary}>
              <Stethoscope size={17} /> Register as a Doctor{" "}
              <ArrowRight size={16} />
            </Link>
            <Link href="/portal" className={styles.secondary}>
              Access Pharmacy Portal <ArrowRight size={16} />
            </Link>
          </div>
          <p className={styles.careNote}>
            <ShieldCheck size={23} /> From professional verification to
            traceable stock and simpler patient payments, built around
            continuity of care.
          </p>
        </div>
        <MedicalIllustration />
      </div>
    </section>
  );
}
