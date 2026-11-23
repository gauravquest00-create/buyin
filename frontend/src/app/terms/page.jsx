import Link from 'next/link';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Terms & Conditions - BUYIN',
  description:
    'Official Terms & Conditions governing verified real-estate professional accounts, wallet points, 20-day exclusive lead ownership, extensions, and 95% refund reviews on BUYIN.',
};

const TERMS_STATS = [
  { value: 'Verified Only', label: 'OTP & KYC vetted professionals can claim' },
  { value: '20 + 7 Days', label: 'Exclusive ownership plus 1x 25% extension' },
  { value: '95% Credit', label: 'Approved invalid-lead refund (5% deduction)' },
  { value: '0% Cut', label: 'BUYIN never claims brokerage commission' },
];

const TERMS_CLAUSES = [
  {
    num: '01',
    title: 'Verified Professional Eligibility',
    text: 'Only verified real-estate professionals who complete mobile OTP verification and required KYC or RERA onboarding may claim buyer requirements using BUYIN wallet points. Account sharing or resale of unlocked buyer details is strictly prohibited.',
  },
  {
    num: '02',
    title: 'Exclusive Ownership & 7-Day Extension',
    text: 'Each claimed buyer requirement grants exclusive single-owner access for 20 days from claim confirmation. Before expiry, active claims may be extended once by 7 additional days for 25% of the original claim points.',
  },
  {
    num: '03',
    title: 'Expired Returns & Permanent Closures',
    text: 'Unclosed expired leads automatically return to the shared BUYIN pool while preserving status history, remarks, and site-visit logs. Deals marked closed are archived permanently and never automatically return to the pool.',
  },
  {
    num: '04',
    title: 'Refund Review Hold & 95% Credit Policy',
    text: 'Professionals may submit evidence-backed refund requests for invalid or duplicate buyer contacts. Eligible disputes enter REVIEW_HOLD (pausing expiry), and admin-approved refunds credit 95% of original claim points (nearest whole point; 5% platform deduction) back to the wallet ledger.',
  },
  {
    num: '05',
    title: 'Wallet Recharges & Immutable Pricing Snapshots',
    text: 'Wallet recharges are processed via Razorpay (preset packages or custom amounts starting at Rs. 500 at 0.9 points per rupee). Claim point costs are locked via an immutable pricing snapshot at confirmation and recorded permanently in your wallet ledger.',
  },
  {
    num: '06',
    title: 'Professional Conduct & Enforcement',
    text: 'Members must communicate respectfully with homebuyers, keep follow-up statuses accurate, and refrain from spam, misrepresentation, or automated scraping. BUYIN reserves the right to suspend or revoke sessions for policy violations.',
  },
];

export default function TermsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Legal &amp; Platform Governance
              </span>
              <h1 className={styles.heroTitle}>
                Terms &amp; Conditions of the{' '}
                <span className={styles.heroAccent}>BUYIN Professional Network.</span>
              </h1>
              <p className={styles.heroSub}>
                Clear, fair operating rules covering professional verification, atomic 20-day claim ownership, wallet recharges, and evidence-based refund reviews.
              </p>

              <div className={styles.heroActions}>
                <Link href="/privacy-policy" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Privacy Policy
                </Link>
                <Link href="/lead-claiming" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Lead Claiming Rules
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Software-enforced exclusivity
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Immutable pricing snapshots
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Fair 95% refund shield
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Key Agreement Terms</span>
                <span className={styles.previewStatus}>Plain Language</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Platform Rules at a Glance</div>
                    <div className={styles.previewLoc}>Applies to all verified BUYIN accounts</div>
                  </div>
                  <span className={styles.previewPts}>Active</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Claim Window</div>
                    <div className={styles.previewMetaVal}>20 Days Exclusive</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Extension Limit</div>
                    <div className={styles.previewMetaVal}>+7 Days (1x, 25%)</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Approved Refund</div>
                    <div className={styles.previewMetaVal}>95% Wallet Credit</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Brokerage Cut</div>
                    <div className={styles.previewMetaVal}>0% Commission</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Dispute Hold:</strong> Expiry pauses during admin review
                  </div>
                  <span className={styles.previewMaskedBadge}>Fair Rule</span>
                </div>

                <Link href="/contact" className={styles.previewCta}>
                  <span>Questions About These Terms?</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>No hidden auto-renewals</span>
                <span>Auditable wallet ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {TERMS_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Official Clauses</span>
            <h2 className={styles.sectionTitle}>Terms &amp; Conditions</h2>
            <p className={styles.sectionSub}>
              By creating an account or claiming buyer requirements on BUYIN, you agree to the platform rules below.
            </p>
          </div>

          <div className={styles.grid2}>
            {TERMS_CLAUSES.map((clause) => (
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
              <h2 className={styles.ctaTitle}>Ready to join the BUYIN professional network?</h2>
              <p className={styles.ctaSub}>
                Create your verified account in minutes or reach out to our team if you need clarification on any policy.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Get Started Free -&gt;
              </Link>
              <Link href="/contact" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}