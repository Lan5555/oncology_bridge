import styles from '@/app/pages/landing/landing.module.css';
export default function Footer() {
  return (
    <footer>
      <div className={styles['footer-inner']}>
        <div className={styles['footer-brand']}>
          <div className={styles['nav-logo']} style={{ marginBottom: 0 }}>
            <div className={styles['nav-logo-mark']}>
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <div className={styles['nav-logo-name']}>Oncology Bridge</div>
              <div className={styles['nav-logo-tag']}>Lagos–Ibadan Network</div>
            </div>
          </div>
          <p>
            A secure visibility and verification layer for high-value cancer therapeutics in
            Nigeria. Closing the access gap, one verified vial at a time.
          </p>
        </div>
        <div className={styles['footer-col']}>
          <div className={styles['footer-col-title']}>Platform</div>
          <a href="#solution">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#roles">User Roles</a>
          <a href="#regulatory">Compliance</a>
        </div>
        <div className={styles['footer-col']}>
          <div className={styles['footer-col-title']}>For Facilities</div>
          <a href="#">Donor Hubs</a>
          <a href="#">Recipient Hubs</a>
          <a href="#">Network Admins</a>
          <a href="#">Courier Partners</a>
        </div>
        <div className={styles['footer-col']}>
          <div className={styles['footer-col-title']}>Company</div>
          <a href="#">About Us</a>
          <a href="#">White Paper</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className={styles['footer-bottom']}>
        <div>© 2026 Oncology Bridge Platform. Lagos–Ibadan Oncology Corridor.</div>
        <div className={styles['footer-badges']}>
          <span className={styles['fbadge']}>NAFDAC L4</span>
          <span className={styles['fbadge']}>GS1 Certified</span>
          <span className={styles['fbadge']}>AES-256</span>
          <span className={styles['fbadge']}>NDPR</span>
        </div>
      </div>
    </footer>
  );
}
