import Link from 'next/link';
import { fetchPublicRechargePackages } from '../../services/apiClient.js';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Wallet & Pricing - BUYIN',
  description:
    'Transparent Razorpay wallet packages, custom recharge rates, and buyer budget-band claim-point pricing on BUYIN.',
};

const FALLBACK_PACKAGES = [
  { code: 'PKG_500', name: 'Starter Pack', amountInr: 500, basePoints: 450, bonusPoints: 0, totalPoints: 450 },
  { code: 'PKG_1000', name: 'Growth Pack', amountInr: 1000, basePoints: 900, bonusPoints: 0, totalPoints: 900 },
  { code: 'PKG_2000', name: 'Pro Bonus Pack', amountInr: 2000, basePoints: 1800, bonusPoints: 150, totalPoints: 1950 },
];

const PRICING_STATS = [
  { value: 'Rs. 500', label: 'Minimum wallet recharge (pack or custom)' },
  { value: '0.9 pts/Rs.', label: 'Transparent base conversion rate' },
  { value: '+150 Bonus', label: 'Extra free points on the Rs. 2,000 pack' },
  { value: '0% Cut', label: 'Zero brokerage split on closed deals' },
];

const BUDGET_BANDS = [
  {
    band: 'Below Rs. 50L',
    points: '120 pts',
    notes: '+ Property type, verified buyer signals & visit premiums',
  },
  {
    band: 'Rs. 50L - Rs. 1Cr',
    points: '180 pts',
    notes: 'Configurable via BUYIN Pricing Engine',
  },
  {
    band: 'Rs. 1Cr - Rs. 2Cr',
    points: '260 pts',
    notes: 'Immutable pricing snapshot locked at claim time',
  },
  {
    band: 'Rs. 2Cr - Rs. 5Cr',
    points: '380 pts',
    notes: 'Includes 20-day exclusive single-owner lock',
  },
  {
    band: 'Rs. 5Cr - Rs. 10Cr',
    points: '550 pts',
    notes: 'Extendable +7 days for 25% of original cost',
  },
  {
    band: 'Rs. 10Cr+',
    points: '750 pts',
    notes: 'High-value luxury & commercial requirements',
  },
];

