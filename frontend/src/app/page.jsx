import Link from 'next/link';
import styles from '../styles/site.module.css';

const STATS = [
  { value: '1 Owner', label: 'Exclusive lock per active buyer requirement' },
  { value: '20 + 7 Days', label: 'Ownership window with 25% point extension' },
  { value: '95% Refund', label: 'Admin-reviewed protection on invalid leads' },
  { value: 'Rs. 500', label: 'Flexible Razorpay wallet start, no lock-in' },
];

const STEPS = [
  {
    num: '01',
    title: 'Verify Your Profile',
    text: 'Register as a real-estate professional and complete quick identity & RERA/agency verification.',
  },
  {
    num: '02',
    title: 'Add Wallet Points',
    text: 'Recharge securely via Razorpay starting at Rs. 500, or pick a bonus package for extra points.',
  },
  {
    num: '03',
    title: 'Claim Exclusively',
    text: 'Review masked budget, locality, and urgency in the Lead Pool. Claim to unlock full buyer contact.',
  },
  {
    num: '04',
    title: 'Close or Extend',
    text: 'Track follow-ups and site visits for 20 days. Need more time? Extend by 7 days at 25% cost.',
  },
];

const PACKAGES = [
  {
    name: 'Starter',
    amount: 'Rs. 500',
    points: '500 Claim Points',
    featured: false,
    items: [
      'Instant Razorpay credit',
      'Full access to masked Lead Pool',
      '20-day exclusive claim ownership',
      'Immutable wallet ledger receipt',
    ],
  },
  {
    name: 'Pro Growth',
    amount: 'Rs. 2,000',
    points: '2,150 Claim Points (+150 Bonus)',
    featured: true,
    items: [
      '2,000 base + 150 free bonus points',
      'Priority value for active brokers',
      '20-day ownership + 7-day extension',
      '95% invalid-lead refund protection',
    ],
  },
  {
    name: 'Standard',
    amount: 'Rs. 1,000',
    points: '1,000 Claim Points',
    featured: false,
    items: [
      'Instant Razorpay credit',
      'Zero monthly subscription fees',
      'Points never expire unexpectedly',
      'Full refund review eligibility',
    ],
  },
];

