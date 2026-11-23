import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Lead Claiming Process - BUYIN',
  description:
    'Complete lead claiming and ownership rules on BUYIN: single active owner, 20-day validity, +7-day extension at 25% cost, and 95% admin-reviewed refund protection.',
};

const CLAIM_STATS = [
  { value: '1 Owner', label: 'Strictly one active owner per requirement' },
  { value: '20 Days', label: 'Standard exclusive claim validity window' },
  { value: '25% Cost', label: 'One-time +7-day ownership extension' },
  { value: '95% Credit', label: 'Admin-reviewed refund for invalid leads' },
];

const POLICY_ROWS = [
  {
    rule: 'Active Ownership',
    policy: 'Strictly 1 active owner per buyer requirement at any time via atomic database locking.',
  },
  {
    rule: 'Standard Validity',
    policy: '20 full days from successful claim confirmation, with instant buyer contact unlock.',
  },
  {
    rule: 'Ownership Extension',
    policy: '+7 additional days for 25% of original claim points (maximum 1 extension per claim).',
  },
  {
    rule: 'Review Hold Protection',
    policy: 'Submitting a refund dispute places the claim on REVIEW_HOLD, pausing expiry until admin review finishes.',
  },
  {
    rule: 'Expired Unclosed Leads',
    policy: 'Automatically return to the shared pool preserving full history, remarks, and site-visit logs.',
  },
  {
    rule: 'Closed Deals',
    policy: 'Archived permanently under your account and never automatically return to the pool.',
  },
  {
    rule: 'Refund Protection',
    policy: 'Admin-reviewed approval credits 95% of original claim points (nearest whole point; 5% platform deduction).',
  },
];

export default function LeadClaimingPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Lead Claiming &amp; Ownership Rules
              </span>
              <h1 className={styles.heroTitle}>
                Atomic Lead Claiming With{' '}
                <span className={styles.heroAccent}>Strictly One Active Owner.</span>
              </h1>
              <p className={styles.heroSub}>
                Every claim on BUYIN is governed by immutable pricing snapshots, upfront wallet balance previews, and software-enforced 20-day ownership timelines.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Start Claiming Leads -&gt;
                </Link>
                <Link href="/pricing" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  View Wallet &amp; Pricing
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Pre-claim balance preview
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Immutable pricing snapshot
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> REVIEW_HOLD expiry protection
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Example Claim Summary</span>
                <span className={styles.previewStatus}>Transparent Math</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Pre-Claim Financial Box</div>
                    <div className={styles.previewLoc}>Shown before every claim confirmation</div>
                  </div>
                  <span className={styles.previewPts}>-120 pts</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Current Balance</div>
                    <div className={styles.previewMetaVal}>1,000 pts</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>After Claim</div>
                    <div className={styles.previewMetaVal}>880 pts</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>+7-Day Extension</div>
                    <div className={styles.previewMetaVal}>30 pts (25%)</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Approved Refund</div>
                    <div className={styles.previewMetaVal}>114 pts (95%)</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Ownership Lock:</strong> 20 days exclusive upon click
                  </div>
                  <span className={styles.previewMaskedBadge}>Atomic</span>
                </div>

                <Link href="/get-started" className={styles.previewCta}>
                  <span>Explore Live Lead Pool</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>No race conditions or double claims</span>
                <span>Logged in immutable wallet ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {CLAIM_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Official Policy</span>
            <h2 className={styles.sectionTitle}>Lead Claiming &amp; Ownership Rules</h2>
            <p className={styles.sectionSub}>
              Every claim is governed by immutable pricing snapshots and strict, software-enforced ownership timelines.
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Policy</th>
                </tr>
              </thead>
              <tbody>
                {POLICY_ROWS.map((row) => (
                  <tr key={row.rule}>
                    <td>
                      <strong>{row.rule}</strong>
                    </td>
                    <td>{row.policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>How Protection Works</span>
            <h2 className={styles.sectionTitle}>Built-In Safeguards for Every Point You Spend</h2>
            <p className={styles.sectionSub}>
              From atomic claim locking to evidence-based refund reviews, every edge case is handled transparently.
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
              <h3 className={styles.cardTitle}>Immutable Pricing Snapshot</h3>
              <p className={styles.cardText}>
                The exact claim point cost is locked the instant you confirm. Future pricing rule updates never change your active claim or extension math.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Simple 25% Extension Rule</h3>
              <p className={styles.cardText}>
                Close to booking a site visit or final token? Extend your active claim once by +7 full days for just 25% of the original claim points.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Fair 95% Refund Shield</h3>
              <p className={styles.cardText}>
                Submit call logs or proof for invalid or duplicate contacts. Expiry pauses under REVIEW_HOLD and approved claims return 95% of your points.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Claim Outcomes</span>
            <h2 className={styles.sectionTitle}>Expired Return vs. Permanent Deal Closure</h2>
            <p className={styles.sectionSub}>
              Clear separation between unclosed leads that cycle back to the pool and closed deals that stay permanently archived.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.compareCard}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeMuted}`}>
                If Unclosed After 20 (or 27) Days
              </span>
              <h3 className={styles.cardTitle}>Clean Return to the Pool</h3>
              <ul className={styles.compareList}>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Ownership releases automatically once the timer ends</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Full status history, remarks, and site-visit logs are preserved</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>+</span>
                  <span>Buyer PII re-masks immediately until the next professional claims</span>
                </li>
              </ul>
            </div>

            <div className={styles.compareCardHighlight}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeBlue}`}>
                When You Close the Deal
              </span>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff' }}>
                Permanent Closure &amp; Zero Split
              </h3>
              <ul className={styles.compareList} style={{ color: '#e2e8f0' }}>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Mark the requirement closed inside your My Leads workspace</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Closed deals never automatically return to the public pool</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Keep 100% of your brokerage commission with zero extra fees</span>
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
              <h2 className={styles.ctaTitle}>Ready to claim verified buyer requirements?</h2>
              <p className={styles.ctaSub}>
                Create your verified professional account and preview live masked buyer requirements before spending a single point.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Get Started Free -&gt;
              </Link>
              <Link href="/faqs" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Read FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}