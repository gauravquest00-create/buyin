import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'FAQs - BUYIN',
  description:
    'Frequently asked questions about BUYIN exclusive buyer requirement claiming, masked pre-claim privacy, 20-day ownership, Razorpay wallet points, and 95% refund protection.',
};

const FAQ_STATS = [
  { value: '1 Owner', label: 'Atomic lock per active buyer requirement' },
  { value: '20 + 7 Days', label: 'Standard validity plus optional extension' },
  { value: 'Rs. 500', label: 'Minimum Razorpay wallet recharge' },
  { value: '95% Credit', label: 'Approved invalid-lead point refund' },
];

const CLAIMING_FAQS = [
  {
    q: 'Can two brokers claim the same buyer requirement?',
    a: 'No. BUYIN enforces single active ownership at the database level using atomic transactions and unique active-claim locking. Once you claim a requirement, it immediately disappears from the pool for everyone else.',
  },
  {
    q: 'Are buyer contact details visible before claiming?',
    a: 'No. Buyer name, mobile number, and email are strictly masked in the Lead Pool until your claim succeeds. You can still inspect city, locality, budget band, property type, timeline, and financing before spending points.',
  },
  {
    q: 'How does the 7-day extension work?',
    a: 'Before your 20-day window expires, you can extend exclusive ownership by 7 additional days for 25% of the original claim points. Each claim allows one extension so you have up to 27 total days to close.',
  },
  {
    q: 'What happens when a 20-day claim expires without closing?',
    a: 'If a requirement is not marked closed or extended before expiry, ownership releases automatically and the requirement returns cleanly to the pool while preserving status history, remarks, and site-visit logs.',
  },
  {
    q: 'Does BUYIN take any brokerage commission on closed deals?',
    a: 'Never. You only spend claim points from your wallet to unlock exclusive buyer ownership. You keep 100% of your deal brokerage, and closed deals are archived permanently so they never return to the pool.',
  },
  {
    q: 'Who can join the BUYIN professional network?',
    a: 'Independent property consultants, RERA-registered brokers, channel partner teams, and developer sales advisors can join after mobile OTP verification and professional KYC onboarding.',
  },
];

const WALLET_FAQS = [
  {
    q: 'What happens if a buyer contact is invalid or duplicate?',
    a: 'Submit a refund request with evidence from your My Leads dashboard. The claim enters REVIEW_HOLD (pausing expiry) while our admin team reviews it, and approved refunds credit 95% of the original claim points (nearest whole point) back to your wallet.',
  },
  {
    q: 'How do wallet recharge packages and custom recharges work?',
    a: 'You can pick preset packs (Rs. 500 for 450 pts, Rs. 1,000 for 900 pts, or Rs. 2,000 for 1,800 base + 150 bonus = 1,950 pts) or enter any custom amount from Rs. 500 at 0.9 points per rupee with no bonus.',
  },
  {
    q: 'When are points credited after a Razorpay payment?',
    a: 'Points are credited immediately after server-side Razorpay signature and webhook verification completes, and every credit is logged in your immutable wallet transaction ledger.',
  },
  {
    q: 'Can I see my exact wallet deduction before confirming a claim?',
    a: 'Yes. Every claim and 7-day extension displays a financial summary box showing your current wallet balance, exact point deduction, and expected remaining balance before you confirm.',
  },
];

export default function FaqsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Help Center &amp; Frequently Asked Questions
              </span>
              <h1 className={styles.heroTitle}>
                Clear Answers About{' '}
                <span className={styles.heroAccent}>Exclusivity, Wallet &amp; Refunds.</span>
              </h1>
              <p className={styles.heroSub}>
                Everything real-estate professionals ask before joining BUYIN—covering atomic single-owner claiming, masked privacy, Razorpay recharges, and 95% refund reviews.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Get Started Free -&gt;
                </Link>
                <Link href="/contact" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Contact Support
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero hidden subscriptions
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Transparent point rules
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Dedicated support tickets
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Quick Policy Summary</span>
                <span className={styles.previewStatus}>Always Transparent</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>BUYIN Core Guarantees</div>
                    <div className={styles.previewLoc}>Enforced automatically by the platform</div>
                  </div>
                  <span className={styles.previewPts}>Verified</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Active Owners</div>
                    <div className={styles.previewMetaVal}>Strictly 1 Broker</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Claim Validity</div>
                    <div className={styles.previewMetaVal}>20 Days (+7d Opt.)</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Min Recharge</div>
                    <div className={styles.previewMetaVal}>Rs. 500 (Razorpay)</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Invalid Refund</div>
                    <div className={styles.previewMetaVal}>95% Point Credit</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Pre-Claim Privacy:</strong> Buyer PII masked until claimed
                  </div>
                  <span className={styles.previewMaskedBadge}>Protected</span>
                </div>

                <Link href="/contact" className={styles.previewCta}>
                  <span>Need Help? Message Support</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>Fast human ticket responses</span>
                <span>In-dashboard support tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {FAQ_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Claiming &amp; Ownership</span>
            <h2 className={styles.sectionTitle}>Lead Pool, Exclusivity &amp; Extensions</h2>
            <p className={styles.sectionSub}>
              How BUYIN protects buyer privacy before claiming and guarantees single-owner focus once you lock a requirement.
            </p>
          </div>

          <div className={styles.grid2}>
            {CLAIMING_FAQS.map((item) => (
              <div key={item.q} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.q}</h3>
                <p className={styles.cardText}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Wallet, Pricing &amp; Refunds</span>
            <h2 className={styles.sectionTitle}>Recharges, Point Math &amp; Dispute Protection</h2>
            <p className={styles.sectionSub}>
              Clear rules covering Razorpay wallet credits, custom recharges, and evidence-based invalid-lead refunds.
            </p>
          </div>

          <div className={styles.grid2}>
            {WALLET_FAQS.map((item) => (
              <div key={item.q} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.q}</h3>
                <p className={styles.cardText}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter} style={{ marginBottom: 28 }}>
            <span className={styles.eyebrow}>Explore Further</span>
            <h2 className={styles.sectionTitle}>Helpful Guides &amp; Policy Pages</h2>
          </div>

          <div className={styles.grid3} style={{ marginBottom: 44 }}>
            <Link href="/how-it-works" className={styles.card}>
              <h3 className={styles.cardTitle}>How It Works -&gt;</h3>
              <p className={styles.cardText}>
                Walk through the 6-step lifecycle from mobile OTP registration to closing deals.
              </p>
            </Link>
            <Link href="/lead-claiming" className={styles.card}>
              <h3 className={styles.cardTitle}>Lead Claiming Rules -&gt;</h3>
              <p className={styles.cardText}>
                Review atomic ownership, 20-day validity, +7-day extensions, and review hold rules.
              </p>
            </Link>
            <Link href="/pricing" className={styles.card}>
              <h3 className={styles.cardTitle}>Wallet &amp; Pricing -&gt;</h3>
              <p className={styles.cardText}>
                Compare Razorpay recharge packages, bonus tiers, and budget-band claim points.
              </p>
            </Link>
          </div>

          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Still have a question for our team?</h2>
              <p className={styles.ctaSub}>
                Reach out through our contact form and we will get back to you promptly with clear answers.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/contact" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Contact Support -&gt;
              </Link>
              <Link href="/get-started" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}