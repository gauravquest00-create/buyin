import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Privacy Policy - BUYIN',
  description:
    'Learn how BUYIN protects buyer contact privacy, stores KYC and refund evidence in private authenticated storage, and processes payments securely through Razorpay.',
};

const PRIVACY_STATS = [
  { value: 'Masked PII', label: 'Buyer contact hidden until authorized claim' },
  { value: 'Private Cloud', label: 'Authenticated signed access for KYC & proof' },
  { value: 'Zero Card Data', label: 'Card & UPI credentials never touch BUYIN' },
  { value: 'Audited Logs', label: 'Immutable tracking of access & ledger events' },
];

const POLICY_SECTIONS = [
  {
    num: '01',
    title: 'Buyer Requirement Masking & Controlled Access',
    text: 'BUYIN protects buyer and real-estate professional privacy by masking buyer name, phone number, and email until a verified professional completes an authorized claim. Only the single active owner of a claim can view unmasked buyer details during their valid ownership window.',
  },
  {
    num: '02',
    title: 'Private Storage for KYC & Refund Evidence',
    text: 'Professional verification documents (such as identity and RERA credentials) and refund dispute evidence are stored in private, authenticated cloud storage. Files are served only via short-lived signed access for authorized review and are never exposed through unrestricted public URLs.',
  },
  {
    num: '03',
    title: 'Payment Processing & Financial Records',
    text: 'Wallet recharges are processed securely by Razorpay. BUYIN never stores credit card numbers, debit card numbers, CVV codes, or raw banking credentials. We retain only verified payment references, order IDs, and immutable wallet ledger entries for accounting and audit transparency.',
  },
  {
    num: '04',
    title: 'Information Collected From Professionals',
    text: 'When you register on BUYIN, we collect your name, work email, OTP-verified mobile number, professional KYC or agency details, preferred operating cities, and in-platform activity logs (such as claims, follow-up notes, site visits, and support tickets) strictly to operate the network.',
  },
  {
    num: '05',
    title: 'Account Security & Session Isolation',
    text: 'BUYIN uses strong password hashing, HTTP-only authentication cookies, CSRF protection, and strict session isolation. You can view and revoke your active login sessions at any time from your Profile settings inside the Dashboard.',
  },
  {
    num: '06',
    title: 'Retention, Compliance & Privacy Requests',
    text: 'Immutable wallet transactions and audit records are retained for financial integrity and dispute resolution. For account updates, data access inquiries, or privacy questions, contact our team through the official BUYIN Contact page.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Legal &amp; Data Protection
              </span>
              <h1 className={styles.heroTitle}>
                Privacy Policy &amp;{' '}
                <span className={styles.heroAccent}>Data Security Commitments.</span>
              </h1>
              <p className={styles.heroSub}>
                Privacy is built into the core architecture of BUYIN—from masked pre-claim buyer records and private KYC storage to zero raw payment-card retention.
              </p>

              <div className={styles.heroActions}>
                <Link href="/terms" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Terms &amp; Conditions
                </Link>
                <Link href="/contact" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Contact Privacy Desk
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Masked buyer PII
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Private signed storage
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Razorpay secure billing
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Security Architecture</span>
                <span className={styles.previewStatus}>Privacy First</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Data Protection Controls</div>
                    <div className={styles.previewLoc}>Enforced across all BUYIN applications</div>
                  </div>
                  <span className={styles.previewPts}>Protected</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Buyer Contact PII</div>
                    <div className={styles.previewMetaVal}>Masked Pre-Claim</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>KYC &amp; Evidence</div>
                    <div className={styles.previewMetaVal}>Private Signed URLs</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Card / UPI Data</div>
                    <div className={styles.previewMetaVal}>Razorpay Only</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Session Control</div>
                    <div className={styles.previewMetaVal}>HTTP-Only + CSRF</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Zero Public Exposure:</strong> Documents never use open URLs
                  </div>
                  <span className={styles.previewMaskedBadge}>Verified</span>
                </div>

                <Link href="/contact" className={styles.previewCta}>
                  <span>Questions? Reach Our Team</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>Strict user/admin isolation</span>
                <span>Immutable audit logging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {PRIVACY_STATS.map((item) => (
              <div key={item.label} className={styles.statItem}>
                <div className={styles.statValue}>{item.value}</div>
                <div className={styles.statLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Policy Clauses</span>
            <h2 className={styles.sectionTitle}>How BUYIN Handles Your Information</h2>
            <p className={styles.sectionSub}>
              Clear, plain-language commitments covering buyer records, verification files, payments, and account security.
            </p>
          </div>

          <div className={styles.grid2}>
            {POLICY_SECTIONS.map((clause) => (
              <div key={clause.num} className={styles.stepCard} style={{ background: '#ffffff' }}>
                <span className={styles.stepNum}>{clause.num}</span>
                <h3 className={styles.cardTitle}>{clause.title}</h3>
                <p className={styles.cardText}>{clause.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Have a privacy or data-security question?</h2>
              <p className={styles.ctaSub}>
                Contact our support team for questions about your account data, verification documents, or platform policies.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/contact" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Contact Support -&gt;
              </Link>
              <Link href="/terms" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Read Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}