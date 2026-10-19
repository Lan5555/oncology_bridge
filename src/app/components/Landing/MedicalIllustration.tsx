import { HeartPulse, ScanLine, ShieldCheck } from "lucide-react";
import styles from "./Landing.module.css";

export default function MedicalIllustration() {
  return (
    <div data-reveal className={styles.medicalVisual}>
      <div className={styles.visualLabel}>
        <HeartPulse size={16} /> Connected oncology care
      </div>
      <svg
        viewBox="0 0 520 480"
        className={styles.illustration}
        role="img"
        aria-label="Illustration of a clinician connecting patient care with traceable medicines"
      >
        <defs>
          <linearGradient id="care-bg" x2="1" y2="1">
            <stop stopColor="var(--landing-illustration-start)" />
            <stop offset="1" stopColor="var(--landing-illustration-end)" />
          </linearGradient>
          <linearGradient id="care-scrubs" x2="1" y2="1">
            <stop stopColor="#247b83" />
            <stop offset="1" stopColor="#125264" />
          </linearGradient>
        </defs>
        <circle cx="265" cy="240" r="202" fill="url(#care-bg)" />
        <g fill="none" stroke="#a5cbcc" strokeWidth="1.5">
          <circle cx="265" cy="240" r="224" strokeDasharray="3 9" />
          <path d="M50 180h75m272 70h76M150 52v52m260 275v42" />
        </g>
        <g fill="#fff">
          <path d="M423 112h13V99h15v13h13v15h-13v13h-15v-13h-13z" />
          <path d="M78 291h10v-10h12v10h10v12h-10v10H88v-10H78z" />
        </g>
        <ellipse
          cx="270"
          cy="434"
          rx="163"
          ry="16"
          fill="#164b63"
          opacity=".08"
        />
        <path
          d="M151 429v-98c0-49 40-87 88-87h52c49 0 88 38 88 87v98"
          fill="url(#care-scrubs)"
        />
        <path d="M222 241l43 61 43-61-8 188h-71z" fill="#e9f2f3" />
        <path d="M246 206h38v55l-19 20-19-20z" fill="#a76648" />
        <ellipse cx="265" cy="157" rx="56" ry="70" fill="#b87e59" />
        <path
          d="M210 159c-25-75 5-112 56-112 48 0 76 36 53 111l-10-29-7-24c-22 17-48 21-79 18z"
          fill="#102c41"
        />
        <path
          d="M219 164c14 12 27 16 46 16s35-5 47-16l-10 46c-22 18-49 18-73 0z"
          fill="#d5ebeb"
        />
        <path d="M225 166l-15-6m101 6 10-6" stroke="#ecf5f4" strokeWidth="3" />
        <path
          d="M226 253c-23 61-10 101 15 101 29 0 29-43 5-47-24-4-28 33-3 42m63-96c12 42 11 66-12 79"
          fill="none"
          stroke="#092c42"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle
          cx="290"
          cy="335"
          r="13"
          fill="#c8d7df"
          stroke="#092c42"
          strokeWidth="5"
        />
        <path d="M177 348l51 32 46-59 63 42-40 66H178z" fill="#fcfdfd" />
        <rect
          x="246"
          y="319"
          width="102"
          height="119"
          rx="10"
          fill="#143b55"
          transform="rotate(12 246 319)"
        />
        <path
          d="M264 354l46 10m-50 6 46 10m-50 6 29 6"
          stroke="#88b7bf"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse
          cx="221"
          cy="394"
          rx="35"
          ry="17"
          fill="#b87e59"
          transform="rotate(18 221 394)"
        />
        <g transform="translate(72 340)">
          <rect width="77" height="88" rx="12" fill="#fff" />
          <rect x="18" y="-17" width="41" height="23" rx="5" fill="#193e57" />
          <rect y="31" width="77" height="31" fill="#d9eceb" />
          <path d="M31 40h15m-7-7v15" stroke="#257b83" strokeWidth="4" />
          <path d="M15 73h47" stroke="#b8cdd1" strokeWidth="3" />
        </g>
        <g transform="translate(375 342)">
          <rect width="72" height="88" rx="8" fill="#fff" />
          <path d="M0 20h72" stroke="#be9b43" strokeWidth="9" />
          <path d="M17 43h37m-37 11h29" stroke="#b8cdd1" strokeWidth="4" />
          <path
            d="M17 70h3m5 0h2m5 0h4m5 0h2m5 0h5"
            stroke="#193e57"
            strokeWidth="12"
          />
        </g>
      </svg>
      <div className={styles.visualNote}>
        <ShieldCheck size={21} />
        <div>
          <strong>People first. Care connected.</strong>
          <span>Professional verification at every entry point.</span>
        </div>
      </div>
      <div className={styles.traceLabel}>
        <ScanLine size={17} /> Batch-level traceability
      </div>
    </div>
  );
}
