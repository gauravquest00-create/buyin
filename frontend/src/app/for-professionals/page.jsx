import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'For Real Estate Professionals - BUYIN',
  description:
    'Built for independent consultants, RERA-registered brokers, and channel partners. Zero lead duplication, atomic 20-day ownership, and immutable wallet transparency.',
};

const PRO_STATS = [
  { value: '0% Cut', label: 'Keep 100% of your brokerage commission' },
  { value: '1 Broker', label: 'Strict single-owner lock per active lead' },
  { value: '100% Clear', label: 'Exact balance preview before every claim' },
  { value: '20 + 7 Days', label: 'Calm closing window with built-in CRM' },
];

const PERSONAS = [
  {
    num: '01',
    title: 'Independent Consultants',
    text: 'Stop paying heavy portal subscriptions. Recharge only when you have bandwidth and claim buyers matching your exact inventory.',
  },
  {
    num: '02',
    title: 'RERA-Registered Brokers',
    text: 'Build higher buyer trust when you are the sole professional calling them instead of the tenth broker in an hour.',
  },
  {
    num: '03',
    title: 'Channel Partner Teams',
    text: 'Target specific micro-markets, budget bands, and loan-ready buyers with predictable point costs and auditable receipts.',
  },
  {
    num: '04',
    title: 'Developer & NRI Advisors',
    text: 'Focus on high-intent luxury and investment requirements with transparent timelines, follow-up tracking, and site-visit logs.',
  },
];

export default function ForProfessionalsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                For Verified Real Estate Professionals
              </span>
              <h1 className={styles.heroTitle}>
                Built for Serious Real-Estate{' '}
                <span className={styles.heroAccent}>Closers &amp; Advisors.</span>
              </h1>
              <p className={styles.heroSub}>
                Whether you are an independent consultant, RERA-registered broker, or channel partner, BUYIN protects your time, reputation, and capital with exclusive buyer ownership.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Join BUYIN Network -&gt;
                </Link>
                <Link href="/login" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Professional Login
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero brokerage split
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero shared-lead spam
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> 95% invalid-lead refund shield
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Professional Workspace</span>
                <span className={styles.previewStatus}>Verified Partner</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Your Exclusive Deal Desk</div>
                    <div className={styles.previewLoc}>Lead Pool + My Leads CRM + Wallet Ledger</div>
                  </div>
                  <span className={styles.previewPts}>1,250 pts</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Ownership Lock</div>
                    <div className={styles.previewMetaVal}>20 Days Exclusive</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Pre-Claim Check</div>
                    <div className={styles.previewMetaVal}>Exact Balance Preview</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Pipeline Tools</div>
                    <div className={styles.previewMetaVal}>Follow-ups &amp; Visits</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Dispute Shield</div>
                    <div className={styles.previewMetaVal}>95% Point Refund</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Ledger Audit:</strong> Every debit, credit &amp; refund logged
                  </div>
                  <span className={styles.previewMaskedBadge}>CSV Ready</span>
                </div>

                <Link href="/get-started" className={styles.previewCta}>
                  <span>Open Your Professional Account</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>KYC &amp; RERA verified network</span>
                <span>Razorpay instant top-ups</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {PRO_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Core Protections</span>
            <h2 className={styles.sectionTitle}>Designed to Protect Your Effort &amp; Capital</h2>
            <p className={styles.sectionSub}>
              Every technical and financial rule in BUYIN is engineered around fairness for working real-estate professionals.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Zero Lead Duplication</h3>
              <p className={styles.cardText}>
                Database-level atomic claiming ensures nobody else can claim your active buyer requirement during your 20-day exclusive window.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Immutable Wallet Transparency</h3>
              <p className={styles.cardText}>
                See your exact current balance, point deduction, and expected remaining balance before confirming any claim or 7-day extension.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Built-In Follow-Up &amp; Visit CRM</h3>
              <p className={styles.cardText}>
                Track every buyer status update, remark, follow-up reminder, and site visit inside one fast workspace without juggling spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Who It Is For</span>
            <h2 className={styles.sectionTitle}>Tailored for Every Real-Estate Sales Model</h2>
            <p className={styles.sectionSub}>
              Whether you close solo or run a high-velocity channel partner desk, BUYIN adapts to your target cities and ticket sizes.
            </p>
          </div>

          <div className={styles.grid4}>
            {PERSONAS.map((item) => (
              <div key={item.num} className={styles.stepCard}>
                <span className={styles.stepNum}>{item.num}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Fast Onboarding</span>
            <h2 className={styles.sectionTitle}>Simple Verification, Immediate Access</h2>
            <p className={styles.sectionSub}>
              We verify every member to keep the network professional, clean, and trustworthy for both buyers and brokers.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.compareCard}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeMuted}`}>
                What You Need to Join
              </span>
              <h3 className={styles.cardTitle}>Quick Professional Verification</h3>
              <ul className={styles.compareList}>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Active mobile number with instant SMS OTP verification</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Professional profile with KYC / RERA or agency details</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Your operating cities, localities, and preferred property types</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Flexible Razorpay wallet recharge starting from Rs. 500</span>
                </li>
              </ul>
            </div>

            <div className={styles.compareCardHighlight}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeBlue}`}>
                What You Unlock
              </span>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff' }}>
                Full BUYIN Dashboard Suite
              </h3>
              <ul className={styles.compareList} style={{ color: '#e2e8f0' }}>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Live masked Lead Pool filtered to your discovery preferences</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>One-click atomic claiming with instant buyer phone &amp; email unlock</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Dedicated My Leads pipeline, +7-day extension, and refund requests</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Complete wallet ledger with downloadable CSV transaction history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to join the BUYIN professional network?</h2>
              <p className={styles.ctaSub}>
                Register in minutes, verify your profile, and start claiming exclusive high-intent buyer requirements in your city.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Join BUYIN Network -&gt;
              </Link>
              <Link href="/pricing" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                View Wallet &amp; Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}