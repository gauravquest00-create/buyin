import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'About BUYIN - Real Estate Buyer Requirement Network',
  description:
    'BUYIN replaces chaotic, multi-sold property leads with a disciplined, exclusive buyer requirement network built for verified real-estate professionals.',
};

const ABOUT_STATS = [
  { value: '100% Exclusive', label: 'Strictly one active owner per requirement' },
  { value: 'Zero Listings', label: 'Pure buyer requirements, never property ad noise' },
  { value: '20 + 7 Days', label: 'Calm closing window with optional extension' },
  { value: '100% Auditable', label: 'Immutable ledger for every wallet transaction' },
];

const PILLARS = [
  {
    num: '01',
    title: 'Buyer Privacy First',
    text: 'Buyer names, phone numbers, and emails stay strictly masked in the pool until a single verified professional claims ownership.',
  },
  {
    num: '02',
    title: 'Enforced Exclusivity',
    text: 'Atomic database locking eliminates race conditions so two brokers never accidentally claim or spam the same active buyer.',
  },
  {
    num: '03',
    title: 'Financial Clarity',
    text: 'Upfront claim-point costs, pre-claim wallet balance previews, Razorpay verification, and zero recurring subscription traps.',
  },
  {
    num: '04',
    title: 'Fair Refund Shield',
    text: 'Invalid or duplicate buyer contacts trigger REVIEW_HOLD protection and qualify for 95% admin-reviewed point refunds.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                About BUYIN
              </span>
              <h1 className={styles.heroTitle}>
                Replacing Shared Lead Chaos With{' '}
                <span className={styles.heroAccent}>Disciplined Buyer Ownership.</span>
              </h1>
              <p className={styles.heroSub}>
                BUYIN replaces chaotic, multi-sold property leads with a disciplined, controlled buyer requirement pool where verified real-estate professionals own every active opportunity exclusively.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Join BUYIN Network -&gt;
                </Link>
                <Link href="/how-it-works" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  See How It Works
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Verified professionals only
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero brokerage split
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Built for deal closures
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Platform Philosophy</span>
                <span className={styles.previewStatus}>Buyer-Intent First</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>BUYIN Network Architecture</div>
                    <div className={styles.previewLoc}>Controlled Access &amp; Full Lifecycle Tracking</div>
                  </div>
                  <span className={styles.previewPts}>1:1 Lock</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Access Control</div>
                    <div className={styles.previewMetaVal}>OTP &amp; KYC Verified</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Core Asset</div>
                    <div className={styles.previewMetaVal}>Buyer Requirements</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Claim Engine</div>
                    <div className={styles.previewMetaVal}>Atomic Single-Owner</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Wallet Ledger</div>
                    <div className={styles.previewMetaVal}>Immutable &amp; Audited</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Zero Overlap:</strong> Buyers get calm, professional outreach
                  </div>
                  <span className={styles.previewMaskedBadge}>Trusted</span>
                </div>

                <Link href="/for-professionals" className={styles.previewCta}>
                  <span>Explore Built-In Protections</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>No property listing clutter</span>
                <span>No open broker directory spam</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {ABOUT_STATS.map((item) => (
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
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Clear Positioning</span>
            <h2 className={styles.sectionTitle}>What BUYIN Is - And What It Is Not</h2>
            <p className={styles.sectionSub}>
              We built BUYIN with sharp boundaries so every record in the platform stays focused on genuine, closable buyer intent.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.compareCardHighlight}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeBlue}`}>
                What BUYIN Is
              </span>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff' }}>
                A Controlled Buyer Requirement Network
              </h3>
              <p style={{ fontSize: 14.5, color: '#cbd5e1', marginTop: 8, lineHeight: 1.65 }}>
                A centralized buyer requirement network with controlled access, wallet-based claiming, atomic single-ownership locks, and full lifecycle tracking.
              </p>
              <ul className={styles.compareList} style={{ color: '#e2e8f0' }}>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Verified real-estate buyer requirements with clear budget &amp; urgency</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Atomic 20-day exclusive ownership with optional +7-day extension</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Pay-as-you-go Razorpay wallet with 95% invalid-lead refund protection</span>
                </li>
              </ul>
            </div>

            <div className={styles.compareCard}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeMuted}`}>
                What BUYIN Is Not
              </span>
              <h3 className={styles.cardTitle}>
                Not a Listing Portal or Broker Directory
              </h3>
              <p className={styles.cardText} style={{ marginTop: 8 }}>
                We are not a traditional CRM, property inventory portal, listing marketplace, or open broker directory. Every record is a real buyer requirement.
              </p>
              <ul className={styles.compareList}>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>No multi-sold buyer phone numbers blasted to 10+ brokers</span>
                </li>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>No property listing ads or paid featured-broker rankings</span>
                </li>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>No brokerage commission splits or hidden subscription lock-ins</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Operating Principles</span>
            <h2 className={styles.sectionTitle}>Four Pillars Behind Every Decision We Make</h2>
            <p className={styles.sectionSub}>
              Software-enforced discipline that protects both homebuyers and verified real-estate professionals.
            </p>
          </div>

          <div className={styles.grid4}>
            {PILLARS.map((item) => (
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
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Built for professionals who take closing seriously.</h2>
              <p className={styles.ctaSub}>
                Create your verified BUYIN account in minutes or get in touch with our team to learn more about agency onboarding.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Get Started Free -&gt;
              </Link>
              <Link href="/contact" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}