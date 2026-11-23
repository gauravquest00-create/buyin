import Link from 'next/link';
import { getDashboardLoginUrl, getDashboardRegisterUrl } from '../../config/api.js';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Login - BUYIN Professional Dashboard',
  description:
    'Sign in to the dedicated BUYIN Professional Dashboard to browse verified buyer requirements, manage exclusive 20-day claims, and recharge your wallet.',
};

export default function LoginRedirectPage() {
  const loginUrl = getDashboardLoginUrl();
  const registerUrl = getDashboardRegisterUrl();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                BUYIN Professional Portal
              </span>
              <h1 className={styles.heroTitle}>
                Sign In to Your{' '}
                <span className={styles.heroAccent}>Professional Dashboard.</span>
              </h1>
              <p className={styles.heroSub}>
                Continue to the dedicated BUYIN Professional Dashboard application to browse masked buyer requirements, manage claimed leads, log site visits, and recharge your wallet.
              </p>

              <div className={styles.heroActions}>
                <a href={loginUrl} className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Continue to BUYIN Dashboard -&gt;
                </a>
                <a href={registerUrl} className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Create New Account
                </a>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> HTTP-only cookie security
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Active session management
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Instant Lead Pool access
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Authenticated Workspace</span>
                <span className={styles.previewStatus}>Ready to Sign In</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>BUYIN Partner Dashboard</div>
                    <div className={styles.previewLoc}>Verified real-estate professionals only</div>
                  </div>
                  <span className={styles.previewPts}>Secure</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Lead Pool</div>
                    <div className={styles.previewMetaVal}>Masked Buyer Pool</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>My Leads</div>
                    <div className={styles.previewMetaVal}>20-Day Exclusive CRM</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Wallet</div>
                    <div className={styles.previewMetaVal}>Razorpay Top-Ups</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Transactions</div>
                    <div className={styles.previewMetaVal}>Immutable CSV Ledger</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>New to BUYIN?</strong> Register with OTP in under 2 minutes
                  </div>
                  <span className={styles.previewMaskedBadge}>Free</span>
                </div>

                <a href={loginUrl} className={styles.previewCta}>
                  <span>Open Professional Login</span>
                  <span>-&gt;</span>
                </a>
              </div>

              <div className={styles.previewFoot}>
                <span>Zero subscriptions or lock-ins</span>
                <span>Need help? Visit Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Inside Your Dashboard</span>
            <h2 className={styles.sectionTitle}>Everything Waiting After You Sign In</h2>
            <p className={styles.sectionSub}>
              One fast workspace for claiming exclusive buyer requirements, managing deal follow-ups, and auditing wallet points.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Live Masked Lead Pool</h3>
              <p className={styles.cardText}>
                Filter verified buyer requirements by city, locality, budget band, property type, and urgency before spending a single point.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>My Leads Exclusive CRM</h3>
              <p className={styles.cardText}>
                Unlock buyer phone and email immediately upon claim, log follow-up calls, schedule site visits, extend by +7 days, or request 95% refunds.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Wallet &amp; Support Desk</h3>
              <p className={styles.cardText}>
                Recharge via Razorpay packages or custom amounts, export CSV transaction receipts, and track support tickets in one place.
              </p>
            </div>
          </div>

          <p className={styles.customNote} style={{ marginTop: 28 }}>
            Having trouble accessing your account?{' '}
            <Link href="/contact">Contact BUYIN Support -&gt;</Link>
          </p>
        </div>
      </section>
    </>
  );
}