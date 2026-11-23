import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'How It Works - BUYIN',
  description:
    'Six transparent steps from verified professional onboarding and Razorpay wallet recharge to exclusive 20-day buyer requirement ownership on BUYIN.',
};

const QUICK_STATS = [
  { value: 'OTP + KYC', label: 'Verified real-estate professionals only' },
  { value: '20 Days', label: 'Exclusive single-owner claim window' },
  { value: '+7 Days', label: 'One-time extension at 25% of claim points' },
  { value: '95% Refund', label: 'Admin-reviewed credit for invalid leads' },
];

const STEPS = [
  {
    num: '01',
    title: 'Register & Verify',
    text: 'Sign up with mobile OTP verification and complete professional KYC or RERA onboarding so every member in the network is vetted.',
  },
  {
    num: '02',
    title: 'Recharge Wallet',
    text: 'Add claim points transparently via Razorpay packages (Rs. 500, Rs. 1,000, Rs. 2,000 + bonus) or custom recharge starting at Rs. 500.',
  },
  {
    num: '03',
    title: 'Browse Masked Pool',
    text: 'Filter genuine buyer requirements by city, location, budget band, property type, seriousness, and visit status before spending points.',
  },
  {
    num: '04',
    title: 'Claim & Unlock',
    text: 'Spend configured claim points to lock exclusive 20-day ownership and instantly unlock full buyer contact details and requirement notes.',
  },
  {
    num: '05',
    title: 'Work, Extend or Close',
    text: 'Log follow-ups, schedule site visits, extend by 7 days at 25% cost if needed, and close deals permanently with zero brokerage split.',
  },
  {
    num: '06',
    title: 'Return or Refund',
    text: 'Unclosed expired requirements return cleanly to the pool. Invalid or duplicate leads qualify for 95% admin-reviewed point refunds.',
  },
];

const LIFECYCLE_ROWS = [
  {
    stage: 'Initial Claim',
    window: '20 Days',
    points: '100% of Lead Points',
    behavior: 'Atomic lock removes the requirement from the public pool and unlocks full buyer contact details.',
  },
  {
    stage: 'Optional Extension',
    window: '+7 Days (Max 1x)',
    points: '25% of Original Points',
    behavior: 'Extends active exclusive ownership without releasing the buyer back to other professionals.',
  },
  {
    stage: 'Refund Review Hold',
    window: 'Until Admin Decision',
    points: '5% Deduction / 95% Credit',
    behavior: 'Pauses expiry while evidence is reviewed; approved claims credit 95% (nearest whole point).',
  },
  {
    stage: 'Closed Deal',
    window: 'Permanent',
    points: 'No Extra Commission',
    behavior: 'BUYIN never takes a brokerage cut. Mark the requirement closed to archive it permanently.',
  },
  {
    stage: 'Expired Claim',
    window: 'After 20 (or 27) Days',
    points: 'Non-Refundable',
    behavior: 'Ownership releases automatically and the requirement returns to the pool if still active.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                End-to-End Requirement Lifecycle
              </span>
              <h1 className={styles.heroTitle}>
                Six Transparent Steps From{' '}
                <span className={styles.heroAccent}>Onboarding to Deal Closure.</span>
              </h1>
              <p className={styles.heroSub}>
                Every buyer requirement on BUYIN follows a strict, auditable workflow designed to eliminate broker overlap, protect buyer privacy, and keep every wallet point accounted for.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Create Your Professional Account -&gt;
                </Link>
                <Link href="/pricing" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  View Wallet &amp; Pricing
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero brokerage commission
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Atomic single-owner lock
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Immutable wallet ledger
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Claim Lifecycle Snapshot</span>
                <span className={styles.previewStatus}>100% Exclusive</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Atomic Ownership Flow</div>
                    <div className={styles.previewLoc}>Masked Pool -&gt; Exclusive Lock -&gt; Closure</div>
                  </div>
                  <span className={styles.previewPts}>20d + 7d</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 1 - Pre-Claim</div>
                    <div className={styles.previewMetaVal}>Masked Buyer PII</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 2 - Claimed</div>
                    <div className={styles.previewMetaVal}>Full Contact Unlocked</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 3 - Extension</div>
                    <div className={styles.previewMetaVal}>+7 Days at 25% Pts</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 4 - Protection</div>
                    <div className={styles.previewMetaVal}>95% Refund Shield</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Review Hold:</strong> Expiry pauses during refund review
                  </div>
                  <span className={styles.previewMaskedBadge}>Protected</span>
                </div>

                <Link href="/get-started" className={styles.previewCta}>
                  <span>Start Browsing Masked Pool</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>No subscriptions or lock-ins</span>
                <span>Razorpay verified recharge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {QUICK_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Step-by-Step Guide</span>
            <h2 className={styles.sectionTitle}>How BUYIN Works</h2>
            <p className={styles.sectionSub}>
              Six transparent steps from professional onboarding to deal closure.
            </p>
          </div>

          <div className={styles.grid3}>
            {STEPS.map((step) => (
              <div key={step.num} className={styles.stepCard} style={{ background: '#ffffff' }}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Privacy &amp; Exclusivity</span>
            <h2 className={styles.sectionTitle}>What You See Before vs. After Claiming</h2>
            <p className={styles.sectionSub}>
              Evaluate deal fit with zero risk in the masked Lead Pool, then unlock full buyer access exclusively when you claim.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.compareCard}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeMuted}`}>
                Before Claiming (Lead Pool)
              </span>
              <h3 className={styles.cardTitle}>Masked Requirement Preview</h3>
              <ul className={styles.compareList}>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>City, preferred micro-market, and property category</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Verified budget band, buying timeline, and loan readiness</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Exact claim point cost displayed upfront before you click</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Buyer name, phone number, and email remain strictly masked</span>
                </li>
              </ul>
            </div>

            <div className={styles.compareCardHighlight}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeBlue}`}>
                After Claiming (My Leads CRM)
              </span>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff' }}>
                Full Contact &amp; 20-Day Exclusive Workspace
              </h3>
              <ul className={styles.compareList} style={{ color: '#e2e8f0' }}>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Instant unlock of full buyer name, mobile number, and email</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Requirement disappears from the pool for all other brokers</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Built-in follow-up notes, status pipeline, and site-visit scheduler</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>One-click +7-day extension (25% pts) or 95% refund request</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>System Rules</span>
            <h2 className={styles.sectionTitle}>Ownership, Extension &amp; Refund Rules</h2>
            <p className={styles.sectionSub}>
              Clear, software-enforced rules so you always know how your points and active claims are handled.
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Window / Limit</th>
                  <th>Point Rule</th>
                  <th>How BUYIN Handles It</th>
                </tr>
              </thead>
              <tbody>
                {LIFECYCLE_ROWS.map((row) => (
                  <tr key={row.stage}>
                    <td>
                      <strong>{row.stage}</strong>
                    </td>
                    <td>{row.window}</td>
                    <td>{row.points}</td>
                    <td>{row.behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to claim your first exclusive requirement?</h2>
              <p className={styles.ctaSub}>
                Create your verified professional account in minutes and explore live masked buyer requirements in the Lead Pool.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Create Your Professional Account -&gt;
              </Link>
              <Link href="/lead-claiming" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Lead Claiming Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}