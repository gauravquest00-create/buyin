import Link from 'next/link';
import { getDashboardLoginUrl, getDashboardRegisterUrl } from '../../config/api.js';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Get Started - Join BUYIN',
  description:
    'Register your verified real-estate professional account on BUYIN with mobile OTP verification, KYC onboarding, and pay-as-you-go Razorpay wallet points.',
};

const ONBOARDING_STEPS = [
  {
    num: '01',
    title: 'Register & Verify OTP',
    text: 'Enter your name, work email, and mobile number, then confirm instantly with SMS OTP verification.',
  },
  {
    num: '02',
    title: 'Submit KYC / RERA',
    text: 'Upload your professional verification credentials securely into private authenticated storage for review.',
  },
  {
    num: '03',
    title: 'Add Wallet Points',
    text: 'Recharge via Razorpay starting at Rs. 500 (or grab +150 bonus points on the Rs. 2,000 Pro Pack).',
  },
  {
    num: '04',
    title: 'Claim Exclusively',
    text: 'Filter the masked Lead Pool by city and budget, then lock 20-day single-owner access in one click.',
  },
];

export default function GetStartedPage() {
  const registerUrl = getDashboardRegisterUrl();
  const loginUrl = getDashboardLoginUrl();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Join the BUYIN Professional Network
              </span>
              <h1 className={styles.heroTitle}>
                Get Started on BUYIN in{' '}
                <span className={styles.heroAccent}>Under Two Minutes.</span>
              </h1>
              <p className={styles.heroSub}>
                Register your real-estate professional account, verify your mobile number via OTP, and submit your onboarding credentials on the BUYIN Dashboard.
              </p>

              <div className={styles.heroActions}>
                <a href={registerUrl} className={`${styles.btnPrimary} ${styles.btnLg}`}>
                  Create Professional Account -&gt;
                </a>
                <a href={loginUrl} className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Already Have an Account? Login
                </a>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Free account registration
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Zero monthly subscriptions
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> 95% invalid-lead refund shield
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Quick Onboarding Checklist</span>
                <span className={styles.previewStatus}>Free Sign-Up</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>What Happens Next</div>
                    <div className={styles.previewLoc}>On the BUYIN Professional Dashboard</div>
                  </div>
                  <span className={styles.previewPts}>~2 Min</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 1</div>
                    <div className={styles.previewMetaVal}>Mobile OTP Check</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 2</div>
                    <div className={styles.previewMetaVal}>KYC / RERA Upload</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 3</div>
                    <div className={styles.previewMetaVal}>Rs. 500+ Wallet Pack</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Step 4</div>
                    <div className={styles.previewMetaVal}>20-Day Lead Claims</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Zero Brokerage Cut:</strong> Keep 100% of every deal you close
                  </div>
                  <span className={styles.previewMaskedBadge}>100% Yours</span>
                </div>

                <a href={registerUrl} className={styles.previewCta}>
                  <span>Proceed to Registration</span>
                  <span>-&gt;</span>
                </a>
              </div>

              <div className={styles.previewFoot}>
                <span>Private signed KYC storage</span>
                <span>Razorpay verified recharges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Fast Setup</span>
            <h2 className={styles.sectionTitle}>Four Steps to Your First Exclusive Lead</h2>
            <p className={styles.sectionSub}>
              No lengthy sales calls or annual lock-ins—verify your profile, top up when ready, and claim only the buyers that match your inventory.
            </p>
          </div>

          <div className={styles.grid4}>
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.num} className={styles.stepCard} style={{ background: '#ffffff' }}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Have questions before creating your account?</h2>
              <p className={styles.ctaSub}>
                Review our transparent wallet pricing, read frequently asked questions, or message our onboarding team directly.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a href={registerUrl} className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Create Professional Account -&gt;
              </a>
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