const ROLES = [
  'Independent Property Consultants',
  'RERA Registered Brokers',
  'Channel Partner Teams',
  'Developer Sales Advisors',
  'NRI Investment Specialists',
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Verified Real Estate Buyer Requirement Network
              </span>
              <h1 className={styles.heroTitle}>
                Claim Verified Buyer Requirements.{' '}
                <span className={styles.heroAccent}>Own Every Lead Exclusively.</span>
              </h1>
              <p className={styles.heroSub}>
                BUYIN is not a noisy listing portal or shared broker directory. It is a controlled buyer requirement pool where one verified real-estate professional owns each requirement at a time.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Get Started Free -&gt;
                </Link>
                <Link href="/how-it-works" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  How It Works
                </Link>
                <Link href="/login" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Professional Login
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero shared-lead competition
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Masked PII before claim
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Pay-as-you-go Razorpay wallet
                </span>
              </div>
            </div>

            {/* Live Masked Lead Preview */}
            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Lead Pool Preview</span>
                <span className={styles.previewStatus}>Available to Claim</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>3 BHK Luxury Apartment</div>
                    <div className={styles.previewLoc}>Golf Course Ext. Rd, Gurugram</div>
                  </div>
                  <span className={styles.previewPts}>120 pts</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Budget Range</div>
                    <div className={styles.previewMetaVal}>Rs. 2.4 Cr - 2.8 Cr</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Buying Timeline</div>
                    <div className={styles.previewMetaVal}>Immediate (30 Days)</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Financing</div>
                    <div className={styles.previewMetaVal}>Pre-Approved Loan</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Ownership Lock</div>
                    <div className={styles.previewMetaVal}>20 Days Exclusive</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>R**** S****</strong> &bull; +91 98*** ***42
                  </div>
                  <span className={styles.previewMaskedBadge}>Masked</span>
                </div>

                <div className={styles.previewCta}>
                  <span>Claim to Unlock Full Contact</span>
                  <span>-&gt;</span>
                </div>
              </div>

              <div className={styles.previewFoot}>
                <span>Atomic single-owner lock</span>
                <span>95% invalid-lead refund shield</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Metrics Strip */}
      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {STATS.map((item) => (
              <div key={item.label} className={styles.statItem}>
                <div className={styles.statValue}>{item.value}</div>
                <div className={styles.statLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Why BUYIN</span>
            <h2 className={styles.sectionTitle}>Built for High-Intent Closures, Not Cold Calling</h2>
            <p className={styles.sectionSub}>
              Every buyer requirement on BUYIN is governed by strict single-owner exclusivity, transparent point pricing, and auditable refund protection.
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
              <h3 className={styles.cardTitle}>One Active Owner Per Lead</h3>
              <p className={styles.cardText}>
                Atomic claiming locks the requirement exclusively to your dashboard. No two brokers ever compete on the same active buyer.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>20-Day Lock + 7-Day Extension</h3>
              <p className={styles.cardText}>
                Work your buyer calmly with built-in follow-up logs and site-visit tracking. Need extra closing time? Extend 7 days for 25% of claim points.
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
                Encounter a duplicate or unreachable contact? Submit proof for admin review and receive a 95% point refund back to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Simple Workflow</span>
            <h2 className={styles.sectionTitle}>From Sign-Up to Site Visit in Four Steps</h2>
            <p className={styles.sectionSub}>
              No annual contracts or complex onboarding. Pay only for the exact buyer requirements that match your inventory.
            </p>
          </div>

          <div className={styles.grid4}>
            {STEPS.map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>The BUYIN Difference</span>
            <h2 className={styles.sectionTitle}>Stop Competing Against 10 Brokers on the Same Call</h2>
            <p className={styles.sectionSub}>
              See how BUYIN replaces noisy lead-sharing portals with a calm, high-trust closing environment.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.compareCard}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeMuted}`}>
                Traditional Property Portals
              </span>
              <h3 className={styles.cardTitle}>Shared Leads &amp; Subscription Drain</h3>
              <ul className={styles.compareList}>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>Same buyer phone number sold to 8 to 15 competing brokers</span>
                </li>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>Heavy upfront quarterly or annual subscription lock-ins</span>
                </li>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>Zero refund recourse for fake, broker, or unreachable inquiries</span>
                </li>
                <li>
                  <span className={styles.markBad}>x</span>
                  <span>Buyers stop answering calls after getting spammed in minutes</span>
                </li>
              </ul>
            </div>

            <div className={styles.compareCardHighlight}>
              <span className={`${styles.compareBadge} ${styles.compareBadgeBlue}`}>
                BUYIN Requirement Network
              </span>
              <h3 className={styles.cardTitle} style={{ color: '#ffffff' }}>
                Exclusive Ownership &amp; Transparent Points
              </h3>
              <ul className={styles.compareList} style={{ color: '#e2e8f0' }}>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Strictly 1 verified professional owns the requirement for 20 days</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Pay-as-you-go Razorpay wallet starting at Rs. 500 with bonus tiers</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>95% point refund protection with evidence-based admin review</span>
                </li>
                <li>
                  <span className={styles.markGood}>+</span>
                  <span>Preview masked budget, timeline, and locality before claiming</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet & Pricing Preview */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Wallet &amp; Pricing</span>
            <h2 className={styles.sectionTitle}>Transparent Point Packages, Zero Subscriptions</h2>
            <p className={styles.sectionSub}>
              Top up your wallet whenever you need leads. Every recharge and claim is tracked in an immutable ledger.
            </p>
          </div>

          <div className={styles.grid3}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={pkg.featured ? styles.priceCardFeatured : styles.priceCard}
              >
                {pkg.featured && <span className={styles.popularTag}>Best Value</span>}
                <div>
                  <h3 className={styles.cardTitle}>{pkg.name}</h3>
                  <div className={styles.priceAmount}>{pkg.amount}</div>
                  <div className={styles.pricePoints}>{pkg.points}</div>
                  <ul className={styles.priceList}>
                    {pkg.items.map((line) => (
                      <li key={line}>+ {line}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/get-started"
                  className={pkg.featured ? styles.btnPrimary : styles.btnSecondary}
                  style={{ width: '100%' }}
                >
                  Choose {pkg.name}
                </Link>
              </div>
            ))}
          </div>

          <p className={styles.customNote}>
            Need a custom amount? Recharge any value from Rs. 500 at 0.9 pts/Rs.{' '}
            <Link href="/pricing">View full pricing rules -&gt;</Link>
          </p>
        </div>
      </section>

      {/* Audience & CTA Banner */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>Who Uses BUYIN</span>
            <h2 className={styles.sectionTitle}>Built for Serious Real-Estate Closers</h2>
            <div className={styles.pillRow}>
              {ROLES.map((role) => (
                <span key={role} className={styles.rolePill}>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to claim your next high-intent buyer?</h2>
              <p className={styles.ctaSub}>
                Create your verified professional account in minutes and browse live masked buyer requirements in the Lead Pool.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Create Account -&gt;
              </Link>
              <Link href="/contact" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Talk to Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}