export default async function PricingPage() {
  const packages = (await fetchPublicRechargePackages()) || FALLBACK_PACKAGES;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Wallet Packages &amp; Claim-Point Pricing
              </span>
              <h1 className={styles.heroTitle}>
                Transparent Point Pricing.{' '}
                <span className={styles.heroAccent}>Zero Monthly Subscriptions.</span>
              </h1>
              <p className={styles.heroSub}>
                Pay only for the exclusive buyer requirements you choose to claim. Recharge securely via Razorpay with preset bonus packs or custom amounts starting at Rs. 500.
              </p>

              <div className={styles.heroActions}>
                <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Recharge in Dashboard -&gt;
                </Link>
                <Link href="/lead-claiming" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Lead Claiming Rules
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Razorpay verified credits
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Immutable wallet ledger
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> 95% invalid-lead refund
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Best Value Pack</span>
                <span className={styles.previewStatus}>+150 Free Points</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>Pro Bonus Pack</div>
                    <div className={styles.previewLoc}>Instant Razorpay Wallet Credit</div>
                  </div>
                  <span className={styles.previewPts}>Rs. 2,000</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Base Points</div>
                    <div className={styles.previewMetaVal}>1,800 pts</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Bonus Points</div>
                    <div className={styles.previewMetaVal}>+150 pts Free</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Total Credited</div>
                    <div className={styles.previewMetaVal}>1,950 pts</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Custom Min</div>
                    <div className={styles.previewMetaVal}>Rs. 500 (0.9/Rs.)</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Security:</strong> Server-side Razorpay signature &amp; webhook check
                  </div>
                  <span className={styles.previewMaskedBadge}>Verified</span>
                </div>

                <Link href="/get-started" className={styles.previewCta}>
                  <span>Create Account &amp; Recharge</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>No recurring auto-debits</span>
                <span>Downloadable CSV ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBand}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {PRICING_STATS.map((item) => (
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
            <span className={styles.eyebrow}>Wallet Recharge Packages</span>
            <h2 className={styles.sectionTitle}>Choose a Recharge Pack or Enter a Custom Amount</h2>
            <p className={styles.sectionSub}>
              Every package credits points immediately after Razorpay verification. Custom recharges start at Rs. 500 (0.9 points per rupee, no bonus).
            </p>
          </div>

          <div className={styles.grid3}>
            {packages.map((pkg) => {
              const isFeatured = (pkg.bonusPoints || 0) > 0;
              return (
                <div
                  key={pkg.code}
                  className={isFeatured ? styles.priceCardFeatured : styles.priceCard}
                >
                  {isFeatured && <span className={styles.popularTag}>Best Value</span>}
                  <div>
                    <h3 className={styles.cardTitle}>{pkg.name}</h3>
                    <div className={styles.priceAmount}>
                      Rs. {Number(pkg.amountInr || 0).toLocaleString()}
                    </div>
                    <div className={styles.pricePoints}>
                      {Number(pkg.totalPoints || 0).toLocaleString()} Total Points
                    </div>
                    <ul className={styles.priceList}>
                      <li>+ {Number(pkg.basePoints || 0).toLocaleString()} base claim points</li>
                      <li>
                        +{' '}
                        {pkg.bonusPoints > 0
                          ? `${Number(pkg.bonusPoints).toLocaleString()} free bonus points included`
                          : 'Standard 0.9 pts/Rs. transparent rate'}
                      </li>
                      <li>+ 20-day exclusive single-owner claims</li>
                      <li>+ 95% admin-reviewed refund eligibility</li>
                    </ul>
                  </div>
                  <Link
                    href="/get-started"
                    className={isFeatured ? styles.btnPrimary : styles.btnSecondary}
                    style={{ width: '100%' }}
                  >
                    Recharge in Dashboard
                  </Link>
                </div>
              );
            })}
          </div>

          <p className={styles.customNote}>
            Want a custom amount? Recharge any value from Rs. 500 at 0.9 points per rupee inside your Wallet.{' '}
            <Link href="/get-started">Open Dashboard Wallet -&gt;</Link>
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Dynamic Pricing Engine</span>
            <h2 className={styles.sectionTitle}>Base Claim Points by Buyer Budget Band</h2>
            <p className={styles.sectionSub}>
              Lead claim points scale transparently with buyer budget, property category, verification strength, and site-visit readiness.
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Buyer Budget Band</th>
                  <th>Base Claim Points</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_BANDS.map((row) => (
                  <tr key={row.band}>
                    <td>
                      <strong>{row.band}</strong>
                    </td>
                    <td>
                      <strong>{row.points}</strong>
                    </td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Financial Safeguards</span>
            <h2 className={styles.sectionTitle}>Every Rupee &amp; Point Fully Accounted For</h2>
            <p className={styles.sectionSub}>
              No surprise deductions, hidden renewals, or opaque billing.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Upfront Balance Preview</h3>
              <p className={styles.cardText}>
                Before claiming a lead or extending ownership by 7 days, BUYIN shows your exact balance before and after the transaction.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>95% Invalid-Lead Refund</h3>
              <p className={styles.cardText}>
                Approved refund disputes credit 95% of your original claim points (nearest whole point) back to your wallet with a 5% platform deduction.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Immutable Transaction Ledger</h3>
              <p className={styles.cardText}>
                Every Razorpay recharge, bonus credit, lead claim, extension, and refund is permanently recorded and exportable to CSV anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to top up your BUYIN wallet?</h2>
              <p className={styles.ctaSub}>
                Sign up in minutes, add claim points via Razorpay, and unlock exclusive 20-day ownership on verified buyer requirements.
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