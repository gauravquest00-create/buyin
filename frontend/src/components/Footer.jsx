import Link from 'next/link';
import styles from '../styles/site.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.brandWrap} style={{ marginBottom: 12 }}>
              <span className={styles.brandMark}>B</span>
              <span className={styles.brand} style={{ color: '#ffffff' }}>
                BUY<span>IN</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 320, lineHeight: 1.65 }}>
              Real Estate Buyer Requirement Network. Exclusive 20-day claim ownership, masked pre-claim privacy, and transparent wallet-based lead claiming.
            </p>
          </div>

          <div>
            <div className={styles.footerHeading}>Platform</div>
            <div className={styles.footerLinks}>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="/for-professionals">For Professionals</Link>
              <Link href="/lead-claiming">Lead Claiming Process</Link>
              <Link href="/pricing">Wallet & Pricing</Link>
            </div>
          </div>

          <div>
            <div className={styles.footerHeading}>Company</div>
            <div className={styles.footerLinks}>
              <Link href="/about">About BUYIN</Link>
              <Link href="/faqs">FAQs</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <div className={styles.footerHeading}>Legal</div>
            <div className={styles.footerLinks}>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} BUYIN Real Estate Buyer Requirement Network. All rights reserved.</span>
          <span>Built exclusively for verified real-estate professionals.</span>
        </div>
      </div>
    </footer>
  );
}